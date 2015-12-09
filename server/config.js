module.exports = {
  db: process.env.db || 'mongodb://heroku_d4m1dfdj:cbu9ao761pm92h2m3g8tfmfhps@ds027415.mongolab.com:27415/heroku_d4m1dfdj',
  clientSecret: process.env.clientSecret || '3153855e6d414ab49fe75cfcdd1d2f35',
  tokenSecret: process.env.tokenSecret || 'diablo'
};
