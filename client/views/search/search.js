Template.search.events({
  'keyup #search': _.debounce(function (e) {
    console.log('search');
    var query = $(e.target).val();
    if (query.length >= 0) {     
        Session.set("waiting", true);
        var cursor = PetitionsIndex.search(query);
        Session.set("results", cursor.fetch());
        Session.set("waiting", false);
        
        GAnalytics.event("petition", "search", query);      
    }
  }, 500),
  'click a': function (e) {
    $('#modal-search').modal("hide");
  },
  'submit form': function(event) {
    event.preventDefault();
  }

});

Template.search.helpers({
  noResults: function() {
    return Session.get('results') && Session.get('results').length == 0;
  }
});

Template.search.rendered = function () {  
  $('#search').focus();
  Session.set("results", null);
  Session.set("waiting", false);
}
