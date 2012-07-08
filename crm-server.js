var http = require('http');
//loads http module
var util= require('util');
//usefull functions
var querystring = require('querystring');
//laods querystring module, we'll need it to serialize and deserialize objects and query strings

var mongo = require ('mongodb');
var Server = mongo.Server;

mongo.Db.connect(process.env.MONGOHQ_URL_CRM, function(error, client) {
	if (error) throw error;

	var app=http.createServer(function (req, res) {
	//creates server
		if (req.method=="POST"&&req.url=="/activities/create.json") {
			//if method is POST and URL is activities/ add activity to the array
			var activity='';
			req.on('data', function(data, activity){
				console.log(data.toString('utf-8'));
				activity=exports.addActivity(data.toString('utf-8'));
				//data is type of Buffer and must be converted to string with encoding UTF-8 first
				//adds activity to the array
			})
			console.log(util.inspect(activity, true, null));
			console.log(util.inspect(activities, true, null));
			//debugging output into the terminal
			res.writeHead(200, {'Content-Type': 'text/plain'});
			//sets the right header and status code		
			res.end(activity);
			//out put activity, should add object id
		}
		if (req.method=="GET"&&req.url=="/activities/list.json") {
		//if method is GET and URL is /activities output list of activities
			var body=exports.getActivities();
			//body will hold our output
			res.writeHead(200, {
				'Content-Length': body.length,
				'Content-Type': 'text/plain'
			});
			res.end(body);
		}
		else {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			//sets the right header and status code
			res.end('Hello World\n');
		};
		console.log(req.method);

	  //outputs string with line end symbol
	});
	
	var port = process.env.PORT || 5191;
	app.listen(port, function() {
	  console.log("Listening on " + port);
	});
})

exports.getActivities = function() {
	mongo.Db.connect(process.env.MONGOHQ_URL_CRM, function(error, client) {
		if (error) throw error;
		var collection = new mongo.Collection(client, 'activity_collection');
		collection.find({}, {limit:100}).toArray(function(err, docs) {
	    	console.dir(docs);
			activities=docs;
		});
	});	
	return JSON.stringify(activities);
};

exports.addActivity = function (data){
	var str;
	mongo.Db.connect(process.env.MONGOHQ_URL_CRM, function(error, client) {
		if (error) throw error;
		var collection = new mongo.Collection(client, 'activity_collection');
		collection.insert(querystring.parse(data), {safe:true}, function(err, objects) {
	    	if (err) console.warn(err.message);
			console.log(objects);
			// str=data;
	    	if (err && err.message.indexOf('E11000 ') !== -1) {
	      		// this _id was already inserted in the database
	    	}
	  });
	});
};

var activities=exports.getActivities();
exports.addActivity("originator=Tom Lee&contact=Sam Sur&company=HTA&notes=this was our first meeting&date=07/07/2012");