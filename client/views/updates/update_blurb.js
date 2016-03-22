Template.updateBlurb.helpers({
  'showAuthor': function () {
    return Singleton.findOne().updateAuthorDisplay;
  }
});
