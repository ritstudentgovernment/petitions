Template.petitionCard.events({
  'click .card-tag': function(e){
    Session.set('activeTag', e.target.name);
  },
});

Template.petitionCard.helpers({
  isExpired: function(e) {    
    if(moment(e.petition.submitted).isBefore(moment().subtract(1, 'month'))) {
      return true;
    }
    else {
      return false;
    }
  },  
  signedByUser: function(petition) {    
    return Meteor.user() && _.contains(petition.upvoters, Meteor.user()._id);
  },
  isResponded: function(e) {
    if (e.status == "responded"){
      return true;
    }else{
      return false;
    }
  }
});
