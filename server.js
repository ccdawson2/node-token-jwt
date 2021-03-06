var express    = require('express');
var apiRoutes  = express.Router(); 

var app        = express();
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mongoose   = require('mongoose');

var jwt    = require('jsonwebtoken'); 
var config = require('./config/config'); 
var User   = require('./app/models/user'); 

var port = config.port;
mongoose.connect(config.database); 
app.set('superSecret', config.secret); 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', function(req, res) {
    res.send("API's are available at http://localhost:" + port + "/api");
});

// Positioning /adduser and /authenticate before the apiRoutes.use() middleware
// function below allows a user to be added without authentication
app.get('/adduser', function(req, res) {

  // create a sample user
  var chris = new User({ 
    name: 'ccdawson', 
    password: 'password',
    admin: true 
  });

  // save the sample user
  chris.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

apiRoutes.post('/api/authenticate', function(req, res) {

  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: 1440 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }   

    }
  });
});

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // Dislay token details
	//console.log(jwt.decode(token));
	
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });

  }
});

// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/api/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/api/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});   

app.use('/', apiRoutes);

app.listen(port);
console.log('Listening to http://localhost:' + port);