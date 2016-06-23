Template.petitionReject.events({
  'submit form': function(e){
    e.preventDefault();
    var reason = $('textarea[name=rejectReason]').val();
    if(reason.length == 0){
      throwError("Must have a message to reject!");
    }else{
      var _id = this.petition._id
      Meteor.call('changePendingPetition', _id, false, reason, function(error, result) {
        if (error) {
          throwError(error.reason);
        } else {
          setTimeout( function() { $('#petitionRejectModal').modal("hide") }, 1000);
          throwError(result);
        }
      });
    }

  }
});
