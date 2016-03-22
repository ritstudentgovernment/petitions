/** Site-wide, global information, including denormalized data.
 *
 *  Structure:
 *
 *    {
 *      petitionsCount:            <integer>, // Petition count
 *      minimumThreshold:      <integer>, // Current minimum threshold
 *      threshold_updated_at:  <integer>  // Last datetime threshold changed
 *    }
 */

Singleton = new Meteor.Collection('singleton');

Meteor.methods({
  'changeMinimumThreshold': function (threshold) {

    var user = Meteor.user(),
        thresholdInt = parseInt(threshold);

    if (!Roles.userIsInRole(user, ['admin']))
      throw new Meteor.Error(403, "You are not authorized to change the threshold.");

    if (thresholdInt % 1 != 0)
      throw new Meteor.Error(422, "Threshold not a whole number.");

    if (thresholdInt <= 0)
      throw new Meteor.Error(422, "Threshold must be positive.");

    Singleton.update({}, {$set: { minimumThreshold: thresholdInt,
                                  threshold_updated_at: new Date().getTime()}});

  },
  'toggleModeration': function(){
    var user = Meteor.user()
    var current = Singleton.findOne().moderation;
    if (!Roles.userIsInRole(user, ['admin']))
      throw new Meteor.Error(403, "You are not authorized to change the moderation.");
    if(current){
      Singleton.update({}, {$set: { moderation: false}});
    }else{
      Singleton.update({}, {$set: { moderation: true}});
    }
  },
  'toggleParallax': function(){
    var user = Meteor.user()
    var current = Singleton.findOne().parallax;
    if (!Roles.userIsInRole(user, ['admin']))
      throw new Meteor.Error(403, "You are not authorized to change the parallax setting.");
    if(current){
      Singleton.update({}, {$set: { parallax: false}});
    }else{
      Singleton.update({}, {$set: { parallax: true}});
    }
  },
  'togglePetitionHistoryDisplay': function(){
    var user = Meteor.user()
    var current = Singleton.findOne().petitionHistoryDisplay;
    if (!Roles.userIsInRole(user, ['admin']))
      throw new Meteor.Error(403, "You are not authorized to change the petition history display setting.");
    if(current){
      Singleton.update({}, {$set: { petitionHistoryDisplay: false}});
    }else{
      Singleton.update({}, {$set: { petitionHistoryDisplay: true}});
    }
  },
  'toggleUpdateAuthorDisplay': function(){
    var user = Meteor.user()
    var current = Singleton.findOne().updateAuthorDisplay;
    if (!Roles.userIsInRole(user, ['admin']))
      throw new Meteor.Error(403, "You are not authorized to change the update author display setting.");
    if(current){
      Singleton.update({}, {$set: { updateAuthorDisplay: false}});
    }else{
      Singleton.update({}, {$set: { updateAuthorDisplay: true}});
    }
  }
});
