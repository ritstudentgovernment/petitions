// Initialize Petition Count singleton

if (Singleton.find().count() === 0) {
  Singleton.insert({
    minimumThreshold: 25,
    threshold_updated_at: new Date().getTime()
  });
}

// Add test petitions to non-production instances

if (false){//Petitions.find().count() === 0 && process.env.NODE_ENV != "production" ) {

  console.log("Adding test tags...");

  var tagId_housing = Tags.insert({name: "Housing"});
  var tagId_technology = Tags.insert({name: "Technology"});
  var tagId_dining = Tags.insert({name: "Dining"});
  var tagId_test = Tags.insert({name: "Test"});

  console.log("Adding test petitions...");



  var peteId = Meteor.users.insert({
    username: 'pam3961',
    profile: {
      displayName: 'Pete Mikitsh',
      givenName: 'Pete',
      initials: 'PAM',
      sn: 'Mikitsh',
      name: 'Pete Mikitsh'
    },
    notify: {
      updates: false,
      response: true
    }
  });

  var pete = Meteor.users.findOne(peteId);

  // Petition with 7-day history

  var petitionId_seven_day = Petitions.insert({
    userId: pete._id,
    author: pete.profile.displayName,
    submitted: moment().subtract(7, 'days').valueOf(),
    title: "Build more affordable, on-campus housing.",
    description: "As there is only enough housing for half the student population, it creates a challenge to find affordably priced off-campus housing.",
    upvoters: [pete._id],
    votes: 50,
    minimumVotes: Singleton.findOne().minimumThreshold,
    tag_ids: [tagId_housing]
  });
  // Petition with 3-day history

  var petitionId_three_day = Petitions.insert({
    userId: pete._id,
    author: pete.profile.displayName,
    submitted: moment().subtract(3, 'days').valueOf(),
    title: "Extend hours for RIT Computer Labs at peak times.",
    description: "Students often work late near the end of semester; extended lab time will allow more students to utilize this on-campus resource.",
    upvoters: [pete._id],
    votes: 4,
    minimumVotes: Singleton.findOne().minimumThreshold,
    tag_ids: [tagId_technology]
  });

  // Petition with 0-day history

  var petitionId_no_history = Petitions.insert({
    userId: pete._id,
    author: pete.profile.displayName,
    submitted: new Date().getTime(),
    title: "Offer more options for students with unique dietary needs.",
    description: "Increase the number of options for vegan students at on-campus Dining Service locations.",
    upvoters: [pete._id],
    votes: 1,
    minimumVotes: Singleton.findOne().minimumThreshold,
    tag_ids: [tagId_test, tagId_dining]
  });

  // Expired petition

  var petitionId_expired = Petitions.insert({
    userId: pete._id,
    author: pete.profile.displayName,
    submitted: moment().subtract(2, 'months').valueOf(),
    title: "Expired Petition.",
    description: "This petition has expired because it is greater than one month old.",
    upvoters: [pete._id],
    votes: 1,
    minimumVotes: Singleton.findOne().minimumThreshold,
    tag_ids: [tagId_housing]
  });

  // Extra petitions for testing scalability and pagination

  for (var i = 0; i < 10; i++) {
    Petitions.insert({
      userId: pete._id,
      author: pete.profile.displayName,
      submitted: new Date().getTime(),
      title: 'Test petition #' + i,
      description: "Foo",
      upvoters: [pete._id],
      votes: 1,
      minimumVotes: Singleton.findOne().minimumThreshold,
      tag_ids: [tagId_test]
    });
  }

}

// Configure initial admin user

if (Meteor.users.find({username: "sgweb"}).count() === 0) {
  var sgwebId = Meteor.users.insert({
    username: 'sgweb',
    profile: {
      displayName: 'Pete Mikitsh (Student Employee)',
      givenName: 'Pete',
      initials: 'PAM',
      sn: 'Mikitsh',
      name: 'Pete Mikitsh'
    },
    notify: {
      updates: false,
      response: true
    }
  });
  var sgweb = Meteor.users.findOne(sgwebId);
  Roles.addUsersToRoles(sgweb, ['admin']);
}

// Update petition count

Singleton.update({}, {$set: {petitionsCount: Petitions.find().count()}});
