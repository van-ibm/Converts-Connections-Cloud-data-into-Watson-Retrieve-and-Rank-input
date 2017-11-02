const fs = require('fs')
const S = require('string');

const forumId = process.argv[2];  // fabb2649-aaf2-4715-841c-9135bb976223
const outFile = `./data/forum-${forumId}.txt`
const data = JSON.parse(fs.readFileSync(`./data/forum-${forumId}.json`, 'utf8'))

const headers = [
  'id',
  'replied_to_id',
  'thread_id',
  'conversation_id',
  'group_id',
  'group_name',
  'participants',
  'in_private_group',
  'in_private_conversation',
  'sender_id',
  'sender_type',
  'sender_name',
  'sender_email',
  'body',
  'api_url',
  'attachments',
  'deleted_by_id',
  'deleted_by_type',
  'created_at',
  'deleted_at'
]

function map (entry) {
  console.log(`Processing ${entry.id}`)

  const threadId = isTopic(entry) ? entry.id : entry.parent
  let content = ''

  if (entry.content) {
    content = S(S(entry.content).stripTags().s).collapseWhitespace()
  }

  return [
    entry.id,
    '',
    threadId,
    '',
    '',
    '',
    '',
    '',
    '',
    entry.author.id,
    '',
    entry.author.name,
    '',
    content,
    entry.api,
    '',
    '',
    '',
    entry.published,
    ''
  ]
}

function isTopic (entry) {
  entry.categories.find(element => {
    if (element === 'forum-topic') {
      return true
    }
  })

  return false
}

fs.appendFileSync(outFile, `${headers.join('\t')}\n`)

data.topics.forEach(topic => {
  fs.appendFileSync(outFile, `${map(topic).join('\t')}\n`)

  topic.replies.forEach(reply => {
    fs.appendFileSync(outFile, `${map(reply).join('\t')}\n`)
  })
})
