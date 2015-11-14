Template.createUpdate.events({
  'click #deleteUpdate': function (e) {
    e.preventDefault();

    if (confirm("Delete this update?")) {
      Meteor.call("deleteUpdate", this.update, function (err) {
        if (err)
          throwError(err.reason);
      });
    }
  },
  'submit #updateForm': function (e) {
    e.preventDefault();

    var updateAttrs = {
      _id: this.update._id,
      petitionId: this.petition._id,
      title: $(e.target).find('[name=title]').val(),
      description: $(e.target).find('[name=description]').val()
    }

    var method = updateAttrs._id ? "editUpdate" : "createUpdate";

    Meteor.call(method, updateAttrs, function (err) {
      if (err) {
        throwError(err.reason);
      } else {
        throwError("Changes saved.")
        if (this.method == "createUpdate") {
          $(this.e.target).find('[name=title]').val("");
          $(this.e.target).find('[name=description]').val("");
        }
      }
    }.bind({method: method, e: e}));

  }
})