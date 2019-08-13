import * as audit from '../dao/audit';

import logger from '../../build/utils/logger';
import { v1 } from 'node-uuid';

let auditBuffer = [];

export function createAudit(userId, group) {
  const groupId = v1();
  return {
    id: groupId,
    append: (message, data) => {
      log(message, { groupId, userId, group, ...data });
    }
  };
}

export function log(message, { userId, id, groupId, group, level = 'log' }) {
  return addToBuffer({ message, userId, id, groupId, group, level });
}

export function get(userId) {
  return audit.get(userId);
}

function addToBuffer(m) {
  auditBuffer = [...auditBuffer, m];
  return m;
}

function flush() {
  try {
    const buffer = [...auditBuffer];
    if (buffer.length) {
      logger.info(`audit: flushing ${buffer.length} messages`);
      // group by group id
      const byGroup = buffer.reduce((out, m) => {
        const { groupId, userId, group } = m;
        if (!out[groupId]) {
          return {
            ...out,
            [groupId]: {
              group: group,
              userId: userId,
              messages: [m]
            }
          };
        }
        return {
          ...out,
          [groupId]: {
            ...out[groupId],
            messages: [...out[groupId].messages, m]
          }
        };
      }, {});
      Object.keys(byGroup).map(groupId => {
        const { userId, group, messages } = byGroup[groupId];
        audit.append(userId, groupId, { group, messages });
      });
    }
  } catch (err) {
    logger.error(err);
  } finally {
    setTimeout(flush, 5000);
  }
}

flush();
