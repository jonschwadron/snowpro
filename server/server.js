var path = require('path');
var qs = require('querystring');

var async = require('async');
var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var colors = require('colors');
var cors = require('cors');
var express = require('express');
var logger = require('morgan');
var jwt = require('jwt-simple');
var moment = require('moment');
var mongoose = require('mongoose');
var request = require('request');

var config = require('./config');

var RSS = require('rss');
var feed = new RSS({
  title: 'title',
  feed_url: 'http://snowboarding.transworld.net/feed/'
});

var xml = feed.xml();

var userSchema = new mongoose.Schema({
  created_at:     Date,
  updated_at:     Date,
  email:          { type: String, unique: true, lowercase: true },
  password:       { type: String, select: false },
  displayName:    String,
  picture:        String,
  instagram:      String,
  snowboardBrand: String,
  snowboardModel: String,
  snowboardSize:  String,
  bindingsBrand:  String,
  bindingsModel:  String,
  bindingsSize:   String,
  bootsBrand:     String,
  bootsModel:     String,
  bootsSize:      String
});

var inventorySchema = new mongoose.Schema({
  created_at: Date,
  updated_at: Date,
  snowboard: {
    size:         Number,
    manufacturer: String,
    model:        String,
    link:         String
  },
  bindings: {
    size:  Number,
    brand: String,
    model: String,
    link:  String
  },
  boots: {
    size:  Number,
    brand: String,
    model: String,
    link:  String
  }
});

var snowboardSchema = new mongoose.Schema({
  created_at: Date,
  updated_at: Date,
  brand:      String,
  model:      String,
  name:       String,
  year:       Number,
  flex:       Number,
  profile:    String,
  sizes:   [{ Number }]
});

var reviewSchema = new mongoose.Schema ({
  created_at:      Date,
  updated_at:      Date,
  riding_style:    {type: String, required: true},
  riding_ability:  {type: String, required: true},
  stiffness:       {type: Number, required: true, min: 1, max: 5},
  speed:           {type: Number, required: true, min: 1, max: 5},
  stability:       {type: Number, required: true, min: 1, max: 5},
  switch:          {type: Number, required: true, min: 1, max: 5},
  edge_control:    {type: Number, required: true, min: 1, max: 5},
  jib:             {type: Number, required: true, min: 1, max: 5},
  park:            {type: Number, required: true, min: 1, max: 5},
  freestyle:       {type: Number, required: true, min: 1, max: 5},
  all_mountain:    {type: Number, required: true, min: 1, max: 5},
  powder:          {type: Number, required: true, min: 1, max: 5},
  would_recommend: {type: String, required: true},
  conclusion:      {type: String, required: true},
  comment:        [{type: String, required: true}]
});

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};

var User = mongoose.model('User', userSchema);
var Inventory = mongoose.model('Inventory', inventorySchema);
var Snowboard = mongoose.model('Snowboard', snowboardSchema);
var Review = mongoose.model('Review', reviewSchema);

mongoose.connect(config.MONGO_URI);
mongoose.connection.on('error', function(err) {
  console.log('Error: Could not connect to MongoDB. Did you forget to run `mongod`?'.red);
});

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Force HTTPS on Heroku
if (app.get('env') === 'production') {
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
}
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 2628000000 }));

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }
  var token = req.headers.authorization.split(' ')[1];

  var payload = null;
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET);
  }
  catch (err) {
    return res.status(401).send({ message: err.message });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  req.user = payload.sub;
  next();
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}

/*
 |--------------------------------------------------------------------------
 | GET /api/me
 |--------------------------------------------------------------------------
 */
app.get('/api/profile', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    res.send(user);
  });
});

/*
 |--------------------------------------------------------------------------
 | PUT /api/me
 |--------------------------------------------------------------------------
 */
app.put('/api/profile', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user.displayName = req.body.displayName || user.displayName;
    user.email = req.body.email || user.email;
    user.save(function(err) {
      res.status(200).end();
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | GET /api/snowboard
 |--------------------------------------------------------------------------
 */
app.get('/api/snowboard', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    res.send(user);
  });
});

/*
 |--------------------------------------------------------------------------
 | PUT /api/snowboard
 |--------------------------------------------------------------------------
 */
app.put('/api/snowboard', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user.snowboardBrand = req.body.snowboardBrand;
    user.snowboardModel = req.body.snowboardModel;
    user.snowboardSize  = req.body.snowboardSize;
    user.save(function(err) {
      res.status(200).end();
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | GET /api/bindings
 |--------------------------------------------------------------------------
 */
app.get('/api/bindings', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    res.send(user);
  });
});

/*
 |--------------------------------------------------------------------------
 | PUT /api/bindings
 |--------------------------------------------------------------------------
 */
app.put('/api/bindings', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user.bindingsBrand = req.body.bindingsBrand;
    user.bindingsModel = req.body.bindingsModel;
    user.bindingsSize  = req.body.bindingsSize;
    user.save(function(err) {
      res.status(200).end();
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | GET /api/boots
 |--------------------------------------------------------------------------
 */
app.get('/api/boots', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    res.send(user);
  });
});

/*
 |--------------------------------------------------------------------------
 | PUT /api/snowboard
 |--------------------------------------------------------------------------
 */
app.put('/api/boots', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user.bootsBrand = req.body.bootsBrand;
    user.bootsModel = req.body.bootsModel;
    user.bootsSize  = req.body.bootsSize;
    user.save(function(err) {
      res.status(200).end();
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Log in with Email
 |--------------------------------------------------------------------------
 */
app.post('/auth/login', function(req, res) {
  User.findOne({ email: req.body.email }, '+password', function(err, user) {
    if (!user) {
      return res.status(401).send({ message: 'Invalid email and/or password' });
    }
    user.comparePassword(req.body.password, function(err, isMatch) {
      if (!isMatch) {
        return res.status(401).send({ message: 'Invalid email and/or password' });
      }
      res.send({ token: createJWT(user) });
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Create Email and Password Account
 |--------------------------------------------------------------------------
 */
app.post('/auth/signup', function(req, res) {
  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      return res.status(409).send({ message: 'Email is already taken' });
    }
    var user = new User({
      email: req.body.email,
      password: req.body.password
    });
    user.save(function(err, result) {
      if (err) {
        res.status(500).send({ message: err.message });
      }
      res.send({ token: createJWT(result) });
    });
  });
});

/*
|--------------------------------------------------------------------------
| Login with Instagram
|--------------------------------------------------------------------------
*/
app.post('/auth/instagram', function(req, res) {
  var accessTokenUrl = 'https://api.instagram.com/oauth/access_token';

  var params = {
    client_id: req.body.clientId,
    redirect_uri: req.body.redirectUri,
    client_secret: config.INSTAGRAM_SECRET,
    code: req.body.code,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post({ url: accessTokenUrl, form: params, json: true }, function(error, response, body) {

    // Step 2a. Link user accounts.
    if (req.headers.authorization) {
      User.findOne({ instagram: body.user.id }, function(err, existingUser) {
        if (existingUser) {
          return res.status(409).send({ message: 'There is already an Instagram account that belongs to you' });
        }

        var token = req.headers.authorization.split(' ')[1];
        var payload = jwt.decode(token, config.TOKEN_SECRET);

        User.findById(payload.sub, function(err, user) {
          if (!user) {
            return res.status(400).send({ message: 'User not found' });
          }
          user.instagram = body.user.id;
          user.picture = user.picture || body.user.profile_picture;
          user.displayName = user.displayName || body.user.username;
          user.save(function() {
            var token = createJWT(user);
            res.send({ token: token });
          });
        });
      });
    } else {
      // Step 2b. Create a new user account or return an existing one.
      User.findOne({ instagram: body.user.id }, function(err, existingUser) {
        if (existingUser) {
          return res.send({ token: createJWT(existingUser) });
        }

        var user = new User({
          instagram: body.user.id,
          picture: body.user.profile_picture,
          displayName: body.user.username
        });

        user.save(function() {
          var token = createJWT(user);
          res.send({ token: token, user: user });
        });
      });
    }
  });
});



/*
 |--------------------------------------------------------------------------
 | Unlink Provider
 |--------------------------------------------------------------------------
 */
app.post('/auth/unlink', ensureAuthenticated, function(req, res) {
  var provider = req.body.provider;
  var providers = ['facebook', 'foursquare', 'google', 'github', 'instagram',
    'linkedin', 'live', 'twitter', 'twitch', 'yahoo'];

  if (providers.indexOf(provider) === -1) {
    return res.status(400).send({ message: 'Unknown OAuth Provider' });
  }

  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User Not Found' });
    }
    user[provider] = undefined;
    user.save(function() {
      res.status(200).end();
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Start the Server
 |--------------------------------------------------------------------------
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
