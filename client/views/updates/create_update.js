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
    if(typeof(this.update._id) != "undefined")
      var markupStr = $('#summernoteUpdate' + this.update._id).summernote('code');
    else {
      var markupStr = $('#summernoteUpdate').summernote('code');
    }
    var updateAttrs = {
      _id: this.update._id,
      petitionId: this.petition._id,
      title: $(e.target).find('[name=title]').val(),
      description: markupStr
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

Template.createUpdate.rendered = function(){
  $('#summernoteUpdate').summernote();
  try{
    var x = "#summernoteUpdate" + this.data.update._id;
    $(x).summernote('code', this.data.update.description);
  } catch(z){
    $('#summernoteUpdateundefined').summernote();
  }
}
