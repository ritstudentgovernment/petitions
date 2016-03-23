Petitions = new Meteor.Collection('petitions');

if (Meteor.isServer)
  Petitions._ensureIndex({title: 1}, {unique: 1});

PetitionsIndex = new EasySearch.Index({
  collection: Petitions,
  fields: ['title', 'description', 'author'],
  engine: new EasySearch.Minimongo()
}, {
  limit: 50
})

var validatePetitionOnCreate = function validatePetitionOnCreate (petitionAttributes) {

  // ensure title is unique
  if (Petitions.findOne({title: petitionAttributes.title}))
    throw new Meteor.Error(422, 'This title has already been used. Write a different one.');

};

var validatePetition = function validatePetition (petitionAttributes) {

  // ensure the user is logged in
  if (!Meteor.user())
    throw new Meteor.Error(401, "You need to login to do that.");

  // ensure the petition has a title
  if (!petitionAttributes.title || !petitionAttributes.title.trim())
    throw new Meteor.Error(422, 'Please fill in a \n title.');

  var titleLength = petitionAttributes.title.length;
  if (titleLength > 70)
    throw new Meteor.Error(422, 'Title must not exceed 70 characters. Currently: ' + titleLength );

  // ensure the petition has at least one tag
  if (!petitionAttributes.tag_ids || petitionAttributes.tag_ids.length == 0)
    throw new Meteor.Error(422, 'Please add at least one tag to the petition.');

  if (petitionAttributes.tag_ids.length > 3)
    throw new Meteor.Error(422, 'Petitions are limited to at most 3 tags.');

  // ensure the petition has a description
  if (!petitionAttributes.description || !petitionAttributes.description.trim())
    throw new Meteor.Error(422, 'Please fill in a description.');

  var descriptionLength = petitionAttributes.title.length;
  if (descriptionLength > 10000)
    throw new Meteor.Error(422, 'Description must not exceed 10000 characters. Currently: ' + descriptionLength );
};

Meteor.methods({
  petition: function(petitionAttributes) {

    validatePetition(petitionAttributes);
    validatePetitionOnCreate(petitionAttributes);

    var user = Meteor.user();
    var publishByDefault = !(Singleton.findOne().moderation);

    // pick out the whitelisted keys
    var petition = _.extend(_.pick(petitionAttributes, 'title', 'description', 'tag_ids'), {
      userId: user._id,
      author: user.profile.name,
      submitted: new Date().getTime(),
      upvoters: [user._id],
      subscribers: [user._id],
      votes: 1,
      minimumVotes: Singleton.findOne().minimumThreshold,
      published: publishByDefault,
      pending: Singleton.findOne().moderation,
      lastSignedAt: new Date().getTime()
    });

    var petitionId = Petitions.insert(petition);

    Singleton.update({}, {$inc: {petitionsCount: 1}});

    return petitionId;
  },

  sign: function(petitionId) {
    var user = Meteor.user();

    if (!user)
      throw new Meteor.Error(401, "You need to login to sign a petition.");

    var petition = Petitions.findOne(petitionId);

    if (!petition.published)
      throw new Meteor.Error(401, "This petition is not published.");

    if (moment(petition.submitted).isBefore(moment().subtract(1, 'month')))
      throw new Meteor.Error(401, "This petition has expired.");

    Petitions.update({
      _id: petitionId,
      upvoters: {$ne: user._id}
    }, {
      $addToSet: {upvoters: user._id},
      $inc: {votes: 1},
      $set: {lastSignedAt: new Date().getTime()}
    });
    Petitions.update({
      _id: petitionId,
      subscribers: {$ne: user._id}
    }, {
      $addToSet: {subscribers: user._id}
    });
    if(Meteor.isServer){
      if (petition.votes === petition.minimumVotes && Meteor.isServer) {
        var users = Meteor.users.find({roles: {$in: ['notify-threshold-reached']}});
        var emails = users.map(function (user) { return user.profile.mail || user.username + '@' + Meteor.settings.MAIL.default_domain; });

        if (!_.isEmpty(emails)) {
          Mailer.sendTemplatedEmail(
            "petition_threshold_reached",
            {
              to: emails
            },
            {
              petition: petition
            }
          );
        }
      }
    }

  },
  subscribe: function(petitionId) {
    var user = Meteor.user();

    if (!user)
      throw new Meteor.Error(401, "You need to login to subscribe to a petition.");

    var petition = Petitions.findOne(petitionId);

    if (!petition.published)
      throw new Meteor.Error(401, "This petition is not published.");

    Petitions.update({
      _id: petitionId,
      subscribers: {$ne: user._id}
    }, {
      $addToSet: {subscribers: user._id}
    });
  },
  edit: function (petitionId, petitionAttributes) {

    var oldPetition = Petitions.findOne(petitionId, {
                    fields: { response: 1,
                              upvoters: 1,
                              subscribers: 1,
                              author: 1 }});

    validatePetition(petitionAttributes);

    var user = Meteor.user();

    if (!Roles.userIsInRole(user, ['admin', 'moderator']))
      throw new Meteor.Error(403, "You are not authorized to edit petitions.");

    // pick out the whitelisted keys
    var petition = _.extend(_.pick(petitionAttributes, 'title', 'description', 'response', 'status', 'tag_ids'));

    if (_.isEmpty(petition.response)) {
      delete petition.response;
    } else {
      petition.responded_at = new Date().getTime();
    }

    Petitions.update(petitionId, {$set: petition });

    if (_.isEmpty(oldPetition.response) && !_.isEmpty(petition.response)) {

      Petitions.update(petitionId, {$set: {status: "responded"}});

      this.unblock();

      if(Meteor.isServer){
        var notifyees = Meteor.users.find({$and: [{'notify.response': true},
                                             {_id: {$in: oldPetition.subscribers}}]},
                                      {fields: {username: 1}});

        var emails = notifyees.map(function (user) { return user.username + Meteor.settings.MAIL.default_domain; });

        Mailer.sendTemplatedEmail("petition_response_received", {
            bcc: emails
          },{
            petition: petition,
            oldPetition: oldPetition
          }
        );
      }
    }
  },
  delete: function (petitionId) {

    var user = Meteor.user();

    if (!Roles.userIsInRole(user, ['admin']))
      throw new Meteor.Error(403, "You are not authorized to delete petitions.");

    Petitions.remove(petitionId);

    Singleton.update({}, {$inc: {petitionsCount: -1}});

  },

  changePublishStatus: function (petitionId) {

    var user = Meteor.user();

    if (!Roles.userIsInRole(user, ['admin']))
      throw new Meteor.Error(403, "You are not authorized to change publishing status.");

    var petition = Petitions.findOne(petitionId);
    Petitions.update(petitionId, {$set: {published: !petition.published}});

  }
});
