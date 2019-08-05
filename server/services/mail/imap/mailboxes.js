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
  const boxes = await getBoxes();
  const searchable = parseMailBoxes(boxes);
  return searchable;
}

function isBoxSearchable(box) {
  const hasAttribute = box.attribs.some(a => mailboxAttributes.includes(a));
  const canBeOpened = box.attribs.every(
    a => a !== '\\Noselect' && a !== '\\NonExistent'
  );
  return hasAttribute && canBeOpened;
}

function getRelevantAttribute(box) {
  return box.attribs.find(a => mailboxAttributes.includes(a));
}

function boxHasChildren(box) {
  return box.attribs.some(a => a === '\\HasChildren');
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

function parseMailBoxes(boxes) {
  return Object.keys(boxes).reduce((out, boxName) => {
    const box = boxes[boxName];
    let ret = out;
    if (boxName.toLowerCase() === 'inbox' || isBoxSearchable(box)) {
      ret = [
        ...ret,
        { name: boxName, box, attribute: getRelevantAttribute(box) }
      ];
    }
    if (boxHasChildren(box)) {
      ret = [...ret, parseMailBoxes(box.children)];
    }
    return ret;
  }, []);
}
