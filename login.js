const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');


//creating a new database connection, 'database' is to be filled with a name of an SQL database that a user has created.
const connection = mysql.createConnection({ 
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : ''
});

const app = express();

app.use(session({
	secret: 'secret', //used to authenticate login session
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static'))); //fetching the css to style the webpage with

// http://localhost:3000/
app.get('/', function(request, response) {
	// Fetching the html file
	response.sendFile(path.join(__dirname + '/login.html'));
});

// http://localhost:3000/auth
app.post('/auth', function(request, response) { //function to capture the request/response of the page

	let username = request.body.username;
	let password = request.body.password;
	// Ensures that the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
				// Redirect to home page
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

// http://localhost:3000/home
app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
	response.end();
});

app.listen(3000);