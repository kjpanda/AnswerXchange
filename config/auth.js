// Will hold all the user secret keys (facebook and google)

//expose our config directly to our app using module.exports

module.exports = {

  'facebookAuth' : {
    'clientID' : '2137116316303214', //our app ID for facebook
    'clientSecret' : 'f09aad2fd19bef9109492e86a34442fe', //app secret from facebook developers
    'callbackURL' : 'http://localhost:3000/auth/facebook/callback',
    'profileURL' : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
    'profileFields' : ['id', 'displayName', 'emails'] // For requesting permissions from Facebook API
  }
};
