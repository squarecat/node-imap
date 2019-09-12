async function doRequest(url, params = {}) {
  try {
    const method = params.method || 'GET';
    const response = await fetch(url, {
      method,
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      ...params
    });
    return response;
  } catch (err) {
    throw err;
  }
}

export default async function request(url, params = {}, rawResponse = false) {
  try {
    const response = await doRequest(url, params);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    // let the calling code use the entire response object
    if (rawResponse) {
      return response;
    }

    if (response.status >= 400 && response.status < 600) {
      if (isJson) {
        const err = await response.json();
        throw err;
      }
      throw response.statusText;
    }

    if (isJson) {
      return response.json();
    }

    return response.statusText;
  } catch (err) {
    console.error('request err');
    console.error(err);
    throw err;
  }
}

// // Map data key value pairs to query params when GET request
// function getUrl({ url, params = {}, transformParams = true }) {
//   const query = Object.keys(params)
//     // remove null and undefined values
//     .filter(k => params[k])
//     // map to string "k=v"
//     .map(k =>
//       transformParams
//         ? `${_snakeCase(k)}=${encodeURIComponent(params[k])}`
//         : `${k}=${encodeURIComponent(params[k])}`
//     )
//     // join into k1=v1&k2=v2
//     .join('&');
//   return `${url}?${query}`;
// }
