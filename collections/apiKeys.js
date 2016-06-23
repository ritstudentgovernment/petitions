ApiKeys = new Meteor.Collection('apiKeys');

Meteor.methods({
  createApiKey: function() {
    var user = Meteor.user();

    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to create an API Key.");

    var key = Meteor.uuid().replace(/-/g, '');

    var apiKey = {
      userId: user._id,
      created: new Date().getTime(),
      token: CryptoJS.MD5(key).toString()
    };

    ApiKeys.upsert({userId: user._id}, apiKey);

    return key;
  }
});
