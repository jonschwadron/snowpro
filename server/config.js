module.exports = {
  // App Settings
  MONGO_URI: process.env.MONGO_URI || 'heroku_d4m1dfdj:cbu9ao761pm92h2m3g8tfmfhps@ds027415.mongolab.com:27415/heroku_d4m1dfdj',
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'diabloSnowboarder33',

  // OAuth 2.0
  FACEBOOK_SECRET: process.env.FACEBOOK_SECRET || 'YOUR_FACEBOOK_CLIENT_SECRET',
  FOURSQUARE_SECRET: process.env.FOURSQUARE_SECRET || 'YOUR_FOURSQUARE_CLIENT_SECRET',
  GOOGLE_SECRET: process.env.GOOGLE_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
  GITHUB_SECRET: process.env.GITHUB_SECRET || 'YOUR_GITHUB_CLIENT_SECRET',
  INSTAGRAM_SECRET: process.env.INSTAGRAM_SECRET || 'YOUR_INSTAGRAM_CLIENT_SECRET',
  LINKEDIN_SECRET: process.env.LINKEDIN_SECRET || 'YOUR_LINKEDIN_CLIENT_SECRET',
  TWITCH_SECRET: process.env.TWITCH_SECRET || 'YOUR_TWITCH_CLIENT_SECRET',
  WINDOWS_LIVE_SECRET: process.env.WINDOWS_LIVE_SECRET || 'YOUR_MICROSOFT_CLIENT_SECRET',
  YAHOO_SECRET: process.env.YAHOO_SECRET || 'YOUR_YAHOO_CLIENT_SECRET',
  BITBUCKET_SECRET: process.env.YAHOO_SECRET || 'YOUR_BITBUCKET_CLIENT_SECRET',

  // OAuth 1.0
  TWITTER_KEY: process.env.TWITTER_KEY || 'YOUR_TWITTER_CONSUMER_KEY',
  TWITTER_SECRET: process.env.TWITTER_SECRET || 'YOUR_TWITTER_CONSUMER_SECRET'
};

// module.exports = {
//   db: process.env.db || 'heroku_d4m1dfdj:cbu9ao761pm92h2m3g8tfmfhps@ds027415.mongolab.com:27415/heroku_d4m1dfdj',
//   clientSecret: process.env.clientSecret || '3153855e6d414ab49fe75cfcdd1d2f35',
//   tokenSecret: process.env.tokenSecret || 'diablo'
// };
