Template.petitionSign.events({
  'submit form': function(e) {
    e.preventDefault();
    var petition = this.petition;
    var sign = function () {
      Meteor.call('sign', petition._id, function(error) {
      if (error)
        throwError(error.reason);
      else {
        var signaturesNeeded = petition.minimumVotes - petition.votes;
        if (signaturesNeeded >= 1) {
          $('#petitionShareModal').modal('show');
        }
      }
      });
    };
    if (Meteor.userId()) {
      sign();
    } else {
      Session.set("loginMsg", "Please login to sign.");
      $('#loginModal').modal('show');
      $('#loginModal').on('hidden.bs.modal', function () {
        if (Meteor.userId())
          sign();
      });
    }
  }
});

Template.petitionSign.helpers({
  signedClass: function() {
    var userId = Meteor.userId();
    if (userId && this.petition && _.include(this.petition.upvoters, userId) ||
        moment(this.petition.submitted).isBefore(moment().subtract(1, 'month'))) {
      return 'disabled';
    } else {
      return '';
    }
  },
  btnText: function() {
    var userId = Meteor.userId();
    if (userId && this.petition && _.include(this.petition.upvoters, userId)) {
      return 'Signed';
    } else if (moment(this.petition.submitted).isBefore(moment().subtract(1, 'month'))) {
      return 'Expired';
    } else {
      return 'Add My Name';
    }
  }
});
