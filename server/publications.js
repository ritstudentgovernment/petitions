var findPetitions = function (options) {
  var sort = {},
      selector = {};

  // configure sort parameters

  sort[options.sortBy] = -1;
  sort.submitted = -1;

  // configure query selector
  if (options.ignoreStatus == null || options.ignoreStatus == false){
    selector.status = {$in: [options.status]};
  }
  if (options.tagName) {
    selector.tag_ids = {$in: [Tags.findOne({name: options.tagName})._id]}
  }
  if (!Roles.userIsInRole(options.userId, ['admin'])) {
    selector['published'] = true;
  }
	
  if (options.showSigned) {
    selector.upvoters = options.userId;
  }
  
  if (options.showCreated) {
    selector.userId = options.userId;
  }
  
  return Petitions.find(selector, {
    limit: options.limit,
    sort: sort,
    fields: {
      author: 1,
      title: 1,
      votes: 1,
      submitted: 1,
      status: 1,
      tag_ids: 1,
      lastSignedAt: 1,
      upvoters: 1,
      pending: 1
    }
  });
};

Meteor.publish('petitions', function (limit, sortBy, tagName, showSigned, showCreated) {
  return findPetitions.call(this, {
    limit: limit,
    sortBy: sortBy,
    tagName: tagName,
    userId: this.userId,
    showSigned: showSigned,
    showCreated: showCreated,
    status: null
  });
});

Meteor.publish('petitionsSearch', function (limit, sortBy, tagName, showSigned, showCreated) {
  return findPetitions.call(this, {
    limit: limit,
    sortBy: sortBy,
    tagName: tagName,
    userId: this.userId,
    showSigned: showSigned,
    showCreated: showCreated,
    ignoreStatus: true
  });
});


Meteor.publish('petitionsInProgress', function (limit, sortBy, tagName, showSigned, showCreated) {
  return findPetitions.call(this, {
    limit: limit,
    sortBy: sortBy,
    tagName: tagName,
    status: "waiting-for-reply",
    userId: this.userId,
    showSigned: showSigned,
    showCreated: showCreated
  });
});

Meteor.publish('petitionsWithResponses', function (limit, sortBy, tagName, showSigned, showCreated) {
  return findPetitions.call(this, {
    limit: limit,
    sortBy: sortBy,
    tagName: tagName,
    status: "responded",
    userId: this.userId,
    showSigned: showSigned,
    showCreated: showCreated
  });
});

Meteor.publish('pendingPetitions', function(){
  if (Roles.userIsInRole(this.userId, ['admin', 'moderator'])) {
    return Petitions.find({pending: true});
  }else{
    this.stop();
    return;
  }
});

Meteor.publish('singlePetition', function (id) {
  var selector = {};
  selector["_id"] = id;
  if ((!Roles.userIsInRole(this.userId, ['admin', 'moderator']))) {
    selector['published'] = true;
  }
  return Petitions.find(selector, {
    fields: {
      author: 1,
      title: 1,
      description: 1,
      votes: 1,
      submitted: 1,
      response: 1,
      responded_at: 1,
      upvoters: 1,
      subscribers: 1,
      minimumVotes: 1,
      status: 1,
      tag_ids: 1,
      published: 1,
      pending: 1
    }
  });
});

Meteor.publish('singleton', function () {
  return Singleton.find();
});

Meteor.publish('apiKeys', function () {
  return ApiKeys.find({userId: this.userId}, {fields: {created: 1, userId: 1}});
});

Meteor.publish('privilegedUsers', function () {
  if (Roles.userIsInRole(this.userId, ['admin'])) {
    return Meteor.users.find({roles: {$in: ['admin', 'moderator']}}, {
      fields: {
        username: 1,
        roles: 1,
        "profile.name": 1
      }
    });
  } else {
    this.stop();
    return;
  }
});

Meteor.publish('signatories', function (petitionId) {
  var petition = Petitions.findOne(petitionId);
  if (petition) {
    return Meteor.users.find({_id: {$in: petition.upvoters}}, {
      fields: {
        "profile.initials": 1
      }
    });
  } else {
    return [];
  }
});

Meteor.publish('updates', function (petitionId) {
  return Updates.find(
    { petitionId: petitionId },
    { fields:
      {
        title: 1,
        description: 1,
        created_at: 1,
        author: 1
      }
    }
  );
});

Meteor.publish('tags', function () {
  return Tags.find({},{sort: {name: 1} } );
});

// Expose individual users' notification preferences
Meteor.publish(null, function() {
  return Meteor.users.find({_id: this.userId}, {fields: {'notify.updates': 1, 'notify.response': 1}});
});
