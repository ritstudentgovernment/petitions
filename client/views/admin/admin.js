Template.admin.events({
  'submit #thresholdForm': function (e) {
    e.preventDefault();
    var threshold = $(e.target).find('[name=minimumThreshold]').val();
    Meteor.call('changeMinimumThreshold', threshold, function (error) {
      if (error) {
        throwError(error.reason);
      } else {
        throwError("Minimum threshold changed.");
      }
    });
  },
  'submit #tagDelete': function (e) {
    e.preventDefault();
    Meteor.call('deleteTag', this._id, function (err) {
      if (err) {
        throwError(err.reason);
      }
    });
  },
  'submit #newPetitionTag': function (e) {
    e.preventDefault();
    var tagDOM = $(event.target).find('[name=name]');
    var payload = {name: tagDOM.val()};
    Meteor.call('createTag', payload, function (err) {
      if (err) {
        throwError(err.reason)
      } else {
        tagDOM.val("");
      }
    })
  },
  'submit #users form': function(e) {
    e.preventDefault();

    var username,
        usernameDOM = $(event.target).find('[name=username]'),
        role = $(event.target).find('[name=role]').val(),
        action = $(event.target).find('[name=action]').val();

    if (action === "add") {
      username = usernameDOM.val();
    }
    if (action === "remove") {
      username = this.username;
    }

    Meteor.call('editUserRole', username, role, action, function (error) {
      if (action === "add")
          usernameDOM.val("");
      if (error) {
        GAnalytics.event("account", "edit", error.reason);
        throwError(error.reason);
      } else {
        GAnalytics.event("account", "edit");
      }
    });
  }
});

Template.interface.events({
  'submit #changeParallax': function(e){
    e.preventDefault();
    Meteor.call('toggleParallax');
  },
  'submit #changePetitionHistoryDisplay': function(e){
    e.preventDefault();
    Meteor.call('togglePetitionHistoryDisplay');
  },
  'submit #changeUpdateAuthorDisplay': function(e){
    e.preventDefault();
    Meteor.call('toggleUpdateAuthorDisplay');
  }
});

Template.interface.helpers({
  'parallaxStyle' : function(){
    if(Singleton.findOne().parallax){
      return 'Enabled'
    }else{
      return 'Disabled'
    }
  },
  'petitionHistoryDisplayStyle' : function(){
    if(Singleton.findOne().petitionHistoryDisplay){
      return 'Enabled'
    }else{
      return 'Disabled'
    }
  },
  'updateAuthorDisplayStyle' : function(){
    if(Singleton.findOne().updateAuthorDisplay){
      return 'Enabled'
    }else{
      return 'Disabled'
    }
  }
});
