var fs = require('fs');

var filename = process.argv[2];
var cluster = process.argv[3]; // sc10b55b81_f882_4eba_9adb_dbdd916997f1
var collection = process.argv[4]; // socialjs
var ranker = process.argv[5];

deleteGroundtruth();
createGroundtruth(filename, cluster, collection);

function deleteGroundtruth () {
  // delete the existing groundtruth file
  fs.stat('./data/groundtruth.csv', (err, stats) => {
    if (!err) {
      fs.unlink('./data/groundtruth.csv');
    }
  });
}

// must contain at least 49 unique questions
// number of feature vectors (that is, rows in your CSV training-data file)
// must be 10 times the number of features (that is, feature columns) in each row

function createGroundtruth (filename, cluster, collection) {
  // var url = `https://gateway.watsonplatform.net/retrieve-and-rank/api/v1/solr_clusters/${cluster}/solr/${collection}/fcselect?rows=10&wt=json&&returnRSInput=true&`;

  var data = '';
  var readStream = fs.createReadStream(`./data/forum-${filename}.json`);

  readStream.on('data', (chunk) => {
    data += chunk;
  }).on('end', () => {
    var json = JSON.parse(data);

    var groundtruth = fs.createWriteStream(`./data/groundtruth-${filename}.csv`,
      {'flags': 'a'});

    var questionCounter = 0; // informational only

    for (var i in json.topics) {
      var topic = json.topics[i];
      // create groundtruth only if the topic has replies
      if (topic.replies.length >= 2) {
        var q = topic.title;
        // can't have a comma because CSV is the target output
        // can't have a ' & or = because the groundtruth data is fed into a URL
        q = q.replace(/,/gi, '').replace(/&/gi, '%26').replace(/=/gi, '%3D').replace(/"/gi, '\'');

        var gt = '';

        // for each reply process it
        for (var j in topic.replies) {
          var id = topic.replies[j].id;
          var rank = getRank(topic.replies[j]);

          gt = gt + `${id},${rank},`;
        }

        gt = gt.substring(0, gt.length - 1); // remove trailing comma
        groundtruth.write(`${q},${gt}\n`);

        questionCounter++;
      }
    }

    console.log(`created  ${questionCounter} groundtruth rows`);
  });
}

function getRank (json) {
  if (includes(json.categories, 'answer')) {
    return 4;
  } else if (json.recommendations >= 2) {
    return 3;
  } else if (json.recommendations === 1) {
    return 2;
  }

  return 1;
}

function includes (array, item) {
  for (var i in array) {
    if (array[i] === item) {
      return true;
    }
  }
}
