export function takeScreenshot(page) {
  const ss = Promise.race([
    page.screenshot({
      encoding: 'binary',
      type: 'png'
    }),
    timeout(5000)
  ]);
  return ss;
}

export function timeout(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}
