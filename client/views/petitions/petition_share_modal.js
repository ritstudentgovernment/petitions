Template.petitionShareModal.helpers({
  signaturesRemaining: function () {
    return this.petition.minimumVotes - this.petition.votes;
  },
  percentRemaining: function () {
    var percent = parseInt((this.petition.minimumVotes - this.petition.votes) / this.petition.minimumVotes * 100);
    return percent < 40 ? " (" + percent + "%)" : "";
  }
});
