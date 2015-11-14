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
    e.preventDefault();

    var petition = {
      title: Session.get('petition.title'),
      description: Session.get('petition.description'),
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
          throwError("Petition is pending approval, you will recieve an email once it has gone thorugh the approval process.");
        }else{
          Router.go('petitionPage', {_id: id});
        }
      }
    });
  },
  'keyup *[name=title]': function (e) {
    Session.set('petition.title', $('*[name=title]').val());
  },
  'keyup *[name=description]': function (e) {
    Session.set('petition.description', $('textarea[name=description]').val());
  }
});

Template.petitionSubmit.rendered = function () {
  Session.set('petition.tag_ids', []);
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
  $('#tags').on("change", function (e) {
    var tag_ids = Session.get('petition.tag_ids')
    if (e.added) {
      tag_ids.push(e.added._id);
      Session.set('petition.tag_ids', tag_ids);
    } else if (e.removed) {
      var tag_ids = _.without(tag_ids, e.removed._id);
      Session.set('petition.tag_ids', tag_ids);
    } else {
      // to-do
    }
  });
  // Accessing selected tags
  // $('#s2id_tags').select2('data');
};
