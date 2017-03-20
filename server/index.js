const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const model = require('./model');
const connect = require('./db/dbConnect');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const KEYS = require('../env/KEYS.js');
const fileUpload = require('express-fileupload');
const app = express();
const dbHelpers = require('./util/dbHelpers.js');

app.use( bodyParser.json() );
app.use(cors());
app.use(express.static(__dirname + '/../public/dist'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('express-session')({
  secret: KEYS.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

passport.use(new FacebookStrategy({
    clientID: KEYS.FB_APP_CLIENTID,
    clientSecret: KEYS.FB_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'email', 'displayName', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified'],
  },
  function(accessToken, refreshToken, profile, cb) {
    process.nextTick(function() {

      console.log('profile=======', profile._json);

      let userInfo = {
        name: profile._json.name,
        fb_id: profile._json.id,
        // token: accessToken,
        email: profile._json.email
      };
      console.log('userInfo=====', userInfo);
      // dbHelpers.findOrCreateUser(userInfo, function(err, user) {
      //   console.log('findorcreateuser result======', user);
      //   req.session.user = user.fb_id;
      //   // next();
      // });
        console.log('done with creating User');
    });
  }
));

app.get('/profile', function(req, res) {
  console.log('======req.session.user is', req.session.user);
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    console.log('session is valid=========');
  }
})

// route for facebook authentication and login
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email']}));

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('Successful facebook callback! ==========');
    // Successful authentication, redirect home.
    res.redirect('/');
});

// // route middleware to make sure a user is logged in
// function isLoggedIn(req, res, next) {

//   // if user is authenticated in the session, carry on
//   if (req.isAuthenticated())
//       return next();


//   res.redirect('/');
// }




passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.get('/testing', function(req, res) {
  res.send('hello world');
  console.log('req.cookies is ========', req.cookies);
  console.log('req.session is ========', req.session);
  console.log('req.session.user is ========', req.session.user);
});

//To be used for testing and seeing requests
app.post('/testTripName', function(req, res) {
  //With the received request, use model function to submit the tripname to the database
  model.tripNameInsert(req.body.submittedTripName);
  res.send('Received request to /testTripNameServer');
});

app.post('/upload', function(req,res) {
  //req.body should include receipt name, total, receipt_link;
  //should be an insert query
   if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;
  console.log(sampleFile);
  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(__dirname + '/temp/filename.jpg', function(err) {
    if (err) {
      return res.status(500).send(err);
    }
    res.send('File uploaded!');
  });

})

app.post('/upload/delete', function(req,res) {
  //req.body should include receipt name, total, receipt_link;
  //should be a delete query
})

app.listen(3000, function() {
  console.log('listening on port 3000!');
});
