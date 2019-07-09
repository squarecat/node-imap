// import _ from 'lodash';
// import logger from '../utils/logger';
import now from 'performance-now';
// import onHeaders from 'on-headers';

let marks = {};
let entries = {};

export function mark(name) {
  marks = {
    ...marks,
    [name]: now()
  };
}

export function record(time, label) {
  entries = {
    ...entries,
    [label]: {
      duration: time,
      label
    }
  };
}
export function measure(startMark, endMark, label) {
  const duration = marks[endMark] - marks[startMark];
  entries = {
    ...entries,
    [`${startMark}-${endMark}`]: {
      startTime: marks[startMark],
      duration: isNaN(duration) ? 0 : duration,
      label
    }
  };
  return duration;
}

export function clearEntries() {
  entries = {};
  marks = {};
}

export function getEntries() {
  return entries;
}

function middleware(req, res, next) {
  if (process.env.NODE_ENV !== 'development') return next();

  mark('start-api-call');
  // onHeaders(res, () => {
  //   const existingHeaders = res.getHeader('Server-Timing') || [];
  //   mark('end-api-call');
  //   measure('start-api-call', 'end-api-call', 'API Call Duration');
  //   logger.debug(JSON.stringify(marks));
  //   logger.debug(JSON.stringify(entries));
  //   const times = _.chain([...existingHeaders, ...Object.keys(entries)])
  //     .sortBy(d => entries[d].startTime)
  //     .map((k, i) => {
  //       const { label, duration } = entries[k];
  //       return `key${i}=${Math.round(duration)};"${label}"`;
  //     })
  //     .value()
  //     .join(',');
  //   clearEntries();

  //   res.setHeader('Server-Timing', times);
  // });
  return next();
}

export default middleware;
