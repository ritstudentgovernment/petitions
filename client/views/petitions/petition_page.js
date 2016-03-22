var timeTick = new Deps.Dependency();

Meteor.setInterval(function () {
  timeTick.changed();
}, 1000);

Template.petitionPage.helpers({
  'responded_at': function () {
    timeTick.depend();
    return new moment(this.petition.responded_at).fromNow();
  },
  'submitted_at': function () {
    timeTick.depend();
    return new moment(this.petition.submitted).fromNow();
  },
  'initials': function () {
    return Meteor.users.find({
      '_id': {
        $in: this.petition.upvoters
      }
    }).fetch().map(function (user) {
      if (!user.profile.initials) {
        return "Unknown";
      } else {
        return user.profile.initials;
      }
    });
  },
  'show_history': function () {
    return Singleton.findOne().petitionHistoryDisplay;
  }
});

Template.petitionPage.events({
  'click #approve' : function(e){
    e.preventDefault();
    var _id = this.petition._id
    Meteor.call('changePendingPetition', _id, true, function(error) {
      if (error) {
        throwError(error.reason);
      } else {
        throwError(result);
      }
    });
  }
});
