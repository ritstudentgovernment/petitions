Meteor.startup(function () {
  Singleton.update({}, {$set: { version: "v1.2.3.1" }});
  console.log(Singleton.findOne().moderation);
  if(Singleton.findOne().moderation === undefined){
    console.log("Setting Default");
    Singleton.update({}, {$set: { moderation: false}});
  }
  process.env.MAIL_URL = Meteor.settings.MAIL.gateway_url;
});
