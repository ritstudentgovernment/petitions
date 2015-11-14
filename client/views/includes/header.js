Template.header.events({
  'click .navbar-search': function () {
    $('#modal-search').modal();
    setTimeout( function() {
      $('#search').focus();
    }, 500);
  }
});

Template.header.helpers({

  'moderationEnabled' : function(){
    var enabled = false;
    if(Singleton.findOne()){
      enabled = Singleton.findOne().moderation;
    }
    var admin = Roles.userIsInRole(Meteor.user(), ['admin']);
    var moderator = Roles.userIsInRole(Meteor.user(), ['moderator']);
    if(enabled &&(admin || moderator)){
      return true;
    }else{
      return admin;
    }
  }
})

//Collapses the navbar when navigating.
//In a traditional application, the state would be reset on navigation.
//Becuase the page is not reloaded, navbar needs to be manually collapsed.
$(document).on('click.nav','.navbar-collapse.in',function(e){
  if( $(e.target).is('a') ) {
      $(this).collapse('hide');
  }
});
