Template.petitionProcess.helpers({
  threshold_last_updated: function thresholdLastUpdatedAt () {
    return new moment(Singleton.findOne().threshold_updated_at).format("L");
  }
});
