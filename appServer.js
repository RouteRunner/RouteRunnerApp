var knexConfig = require('./js/knexfile');
var knex = require('knex')(knexConfig);
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var router = express.Router();
var logger = require('morgan');
var uuid = require('node-uuid');
var nodemailer = require('nodemailer');
var configs = require('./js/config.js')
var uuid = require('node-uuid');
var cookieParser = require('cookie-parser');

var app = express();
module.exports = app;
//app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));
app.engine('html', require('ejs').renderFile);

// array for stashing user info for users to add to db after verification
var usersToAdd = [];

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
			//need to do anything here? res.end??
			res.end();
		})
	} else {
		//user not logged in, don't insert in DB, just end response
		res.end();
	}
})


//GET handler for serving register page
app.get('/register', function (req, res) {
     res.render('register.html');
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
      //database = app.get('database');  

  if (password === password_confirm) {
	//stash username, password and nonce to be able to add to db later after verification
	var newNonce = uuid.v4();
  	var pass = require('pwd');
 	pass.hash(password, function(err, salt, hash) {
		usersToAdd.push({
    		nonce : newNonce, 
    		username : username,
    		passwordhash : hash,
    		email : email, 
    		salt : salt
  		})
	})

	//send verification email
	var transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: configs.emailUser,
			pass: configs.emailPassword
		}
	})

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

	//redirect to home page
	console.log('redirecting to home page')
	response.redirect("/");
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

	// iterate through usersToAdd array and add user to db if nonce match is found
	usersToAdd.forEach(function (user) {
		if(user.nonce === returnedNonce) {
			knex('users').insert({
				username     : user.username,
				passwordhash : user.passwordhash,
       			email        : user.email,
        		salt         : user.salt
			}).then(function () {
				response.cookie('username', user.username)
				response.redirect('/');
			})
		}
	})
});


app.listen(3000, function () {
    console.log("server started, listening on port 3000");
});