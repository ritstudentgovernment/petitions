Template.petitionEdit.events({
  'submit #petitionForm': function(e) {
    e.preventDefault();
    var petitionProperties = {
      title: $(e.target).find('[name=title]').val(),
      description: $(e.target).find('[name=description]').val(),
      response: $(e.target).find('[name=response]').val(),
      tag_ids: _.pluck($('#s2id_tags').select2('data'), '_id')
    };
    Meteor.call('edit', this.petition._id, petitionProperties, function (err) {
      if (err) {
        GAnalytics.event("petition", "edit", err.reason);
        throwError(err.reason);
      } else {
        throwError("Petition saved.");
        GAnalytics.event("petition", "edit");
      }
    });
  },
  'click .delete-petition': function(e) {
    e.preventDefault();
    if (confirm("Delete this petition? Consider unpublishing it instead.")) {
      Meteor.call('delete', this.petition._id, function (err) {
        if (err) {
          GAnalytics.event("petition", "delete", err.reason);
          throwError(err.reason);
        } else {
          GAnalytics.event("petition", "delete");
          Router.go('petitionsList');
        }
      });
    }
  }
});

Template.petitionEdit.rendered = function () {
  var _this = this;
  Deps.autorun(function () {
    $('#tags').select2({
      placeholder: "Petition Tags",
      data: {results: Tags.find({}, {sort: {name: 1}}).fetch()},
      multiple: true,
      maximumSelectionSize: 3,
      id: function (object) { return object._id; },
      matcher: function(term, text, option) { return option.name.toUpperCase().indexOf(term.toUpperCase()) > -1; },
      formatSelection: function (object, container) { return object.name.toUpperCase(); },
      formatResult: function (object, container, query) { return object.name; },
      formatNoMatches: function (object) { return "No tags found." },
      formatSelectionTooBig: function (object) { return "You can only select up to 3 tags." }
    }).select2('val', _.pluck(Tags.find({_id: {$in: this.data.petition.tag_ids}}).fetch(), '_id'));
    $('.select2-search-field>input').addClass("input");
  }.bind(this));
};

Template.petitionPublish.events({
  'submit #publish': function (e) {
    e.preventDefault();
    Meteor.call('changePublishStatus', this._id, function (err) {
      if (err) {
        GAnalytics.event("petition", "changePublishStatus", err.reason);
        throwError(err.reason);
      } else {
        GAnalytics.event("petition", "changePublishStatus");
      }
    });
  }
});

Template.petitionPublish.helpers({
  publishStatus: function () {
    return this.published ? "published" : "unpublished";
  },
  publishAction: function () {
    return this.published ? "Unpublish" : "Publish";
  }
});
