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

});
