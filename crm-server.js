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

	exports.server=http.createServer(function (req, res) {
	//creates server
		if (req.method=="POST"&&req.url=="/activities/create.json") {
			//if method is POST and URL is messages/ add message to the array
			var message='';
			req.on('data', function(data, message){
				console.log(data.toString('utf-8'));
				message=exports.addMessage(data.toString('utf-8'));
				//data is type of Buffer and must be converted to string with encoding UTF-8 first
				//adds message to the array
			})
			console.log(util.inspect(message, true, null));
			console.log(util.inspect(messages, true, null));
			//debugging output into the terminal
			res.writeHead(200, {'Content-Type': 'text/plain'});
			//sets the right header and status code		
			res.end(message);
			//out put message, should add object id
		}
		if (req.method=="GET"&&req.url=="/activities/list.json") {
		//if method is GET and URL is /messages output list of messages
			var body=exports.getMessages();
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
	
	var port = process.env.PORT || 7000;
	exports.server.listen(port, function() {
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
	return JSON.stringify(messages);
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

var messages=exports.getActivities();
exports.addActivity("originator=Tom Lee&contact=Sam Sur&company=HTA&notes=this was our first meeting&date=07/07/2012");