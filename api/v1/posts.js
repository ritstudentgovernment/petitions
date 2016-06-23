if (Meteor.isServer) {

  var setUser = function() {
    var token = this.query.key;
    if (token) {
      var encryptedToken = CryptoJS.MD5(token).toString();
      var apiKey = ApiKeys.findOne({token: encryptedToken});
      if (apiKey) {
        var user = Meteor.users.findOne({_id: apiKey.userId});
        return user && user._id;
      }
    }
  };

  HTTP.methods({
    '/v1/petitions': {
      auth: setUser,
      get: function(data) {
        if (this.userId) {
          this.setContentType('application/json');
          var limit = Math.min(parseInt(this.query.limit) || 500, 500);
          var selector = {published: true};
          var petitions = Petitions.find(selector, {fields: { title: 1,
                                                      votes: 1,
                                                      author: 1,
                                                      description: 1,
                                                      submitted: 1,
                                                      response: 1,
                                                      responded_at: 1,
                                                      minimumVotes: 1}, limit: limit}).fetch();
          return JSON.stringify(petitions);
        } else {
          this.setStatusCode(401);
        }
      }
    },
    '/v1/petitions/:petitionId': {
      auth: setUser,
      get: function(data) {
        if (this.userId) {
          var selector = {};
          selector['_id'] = this.params.petitionId;
          selector['published'] = true;
          var petition = Petitions.findOne(selector, {fields: { title: 1,
                                                        votes: 1,
                                                        author: 1,
                                                        description: 1,
                                                        submitted: 1,
                                                        upvoters: 1,
                                                        response: 1,
                                                        responded_at: 1,
                                                        minimumVotes: 1}});
          if (petition) {
            this.setContentType('application/json');
            petition.signatories = Meteor.users.find({'_id': {$in: petition.upvoters}}).map(function (signer) { return signer.profile.initials });
            delete petition.upvoters;
            return JSON.stringify(petition);
          } else
            this.setStatusCode(404);
        } else {
          this.setStatusCode(401);
        }
      }
    }
  });
}
