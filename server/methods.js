Meteor.methods({
  report: function(petitionId, reason) {

    var user = Meteor.user();

    if (!user)
      throw new Meteor.Error(401, "You need to login to report a petition.");

    if (!reason)
      throw new Meteor.Error(401, "You need to specify a reason for reporting the petition.");

    var petition = Petitions.findOne(petitionId);

    if (petition) {

      this.unblock();

      Mailer.sendTemplatedEmail("report_petition", {}, {
        petition: petition,
        reason: reason
      });
    }

  },
  changePendingPetition: function(petitionId, approved, message){
    var user = Meteor.user()
    if (!Roles.userIsInRole(user, ['admin', 'moderator']))
      throw new Meteor.Error(403, "You are not authorized to approve this petition.");

    var petition = Petitions.findOne(petitionId);
    Petitions.update(petitionId, {$set: {pending: false}});
    var users = Meteor.users.find({_id: {$in: petition.upvoters}},
                                  {fields: {username: 1}});
    var emails = users.map(function (user) { return user.username + Meteor.settings.MAIL.default_domain; });
    if(approved){
      Petitions.update(petitionId, {$set: {published: true,
        submitted: new Date().getTime()}});

        Mailer.sendTemplatedEmail("petition_approved", {
            bcc: emails
          }, {
            petition: petition
          }
        );

        return "Petition Approved!";

    }else{
        Mailer.sendTemplatedEmail("petition_rejected", {
              bcc: emails
          },{
            petition: petition,
            message: message
          }
        );

      return "Petition Rejected.";
    }
  }
});
