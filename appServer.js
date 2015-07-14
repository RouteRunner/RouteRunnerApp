var knexConfig = require('./js/knexfile');
var knex = require('knex')(knexConfig);
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var router = express.Router();
var logger = require('morgan');
var uuid = require('uuid');
var nodemailer = require('nodemailer');
if (!process.env.heroku) var configs = require('./js/config.js');
var port_number = server.listen(process.env.PORT || 3000);

var app = express();
module.exports = app;
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

// array for stashing user info for users to add to db after verification
var usersToAdd = [];

// GET handler for serving home page
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/home.html'));
});


//GET handler for serving register page
app.get('/register', function (req, res) {
    res.sendFile(path.join(__dirname + '/register.html'));
});

//POST handler for home page
app.post('/', function(req, res) {
  console.log("req.body");
  console.log(req.body);

  res.send("got POST request on '/'");
});


//POST handler for registering new user
app.post('/register', function(request, response) {
  //get inputs from request
  var username = request.body.username,
      password = request.body.password,
      password_confirm = request.body.password_confirm,
      email = request.body.email,
      database = app.get('database');

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
			user: process.env.emailUser || configs.emailUser,
			pass: process.env.emailPassword || configs.emailPassword
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

app.listen(process.env.PORT || 3000});
