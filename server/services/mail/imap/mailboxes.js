import logger from '../../../utils/logger';
import util from 'util';

const mailboxAttributes = [
  '\\Inbox', // New mail is delivered here by default.
  '\\Archive', // Archived messages
  '\\Junk', // Messages identified as Spam/Junk
  '\\Trash', // Messages the user has discarded
  '\\Marked' // Server has marked the mailbox as "interesting"
];

export async function getMailboxes(client) {
  const getBoxes = util.promisify(client.getBoxes.bind(client));
  let boxes;
  try {
    boxes = await getBoxes();
    const searchable = parseMailBoxes(boxes);
    return searchable;
  } catch (err) {
    if (boxes) {
      console.log(JSON.stringify(Object.keys(boxes)));
    } else {
      logger.error('no mailboxes found, trying with default INBOX box');
      return {
        path: 'INBOX'
      };
    }
    logger.error('failed to get mailboxes');
    throw err;
  }
}

function isBoxSearchable({ attribs = [] }) {
  // const hasAttribute = box.attribs.some(a => mailboxAttributes.includes(a));
  const canBeOpened = attribs.every(
    a => a !== '\\Noselect' && a !== '\\NonExistent'
  );
  return canBeOpened;
}

function getRelevantAttribute({ attribs = [] }) {
  return attribs.find(a => mailboxAttributes.includes(a));
}

function boxHasChildren({ attribs = [] }) {
  return attribs.some(a => a === '\\HasChildren');
}

export function getMailboxName(name, box) {
  let { parent } = box;
  let fullname = name;
  while (parent) {
    const parentName = Object.keys(parent)[0];
    fullname = `${parentName}${parent[parentName].delimiter}${fullname}`;
    parent = parent[parentName].parent;
  }
  return fullname;
}

function parseMailBoxes(boxes, path = '') {
  return Object.keys(boxes).reduce((out, boxName) => {
    const box = boxes[boxName];
    const { delimiter } = box;
    const newPath = path ? `${path}${delimiter}${boxName}` : boxName;
    let ret = out;
    if (boxName.toLowerCase() === 'inbox' || isBoxSearchable(box)) {
      ret = [
        ...ret,
        {
          name: boxName,
          path: newPath,
          box,
          attribute: getRelevantAttribute(box)
        }
      ];
    }
    if (boxHasChildren(box)) {
      ret = [...ret, ...parseMailBoxes(box.children, newPath)];
    }
    return ret;
  }, []);
}
