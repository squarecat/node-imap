export function getSubsEstimate(timeframe, mailCount) {
  let scanName;
  let moreSubsPrice = '$0';
  let moreSubsEstimate = 0;
  if (timeframe) {
    if (timeframe === '3d') {
      scanName = '3 days';
      moreSubsPrice = '$3';
      moreSubsEstimate = Math.ceil((mailCount / 3) * 7) - mailCount;
    }
    if (timeframe === '1w') {
      scanName = '1 week';
      moreSubsPrice = '$5';
      moreSubsEstimate = Math.ceil(mailCount * 4) - mailCount;
    }
    if (timeframe === '1m') {
      scanName = '1 month';
      moreSubsPrice = '$8';
      moreSubsEstimate = Math.ceil(mailCount * 6) - mailCount;
    }
    if (timeframe === '6m') scanName = '6 months';
  }
  return {
    scanName,
    moreSubsPrice,
    moreSubsEstimate
  };
}
