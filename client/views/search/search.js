Template.search.events({
  'keyup #search': function (e) {
    var query = $(e.target).val();
    if (query.length >= 0) {
      setTimeout( function() {
        Session.set("waiting", true);
        EasySearch.search('petitions', query, function (err, data) {
          Session.set("waiting", false);
          Session.set("results", data.results);
        });
        GAnalytics.event("petition", "search", query);
      }, 100);
    }
  },
  'click a': function (e) {
    $('#modal-search').modal("hide");
  },

});

Template.search.helpers({
  noResults: function() {
    return Session.get('results') && Session.get('results').length == 0;
  }
});

Template.search.rendered = function () {
  $("#search").attr('autocomplete', 'on');
  $('#search').focus();
}
