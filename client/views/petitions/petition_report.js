Template.petitionReport.events({
  'submit form': function (e) {
    e.preventDefault();

    Session.set("waiting", true);

    var _id = this.petition._id,
        reason = $("input[name='report-reason']:checked").val();

    Meteor.call('report', _id, reason, function(error) {

      Session.set("waiting", false);

      if (error) {
        throwError(error.reason);
        GAnalytics.event("petition", "report", error.reason);
      } else {
        throwError("Petition reported.");
        setTimeout( function() { $('#petitionReportModal').modal("hide") }, 1000);
        GAnalytics.event("petition", "report", _id);
      }
    });
  }
});
