/* @flow */
import _omit from 'lodash.omit';

/**
 * @name paginated response
 * @description (middleware) add headers to a response to describe pagination
 *   @see {@link https://developer.github.com/v3/guides/traversing-with-pagination/}
 *   @see {@link https://tools.ietf.org/html/rfc5988}
 *
 * @example <caption>Assuming there are 100 skills</caption>
 *
 * GET https://ahead.ai/api/skills?page=3&per_page=20
 *
 * Headers;
 *   Link: <https://ahead.ai/api/skills?page=4&per_page=20>; rel="next",
 *     <https://ahead.ai/api/skills?page=5&per_page=20>; rel="last",
 *     <https://ahead.ai/api/skills?page=1&per_page=20>; rel="first",
 *     <https://ahead.ai/api/skills?page=2&per_page=20>; rel="prev"
 *   Total-count: 120
 */
export default function paginatedResponse(req, res, next) {
  if (res.locals.err) return next();
  const { query } = req;
  const { responseData } = res.locals;
  const { pages, currentPage, list, total } = responseData;
  const queryParams = _omit(query, 'page');
  const url = Object.keys(queryParams).reduce(
    (partialUrl, queryKey) =>
      `${partialUrl}${queryKey}=${queryParams[queryKey]}&`,
    `${req.protocol}://${req.hostname}${req.baseUrl}?`
  );

  let pageResponse = [
    `${url}page=${pages.last}; rel="last"`,
    `${url}page=1; rel="first"`
  ];
  if (pages.last !== currentPage) {
    pageResponse = [
      ...pageResponse,
      `${url}page=${currentPage + 1}; rel="next"`
    ];
  }
  if (pages.first !== currentPage) {
    pageResponse = [
      ...pageResponse,
      `${url}page=${currentPage - 1}; rel="prev"`
    ];
  }
  res.set('Link', pageResponse.join(','));
  res.set('Total-count', total);
  res.set('Page-count', pages.last);
  res.set('Current-page', currentPage);
  return res.send(list || []);
}

export function getPages({
  limit,
  page,
  total
}: {
  perPage: number,
  page: number,
  total: number
}): { first: number, last: number, prev: number, next: number } {
  const hasNext = total <= page * limit;
  const hasPrev = page !== 1;
  const lastPage = Math.ceil(total / limit);
  let pages = {
    first: 1,
    last: lastPage
  };
  if (hasNext) {
    pages = {
      ...pages,
      next: page + 1
    };
  }
  if (hasPrev) {
    pages = {
      ...pages,
      prev: page - 1
    };
  }
  return pages;
}
