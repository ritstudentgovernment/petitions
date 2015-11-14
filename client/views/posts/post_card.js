Template.postCard.events({
  'click .card-tag': function(e){
    Session.set('activeTag', e.target.name);
  },
});

Template.postCard.helpers({
  isExpired: function(e) {
    console.log(e);
    var post = Posts.findOne(e.post._id);
    if(moment(post.submitted).isBefore(moment().subtract(1, 'month'))) {
      return true;
    }
    else {
      return false;
    }
  }
});
