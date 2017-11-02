var connections = require('@ics-demo/connections-cloud');
var async = require('async');
var fs = require('fs');

require('dotenv').config();

// Connections
const forumId = process.argv[2];  // fabb2649-aaf2-4715-841c-9135bb976223
const client = new connections('apps.na.collabserv.com', process.env.USER,
  process.env.PASSWORD);

client.login((err) => {
  if (err) {
    console.error('failed to login');
  } else {
    console.error('logged in');

    downloadForum(forumId, {
      page: 1,
      ps: '50'
    });
  }
});

function downloadForum (id, options) {
  // get the forums topics in a specific forum
  var forum = {};
  forum.id = id;
  forum.options = options;
  forum.topics = [];

  var numTopics = 0;

  async.doWhilst(
    (callback) => {
      downloadTopics(forum, (num) => {
        console.log(num);
        forum.options.page++;
        numTopics = num;
        callback(null, num);
      });
    },
    () => {
      return numTopics > 0;
    },
    (err, num) => {
      console.log(`finished downloading forum`);
      if (!err) {
        var s = fs.createWriteStream(`./data/forum-${id}.json`);
        s.write(JSON.stringify(forum, null, 1));
        s.end();
      }
    }
);
}

function downloadTopics (forum, forumCallback) {
  console.log(`downloading topics from forum ${forum.id} page ${forum.options.page}`);

  client.forumTopics(forum.id, (err, topics) => {
    if (err) {
      console.error(err);
    } else {
      // callback(err)
      downloadReplies(topics, (err) => {
        if(!err) {
          Array.prototype.push.apply(forum.topics, topics.items);
          forumCallback(topics.items.length);
        } else {
          forumCallback(0);
        }
      });
    }
  }, forum.options);
}

function downloadReplies (topics, topicCallback) {
  console.log(`downloading replies for ${topics.items.length} topics`);

  // for each topic process it
  async.each(topics.items, (topic, callback) => {
    // get the replies to a topic
    client.forumTopic(topic.id, (err, replies) => {
      if (err) {
        console.error(err);
      } else {
        // add the replies to the topic object
        console.log(`${topic.id} has ${replies.items.length} replies`);
        topic.replies = replies.items;
      }

      callback();
    }, true);
  },
  topicCallback);
}
