var express = require("express")
var mongo = require('mongodb').MongoClient
var assert = require('assert');

var url = 'mongodb://client:3253628@ds017726.mlab.com:17726/imagehot';

var app = express()

app.get('/',function (req,res) {
    res.sendfile('index.html')
})

app.get('/search/:keyword',function (req,res) {
    updateList(req.params.keyword)
    res.send('keyword' + req.params.keyword + '<br/> offset:' +req.query.offset+'<br/>hard to find API')
})

app.get('/latest',function (req,res) {
    showTop(res)
})

app.listen(process.env.PORT || 8080, function () {
  console.log('Example app listening on port 80!');
});


function showTop(res) {
    mongo.connect(url, function(err, db) {
    assert.equal(null,err)
  // Create a collection we want to drop later
  var collection = db.collection('toplist');

  collection.find({}, { keyword: 1, count: 1, _id: 0 }).sort({count: -1}).limit(10).toArray(function(err, docs) {
      assert.equal(null, err);
      res.end(JSON.stringify(docs))
      db.close();
    });
});
}


function updateList(keyword) {
    mongo.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");
db.collection('toplist').find({keyword: { $eq: keyword }}).toArray().then(function(docs) {
      if(docs.toString() == ''){
          db.collection('toplist').insertOne({keyword:keyword,count:1}, function(err, r) {
            assert.equal(null, err);
            assert.equal(1, r.insertedCount);
            // Insert multiple documents
            console.log("Inserted!");
          });
      }
      else {
          db.collection('toplist').updateOne({keyword: keyword }, {$inc: {count: 1}}, function(err, r) {
          assert.equal(null, err);
          console.log("Updated!");
        });
      }

      db.close();
    });
  // Insert a single document
});

}
