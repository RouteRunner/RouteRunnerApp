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

// GET handler for serving home page
app.get('/', function (req, res) {
	console.log("processing GET from '/'");
 	
 	//get username from cookie in request, if user is logged in
 	var username = null;
 	if (req.cookies.username != undefined) {
    	username = req.cookies.username;	
    }

    //render home.html, sending username to insert into template
    res.render('home.html', {username:username});
});

//GET handler for logging out
app.get('/logout', function (req, res) {
	console.log('processing GET from /logout');

	//delete cookie
	res.clearCookie('username');

	//redirect back to home page
	res.redirect('/');
})

//GET handler for fetching Origin backbone model when it initializes
app.get('/origin', function (req, res) {
	console.log("processing GET from '/origin'");
	
	var username = null;
 	if (req.cookies.username != undefined) {

 		//set username from cookie
    	username = req.cookies.username;	

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
	console.log("req.body");
	console.log(req.body);

	//insert origin for user if logged in (cookie present)
	var username = null;
 	if (req.cookies.username != undefined) {
    	
    	//get username from cookie
    	username = req.cookies.username;

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


//GET handler for serving register page
app.get('/register', function (req, res) {
	 //get username from cookie in request, if user is logged in
 	var username = null;
 	if (req.cookies.username != undefined) {
 		username = req.cookies.username;	
    }
    res.render('register.html', {username:username});
});

//POST handler for logging in from form on home page
app.post('/login', function(req, res) {
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


//POST handler for registering new user
app.post('/register', function(request, response) {
  //get inputs from request
  var username = request.body.username,
      password = request.body.password,
      password_confirm = request.body.password_confirm,
      email = request.body.email; 

  if (password === password_confirm) {
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

			var verificationUrl = 'http://localhost:3000/verify_email/' + newNonce;

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
			        console.log('Message sent: ' + info.response);
			    }
			});

			//render thankyou page after email is sent
			response.render("thankyou.html");
		});
	});
	
  } else { //password and password verify did not match
  	console.log('passwords do not match')
  	response.redirect("/");
  }
});


//GET handler for email verification
app.get('/verify_email/:nonce', function(request, response) {
	//database = app.get('database');
	var returnedNonce = request.params.nonce;
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
				response.cookie('username', user.username)
				response.redirect('/');
			})
		})
	})
});

app.listen(process.env.PORT || 3000);
