# connections-rr
Connections Retrieve and Rank converts Connections Cloud data into compatible Watson Retrieve and Rank input.

1. Downloads all topics and replies from a forum.
2. Converts the downloaded topics and replies into Solr compatible data to be
loaded into Retrieve and Rank.
3. Creates a CSV groundtruth file from the downloaded topics and replies.

The groundtruth CSV file can be used with the Retrieve and Rank sample python file `train.py`.

## Usage
From a command line, run the following sequentially.

1. node downloadForum.js `communityId`
2. node forumToSolr.js `communityId`
3. node groundtruth.js `communityId`
4. python train.py -u `username`:`password` -i ./data/groundtruth-`communityId`.csv -c `cluster` -x `collection` -n `ranker_name`
5. Upload the solr-`communityId`.json file to Solr.
6. Upload the `train.py` output `trainingdata.xml` to Retrieve and Rank.
