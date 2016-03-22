//This function is called by event handlers and is debounced by a few milliseconds.  Since the Session is reactive,
//if this is not debounced, a user could have their text overwritten by what was just put in the session a few milliseconds ago.
var savePetitionSessionState = function() {
  Session.set('petition.title', $('*[name=title]').val());
  Session.set('petition.description', $('textarea[name=description]').val());
  Session.set('petition.tag_ids', _.pluck($('#s2id_tags').select2('data'), '_id'));  
};

Template.petitionSubmit.helpers({
  'emptyPetition': function() {

    return {
      votes: 1,
      author: Meteor.user().profile.name,
      title: Session.get('petition.title'),
      tag_ids: Session.get('petition.tag_ids')
    }
  },
  'title': function() {
    return Session.get('petition.title');
  },
  'author': function() {
    return Meteor.user().profile.displayName;
  }
});

Template.petitionSubmit.helpers({
  'respondedPetition': function() {

    return {
      votes: 1,
      author: Meteor.user().profile.name,
      title: Session.get('petition.title'),
      status: 'responded',
      tag_ids: Session.get('petition.tag_ids')
    }
  },
  'title': function() {
    return Session.get('petition.title');
  },
  'author': function() {
    return Meteor.user().profile.displayName;
  }
});
Template.petitionSubmit.helpers({
  'inProgressPetition': function() {

    return {
      votes: 1,
      author: Meteor.user().profile.name,
      title: Session.get('petition.title'),
      status: 'waiting-for-reply',
      tag_ids: Session.get('petition.tag_ids')
    }
  },
  'title': function() {    
    return Session.get('petition.title');
  },
  'author': function() {
    return Meteor.user().profile.displayName;
  }
});

Template.petitionSubmit.events({
  'submit form': function(e) {
    //Since this function is debounced by event handlers, it may not have run yet.  This is to ensure someone doesn't
    //quickly write up a petition and hammer the enter key before the debounced function is run.
    savePetitionSessionState();
    e.preventDefault();

    var markupStr = $('#summernote').summernote('code');
    var petition = {
      title: Session.get('petition.title'),
      description: markupStr,
      tag_ids: Session.get('petition.tag_ids')
    }

    Meteor.call('petition', petition, function(error, id) {
      if (error) {
        // display the error to the user
        throwError(error.reason);
        if (error.error === 302)
          Router.go('petitionPage', {_id: error.details})
      } else {
        
        Session.set('petition.title', '');
        Session.set('petition.description', '');
        if(Singleton.findOne().moderation){
          Router.go('index');
          throwError("Petition is pending approval, you will receive an email once it has gone thorugh the approval process.");
        }else{
          Router.go('petitionPage', {_id: id});
        }
      }
    });
  },
  'keyup *[name=title]': _.debounce(savePetitionSessionState, 250),
  'keyup *[name=description]': _.debounce(savePetitionSessionState, 250)
});

Template.petitionSubmit.rendered = function () {
  Session.set('petition.tag_ids', []);

  $('#summernote').summernote();

  Deps.autorun(function () {
    $('#tags').select2({
      placeholder: "Petition Tags",
      data: {results: Tags.find({}, {sort: {name: 1}}).fetch()},
      multiple: true,
      maximumSelectionSize: 3,
      id: function (object) { return object._id; },
      matcher: function(term, text, option) { return option.name.toUpperCase().indexOf(term.toUpperCase()) > -1; },
      formatSelection: function (object, container) { return object.name.toUpperCase(); },
      formatResult: function (object, container, query) { return object.name; },
      formatNoMatches: function (object) { return "No tags found." },
      formatSelectionTooBig: function (object) { return "You can only select up to 3 tags." }
    });
    $('.select2-search-field>input').addClass("input");
  });
  $('#tags').on("change", savePetitionSessionState);
  // Accessing selected tags
  // $('#s2id_tags').select2('data');
};
