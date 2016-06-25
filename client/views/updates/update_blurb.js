Template.updateBlurb.helpers({
  'showAuthor': function () {
    return Singleton.findOne().updateAuthorDisplay;
  },
  'submitted_date':function(){
    return new moment(this.created_at).format('MMMM Do YYYY, h:mm a');
  }
});
