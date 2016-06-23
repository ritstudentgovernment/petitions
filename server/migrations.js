Migrations = new Meteor.Collection('migrations');

Meteor.startup(function () {

  // change default schema to include notification preferences for users
  if (!Migrations.findOne({name: "addDefaultNotificationPreferences"})) {
    Meteor.users.find().forEach(function (user) {
      Meteor.users.update(user._id, {$set: {notify: {updates: false, response: true}}});
    });
    Migrations.insert({name: "addDefaultNotificationPreferences"});
  }

  // only necessary if upgrading from <=v1.1.1 to a newer release
  // ensures that all required user profile attributes are defined
  if (!Migrations.findOne({name: "ensureProfilePropertyExistsForUsers"})) {
    Meteor.users.find().forEach(function (user) {
      if (!user.profile) {
        Meteor.users.update(user._id, {$set: { profile: {
          displayName: null,
          givenName: null,
          initials: null,
          sn: null,
          name: null
        }}});
      }
    });
    Migrations.insert({name: "ensureProfilePropertyExistsForUsers"});
  }

  if(!Migrations.findOne({name: "renamePostToPetition"})){
    Posts = new Meteor.Collection('posts');
    Posts.find().forEach(function (post){
      Petitions.insert(post);
      Posts.remove(post);
    });
    Migrations.insert({name: "renamePostToPetition"});
  }

  if(!Migrations.findOne({name: "fixSingletonPetitionCount"})){
    single = Singleton.findOne();
    single.petitionsCount += single.postsCount;
    Migrations.insert({name: "fixSingletonPetitionCount"});
  }

  // auto-subscribe users to status update e-mails *if* they have official responses enabled
  if (!Migrations.findOne({name: "enableStatusUpdateEmailsIfOfficialResponsesEnabled"})) {
    Meteor.users.update({'notify.response': true}, {$set: {'notify.updates': true}}, {multi: true});
    Migrations.insert({name: "enableStatusUpdateEmailsIfOfficialResponsesEnabled"});
  }

  // mark all existing petitions as published by default
  if (!Migrations.findOne({name: "markAllPreviousPetitionsAsPublished"})) {
    Petitions.update({}, {$set: {published: true}}, {multi: true});
    Migrations.insert({name: "markAllPreviousPetitionsAsPublished"});
  }

  // update all petitions to have a lastSignedAt field
  if (!Migrations.findOne({name: "addLastSignedAtField"})){
    Petitions.update({}, {$set: {lastSignedAt: new Date().getTime()}});
    Migrations.insert({name: "addLastSignedAtField"});
  }

  // change updates to reference petitionId rather than postId
  if(!Migrations.findOne({name: "fixUpdatesPetitionIdField"})){
    Updates.update({}, {$rename: { 'postId' : 'petitionId'}}, {multi: true});
    Migrations.insert({name: "fixUpdatesPetitionIdField"});
  }

  // Adds all upvoters to subscribers for every petition.
  if(!Migrations.findOne({name: "addUpvotersToSubscribers"})){
    //Petitions.update({}, {$set: {subscribers: upvoters}});
    Petitions.find().forEach(function (petition){
      Meteor.users.find({_id: {$in: petition.upvoters}},{fields: {username: 1}}).forEach(function (u){
        Petitions.update({
            _id: petition.petitionId,
            subscribers: {$ne: u}
          }, {
            $addToSet: {subscribers: u}
          });
      });

    });
    Migrations.insert({name: "addUpvotersToSubscribers"});
  }

});
