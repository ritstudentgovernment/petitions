Template.petitionGroup.events({
  'change #petition-order': function(evt) {
     Session.set("petitionOrder", evt.currentTarget.value);
  },
  'click #load-more': function () {
    Session.set('petitionsLimit', Session.get('petitionsLimit') + 12);
  },
  'click .tag-item': function (e) {
    if(e.target.id == 'all'){
      Session.set('activeTag', null);
    }else{
      Session.set('activeTag', e.target.id);
    }
  }
});

Template.petitionGroup.helpers({
  'isActiveTag' : function(name){
    if((name == Session.get('activeTag')) ||
    (!Session.get('activeTag') && (name == 'all'))){
      return 'active';
    }else{
      return '';
    }
  },
  'tagTitle' : function() {
    if(Session.get('activeTag')){
      return Session.get('activeTag') + ' Petitions';
    }else{
      return this.title;
    }
  }
});

Template.petitionGroup.helpers({
  'sortType': function(title){
    if(title == "Responses"){
      return "responded_at"
    }else{
      return "submitted"
    }
  }
});

Template.petitionGroup.rendered = function () {
  $('[data-toggle="tooltip"]').tooltip();
};
