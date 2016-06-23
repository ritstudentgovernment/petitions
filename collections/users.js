Meteor.methods({
  editUserRole: function(username, role, actionType) {
    var editingLocked;
    try {
        editingLocked = Meteor.settings.public.ui.roles_locked;
    }catch(Exception){
        editingLocked = false;
    }
    
    if(editingLocked)
      throw new Meteor.Error(403, "Roles are not editable.");

    var loggedInUser = Meteor.user();
    var action;

    if (!loggedInUser || !Roles.userIsInRole(loggedInUser, ['admin']))
      throw new Meteor.Error(403, "Access Denied.");

    if (actionType == 'add')
      action = {$addToSet: {roles: role}};
    else
      action = {$pull: {roles: role}};

    Meteor.users.update({username: username}, action);

  },
  editNotifications: function(notificationPrefs) {

    var user = Meteor.user();

    if (!user)
      throw new Meteor.Error(401, "You need to login to update notification preferences.");

    var notifyAttributes = _.pick(notificationPrefs, 'updates', 'response');

    if (typeof notifyAttributes.updates != "boolean" || typeof notifyAttributes.response != "boolean") {
      throw new Meteor.Error(422, 'Notification preferences could not be saved.');
    }
    
    Meteor.users.update(user._id, {$set: {notify: notifyAttributes}});
  },
  editProfile: function(profilePrefs) {
    var editingLocked;
    try {
        editingLocked = Meteor.settings.public.ui.initials_locked;
    }catch(Exception){
        editingLocked = false;
    }
    
    //Right now the only thing you can edit on your profile is your initials.
    if(editingLocked)
      throw new Meteor.Error(403, "Initials are not editable.");

    var user = Meteor.user();

    if (!user)
      throw new Meteor.Error(401, "You need to login to update your profile.");

    var initials = profilePrefs.initials;
    
    if (typeof initials != "string") {
      throw new Meteor.Error(422, 'Profile preferences could not be saved.');
    }
    
    if (initials.trim().length < 1) {
      throw new Meteor.Error(422, 'Profile initials are too short.');
    }
    
    if (initials.trim().length > 5) {
      throw new Meteor.Error(422, 'Profile initials are too long.');
    }
    
    Meteor.users.update(user._id, {$set: {'profile.initials': initials }});
  }
});