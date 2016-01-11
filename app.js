var express = require("express"),
	app = express(),
	engines = require("consolidate"),
	//MongoClient = require('mongodb').MongoClient,
	assert = require("assert"),
	bodyParser = require("body-parser");
	
var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db,
  ObjectId = mongo.ObjectID;;

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '\\views');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('video', server);

function errorHandler(err, req, res, next) {
	console.log(err.message);
	console.log(err.stack);
	res.status(500);
	res.render('error_template', {"error" : err.message});
}
app.use(errorHandler);

db.open(function(err, db) {
  if(!err) {
    console.log("We are connected");
  }
});
app.get('/', function(req, res) {
	db.collection('movies', function(err, collectionref) { 			
		// find all documents in a collection that have foo: "bar"
		var cursor = collectionref.find({});
		cursor.toArray(function(err, docs) {
			// gets executed once all items are retrieved
			res.render('movie', {'movies': docs});
		});
	});
});
//Delete data: Not working
app.get('/delete', function(req, res) {
	 var id = req.query.id;
	 console.log("Id to delete :- "+id);
	 db.collection('movies', {}, function(err, collectionref) {
        collectionref.remove({_id: ObjectId(id)}, function(err, result) {
            if (err) {
                console.log("Error :"+err);
            }
            console.log("Result: "+result);
            //db.close();
        });
     });
});

//Post call
app.post('/add_movie', function(req, res, next) {
	var title = req.body.title;
	var year = req.body.year;
	var imdb = req.body.imdb;
	if((typeof title != 'undefined' && title != "") && (typeof year != 'undefined' && year != "") && 
	(typeof imdb != 'undefined' && imdb != "") ) {
		// retrieve a collection reference
		db.collection('movies', function(err, collectionref) { 			
			// insert a document into a collection
			var movieDoc = {"title":title, "year":year, "imdb" : imdb};
			collectionref.insert(movieDoc, function (err, result) {
				// this is an asynchroneous operation
				console.log("Movie doc added");
				res.send("New Movie is added");
			});
		});
	} else {
		next(Error("Please enter all the values."));
	}
});

var server = app.listen(3000, function() {
	var port = server.address().port;
	console.log("Listening at port: "+port);
});
