var knexConfig = require('./js/knexfile');
var knex = require('knex')(knexConfig);
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var router = express.Router();
var logger = require('morgan');
var uuid = require('uuid');
var nodemailer = require('nodemailer');
var uuid = require('uuid');
var cookieParser = require('cookie-parser');
if (!process.env.heroku) var configs = require('./js/config.js');


var app = express();
module.exports = app;
//app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));
app.engine('html', require('ejs').renderFile);


/***************************** HOME PAGE ***************************************/

// GET handler for serving home page
app.get('/', function (req, res) {
	console.log("processing GET from '/'");
	console.log('req.body:');
	console.log(req.body);

  	//set user name from cookie if present
 	var username = getUsernameFromCookie(req);

    //render home.html, sending username to insert into template
    res.render('home.html', {username:username, error:null});
});


/***************************** ORIGIN ROUTES ***************************************/

//GET handler for fetching Origin backbone model when it initializes
app.get('/origin', function (req, res) {
	console.log("processing GET from '/origin'");
	console.log('req.body:');
	console.log(req.body);

 	//set user name from cookie if present
 	var username = getUsernameFromCookie(req);

 	//search DB for user's origin if cookie present (user logged in)
 	if (username) {
		//do knex query for username entry in users table
		knex('users').where({'username': username}).then(function(returnedUserRecords) {
			if (returnedUserRecords.length === 0) {
				//popup alert box? "No Such User"
			} else {
				//pull out first user from returned array
			    var user = returnedUserRecords[0];

			    //send origin from user in DB to backbone model
	          	res.send(JSON.stringify({
	          		originName : user.origin,
	          	}))
	        }
		})
	}
})

//POST handler for adding originName from backbone model to database
app.post('/origin', function (req, res) {
	console.log("processing POST from '/orgin'");
	console.log("req.body:");
	console.log(req.body);

  	//set user name from cookie if present
 	var username = getUsernameFromCookie(req);

 	//update origin for user in DB if cookie present (user logged in)
 	if (username) {
    	//insert origin for user in DB
		knex('users').where({username:username}).update({
			origin:req.body.originName,
		}).then(function() {
			res.end();
		})
	} else {
		//user not logged in, don't insert in DB, just end response
		res.end();
	}
})



/***************************** NOTES COLLECTION ROUTES ***************************************/

//GET handler for fetching notes collection, uses unique waypoint from url query string
app.get('/notesCollection', function (req, res) {
	console.log("processing GET from '/notesCollection'");
	console.log('req.query:');
	console.log(req.query);

	//get specific waypoint from url query string
	var waypoint = req.query.waypoint;

	//set user name from cookie if present
 	var username = getUsernameFromCookie(req);

 	//serach DB for notes collection if cookie present (user logged in)
 	if (username) {
		//do knex query for username entry in users table
		knex('notes').where({'username': username, 'waypoint' : waypoint}).then(function(returnedUserRecords) {
			if (returnedUserRecords.length === 0) {
				//console.log('no note records found for username and waypoint query, ending response')
				res.end();
			} else {
				//stringify and send returnedUserRecords array
				res.send(JSON.stringify(returnedUserRecords));
			}
		})
	} else {
		//user not logged in, end response
		res.end();
	}
})

//GET handler for fetching notes individually by id
app.get('/notesCollection/:id', function (req, res) {
	console.log("processing GET from '/notesCollection/:id'");
	console.log('req.body:');
	console.log(req.body);
	console.log('req.params:');
	console.log(req.params);
	res.end();
})

//POST handler for adding new listitem/status from backbone model to database
app.post('/notesCollection', function (req, res) {
	console.log("processing POST from '/notesCollection'");
	console.log("req.body");
	console.log(req.body);

	//build  variables from HTML request 
	var listItem = req.body.listitem,
      	status = req.body.status,
		waypoint = req.body.waypoint,
 		username = getUsernameFromCookie(req);

 	//insert new note into DB if cookiet present (user logged in)
 	if (username) {
    	//insert new note into db
    	knex('notes').returning('id')
    		.insert({
				username : username,
				listitem : listItem,
				status   : status,
				waypoint : waypoint,
			}).then(function(id) {
				//send back id to note's backbone model
				res.send(JSON.stringify({id : id}));
				})
	} else {
		//user not logged in, don't insert in DB, just end response
		res.end();
	}
})

//PUT handler for updating listitem/status from backbone model to database
app.put('/notesCollection/:id', function (req, res) {
	console.log("processing PUT from '/notesCollection'");
	console.log("req.body");
	console.log(req.body);
	console.log('req.params:');
	console.log(req.params);

	//build  variables from HTML request
	var	id = req.params.id,
		status = req.body.status,
 		username = getUsernameFromCookie(req);

 	//update note entry in DB if cookie present (user logged in)
 	if (username) {

    	//update status of existing note, matched by id
    	knex('notes').where({id : id})
    		.update({status : status})
    		.then(function () {
    			res.end();
    		}) 
	} else {
		//user not logged in, don't insert in DB, just end response
		res.end();
	}
})

//DELETE handler for deleting a note from the db
app.delete('/notesCollection/:id', function (req, res) {
	console.log("processing DELETE from '/notesCollection'");
	console.log("req.params");
	console.log(req.params);

	//get id from url
	var id = req.params.id;

	//delete waypoint entry where id matches in DB
	knex('notes').where({id:id}).del().then(function(){
		console.log('note deleted from DB');
		res.end();
	})
})


/***************************** WAYPOINT COLLECTION ROUTES ***************************************/

//GET handler for fetching waypoint collection
app.get('/waypointCollection/', function (req, res) {
	console.log("processing GET from '/waypointCollection'");
	console.log('req.body:');
	console.log(req.body);

	//set user name from cookie if present
 	var username = getUsernameFromCookie(req);

 	//search DB for waypoint collection for user if cookie present (user logged in)
 	if (username) {
		//do knex query for username entry in users table
		knex('waypoints').where({'username': username}).then(function(returnedWaypointRecords) {
			if (returnedWaypointRecords.length === 0) {
				//popup alert box? "No Records for This User"
				// console.log('no waypoint records found for this username, ending response')
				res.end();
			} else {
				//rename 'location_name' key from DB to 'location' to match backbone
				var renamedWaypointRecords = [];
				for (i = 0; i < returnedWaypointRecords.length; i++) {
					renamedWaypointRecords.push({
						location : returnedWaypointRecords[i].location_name, 
						id : returnedWaypointRecords[i].id,
						place : returnedWaypointRecords[i].place,
					});
				}

				//stringify and send renamedWaypointRecords array
				res.send(JSON.stringify(renamedWaypointRecords));
			}
		})
	} else {
		//user not logged in, end response
		res.end();
	}
})

//GET handler for fetching waypoint by id
app.get('/waypointCollection/:id', function (req, res) {
	console.log("processing GET from '/waypointCollection/:id'");
	console.log('req.body:');
	console.log(req.body);
	console.log('req.params:');
	console.log(req.params);
	res.end();
})


//POST handler for adding waypoint from backbone model to database
app.post('/waypointCollection', function (req, res) {
	console.log("processing POST from '/waypointCollection'");
	console.log("req.body");
	console.log(req.body);

	//build variables from HTML request
	var location = req.body.location,
		place = req.body.place,
 		username = getUsernameFromCookie(req);

 	//insert waypoint into DB if cookie present (user logged in)
 	if (username) {

    	//check to see if entry already exits
    	knex('waypoints').where({username : username, location_name : location})
    		.then(function(returnedNotes){
	    		if (returnedNotes.length === 0) {
	    			//no matching locations for user, insert new location in DB
					knex('waypoints').returning('id')
					.insert({
						username      : username,
						location_name : location,
						place         : place,
					}).then(function(id) {
						//send back id to waypoint's backbone model
						res.send(JSON.stringify({id : id}));
						})
    			} else {
    				//matching location aready in DB
	   			}
    		})
 
	} else {
		//user not logged in, don't insert in DB, just end response
		res.end();
	}
})

//DELETE handler for deleting waypoint from DB
app.delete('/waypointCollection/:id', function (req, res) {
	console.log("processing DELETE from '/waypointCollection'");
	console.log("req.params");
	console.log(req.params);

	//get id from url
	var id = req.params.id;

	//delete waypoint entry where id matches in DB
	knex('waypoints').where({id:id}).del().then(function(){
		console.log('waypoint deleted from DB');
		res.end();
	})
})


/***************************** LOGIN/REGISTER/VERIFICATION ROUTES ***************************************/

//GET handler for serving register page
app.get('/register', function (req, res) {

   	//set user name from cookie if present
 	var username = getUsernameFromCookie(req);

    res.render('register.html', {username:username});
});

//POST handler for checking if username exists
app.post('/checkUserName', function (req, res) {
	console.log("processing POST from '/checkUserName'");
	console.log("req.body");
	console.log(req.body);

	var registerUserName = req.body.registerUserName;
	console.log("registerUsername:");
	console.log(registerUserName);

	//query db and check to see if username already exists
  	knex('users').where({username:registerUserName})
  		.then(function(usersWithSameName){
			console.log("usersWithSameName:")
  			console.log(usersWithSameName)
  			if (usersWithSameName.length === 0) {
  				//ok to insert
  				res.send("okay")
  			} else {
  				//not ok to insert
  				res.send("bad")
  			}
  		})

})

//POST handler for registering new user
app.post('/register', function (req, res) {
	console.log("processing POST from '/register'");
	console.log("req.body");
	console.log(req.body);
  
  //build variables from HTML request
  var username = req.body.username,
      password = req.body.password,
      password_confirm = req.body.password_confirm,
      email = req.body.email;

//stash username, password and nonce in 'userstoadd' to be able to add to 'users' later after verification
var newNonce = uuid.v4();
	var pass = require('pwd');
	pass.hash(password, function(err, salt, hash) {
	knex('userstoadd').insert({
		nonce        : newNonce,
		username     : username,
		passwordhash : hash,
		email        : email,
		salt         : salt
	}).then(function() {
		//send verification email
		var transporter = nodemailer.createTransport({
			service: 'Gmail',
			auth: {
				user: process.env.emailUser || configs.emailUser,
				pass: process.env.emailPassword || configs.emailPassword
			}
		});

		//create email verification url for routing to from verification email
		var verificationUrl;

		if (!process.env.heroku) {
			//not running on heroku, use localhost
			verificationUrl = 'http://localhost:3000/verify_email/' + newNonce;
		} else {
			//running on heroku, user heroku url
			verificationUrl = 'https://routerunnerapp.herokuapp.com/verify_email/' + newNonce;
		}

		// setup e-mail data with unicode symbols
		var mailOptions = {
		    from: 'Route Runner ✔ <routerunner@gmail.com>', // sender address
		    to: email,  // list of receivers
		    subject: 'Route Runner Registration Verification ✔', // Subject line
		    html: '<p>Thank you for registering with Route Runner! Please click the link below to verify your email address.</p><a href=' + verificationUrl +'>Click here to verify.</a>' // html body
		};

		// send mail with defined transport object
		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        console.log(error);
		    }else{
		        console.log('Message sent: ' + info.res);
		    }
		});

		//render thankyou page after email is sent
		res.render("thankyou.html");
	  });
	});
});

//GET handler for email verification
app.get('/verify_email/:nonce', function(req, res) {

	var returnedNonce = req.params.nonce;
	console.log("returnedNonce:");
	console.log(returnedNonce);

	//search userstoadd table for matching nonce
	knex('userstoadd').where({nonce:returnedNonce}).then(function(returnedUserRecords){
		//add user to users table if nonce match is found
		var user = returnedUserRecords[0];
		knex('users').insert({
			username     : user.username,
			passwordhash : user.passwordhash,
   			email        : user.email,
    		salt         : user.salt
		}).then(function(){
			//delete nonce from userstoadd
			knex('userstoadd').where({nonce:returnedNonce}).del().then(function(){
				//log user in by setting cookie, and redirect to home page
				res.cookie('username', user.username)
				res.redirect('/');
			})
		})
	})
});

//POST handler for logging in from form on home page
app.post('/login', function(req, res) {
	console.log("processing POST from '/login'");
	console.log("req.body");
	console.log(req.body);

	var username = req.body.username,
	  	password = req.body.password;

	var pass = require('pwd');
	pass.hash(password, function(err, salt, hash) {
		knex('users').where({'username': username}).then(function(returnedUserRecords) {
			if (returnedUserRecords.length === 0) {
				//popup alert box? "No Such User"
			} else {
				//user was found in DB, pull out first one from array
			    var user = returnedUserRecords[0];

			    //create hash for entered password
	      		var pass = require('pwd');
	      		pass.hash(password, user.salt, function(err, hash) {
	      			//check new password hash against password from DB
	      			if(user.passwordhash === hash) {
	      				//password hashes match, log user in (set cookie)
	          			res.cookie('username', username);
	          			res.redirect('/');
	        		} else {
	        			//popup alert box? "Incorrect Password"
					}
				})
			}
	  	})
	})
});

//GET handler for logging out
app.get('/logout', function (req, res) {
	console.log('processing GET from /logout');
	console.log('req.body:');
	console.log(req.body);

	//delete cookie
	res.clearCookie('username');

	//redirect back to home page
	res.redirect('/');
})

//helper function to set username to username from cookie, returns null if no cookie present
var getUsernameFromCookie = function (req) {

	var usernameFromCookie = null;

 	if (req.cookies.username != undefined) {
    	usernameFromCookie = req.cookies.username;
    }

    return usernameFromCookie;
}



app.listen(process.env.PORT || 3000);
