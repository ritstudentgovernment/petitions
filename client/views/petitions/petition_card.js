Template.petitionCard.events({
  'click .card-tag': function(e){
    Session.set('activeTag', e.target.name);
  },
});

Template.petitionCard.helpers({
  isExpired: function(e) {
    console.log(e);
    var petition = Petitions.findOne(e.petition._id);
    if(moment(petition.submitted).isBefore(moment().subtract(1, 'month'))) {
      return true;
    }
    else {
      return false;
    }
  }
});
