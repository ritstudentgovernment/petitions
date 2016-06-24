var social_links = {
  'facebook': 'https://www.facebook.com/sharer/sharer.php?u=',
  'twitter': 'https://twitter.com/intent/tweet?url=',
  'reddit': 'http://www.reddit.com/submit?url=',
  'plus': 'https://plus.google.com/share?url=',
  'linkedin': 'https://www.linkedin.com/cws/share?url='
};

Template.actionBar.helpers({
  'progress': function () {
    if (this.petition.votes > this.petition.minimumVotes) {
      return 100;
    } else {
      return (this.petition.votes / this.petition.minimumVotes) * 100;
    }
  },
  'goalReachedClass': function () {
    return this.petition.votes >= this.petition.minimumVotes ? 'goal-reached' : '';
  },
  'mustReachDate': function() {
    return new moment(this.petition.submitted).add(1, 'month').format('ll');
  },
  'submittedDate': function(){
    return moment(this.petition.submitted).format('ll');
  },
  'petitionStatus': function () {
    var petition = Petitions.findOne();
    if (petition.status == "waiting-for-reply") {
      return {
        title: "In Progress",
        description: "This petition is being reviewed by Student Government."
      };
    } else if (petition.status == "responded") {
      return {
        title: "Responded",
        description: "This petition has recieved an official response."
      };
    } else {
      if (petition.votes >= petition.minimumVotes) {
        return {
          title: "Goal Met",
          description: "This petition has met its signature goal, but has not yet been reviewed by Student Government."
        };
      } else if (moment(petition.submitted).isBefore(moment().subtract(1, 'month'))) {
        return {
          title: "Expired",
          description: "This petition didn't meet it's minimum signature goal within one month."
        };
      } else {
        return {
          title: "Goal Not Met",
          description: "This petition is below its signature threshold of " + petition.minimumVotes + "."
        };
      }
    }
  }
});
Template.actionBar.events({
  'click *[social]': function (e) {
    var network = $(e.currentTarget).attr("social");
    var url = social_links[network] + this.url;
    GAnalytics.event("petition", "share", network);
    window.open(url);
  }
});
