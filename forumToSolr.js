var fs = require('fs');
var striptags = require('striptags');

convertToSolr(process.argv[2]);

function convertToSolr (filename) {
  var data = '';
  var readStream = fs.createReadStream(`./data/forum-${filename}.json`);

  readStream.on('data', (chunk) => {
    data += chunk;
  }).on('end', () => {
    console.log('converting to solr format');

    var json = JSON.parse(data);

    var documents = fs.createWriteStream(`./data/solr-${filename}.json`);
    documents.write('{');

    for (var i in json.topics) {
      // read the replies first because normalize will remove the needed data
      for (var j in json.topics[i].replies) {
        normalize(json.topics[i].replies[j]); // convert data to RR schema

        var reply = JSON.stringify(json.topics[i].replies[j], null, 1);

        if (i + j > 0) {
          documents.write(',');
        }

        documents.write(` "add" : { "doc" : ${reply} }\n`);
      }

      normalize(json.topics[i]); // convert data to RR schema

      var topic = JSON.stringify(json.topics[i], null, 1);

      if (i > 0) {
        documents.write(',');
      }

      documents.write(` "add" : { "doc" : ${topic} }\n`);
    }

    documents.write('}');
  });
}

function normalize (json) {
  if (json.content === undefined) {
    json.content = '';
  }
  json.body = json.content;
  json.body = json.body.replace(/&nbsp;/gi, ' ');
  json.body = json.body.replace(/^\s+|\s+$|\s+(?=\s)/g, '');
  json.body = json.body.replace(/"/gi, '\'');
  json.body = striptags(json.body);

  json.title = json.title.replace(/"/gi, '\'');

  json.author = json.author.name;

  delete json.source;
  delete json.parent;
  delete json.api;
  delete json.categories;
  delete json.recommendations;
  delete json.content;
  delete json.replies;
}
