var social_links = {
  'facebook': 'https://www.facebook.com/sharer/sharer.php?u=',
  'twitter': 'https://twitter.com/intent/tweet?url=',
  'reddit': 'http://www.reddit.com/submit?url=',
  'plus': 'https://plus.google.com/share?url=',
  'linkedin': 'https://www.linkedin.com/cws/share?url='
};

var timeTick = new Deps.Dependency();

Meteor.setInterval(function () {
  timeTick.changed();
}, 1000);


Template.postPage.helpers({
  'responded_at': function () {
    timeTick.depend();
    return new moment(this.post.responded_at).fromNow().toUpperCase();
  },
  'initials': function () {
    return Meteor.users.find({
      '_id': {
        $in: this.post.upvoters
      }
    }).fetch().map(function (user) {
      if (!user.profile.initials) {
        return "XYZ";
      } else {
        return user.profile.initials;
      }
    });
  },
  'progress': function () {
    if (this.post.votes > this.post.minimumVotes) {
      return 100;
    } else {
      return (this.post.votes / this.post.minimumVotes) * 100;
    }
  },
  'goalReachedClass': function () {
    return this.post.votes >= this.post.minimumVotes ? 'goal-reached' : '';
  },
  'mustReachDate': function() {
    return new moment(this.post.submitted).add(1, 'month').format('ll');
  }
});

Template.postPage.events({
  'click *[social]': function (e) {
    var network = $(e.currentTarget).attr("social");
    var url = social_links[network] + this.url;
    GAnalytics.event("post", "share", network);
    window.open(url);
  }
});