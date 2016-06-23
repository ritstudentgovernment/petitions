Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  onRun: function () {
    Deps.nonreactive(function() {
      ga('send', 'pageview', Router.current().url);
    });
    this.next();
  },
  waitOn: function () {
    return [Meteor.subscribe('singleton'), Meteor.subscribe('tags')];
  },
  onAfterAction: function () {
    if (Errors.find().fetch().length > 0) {
      $('#errorModal').modal('show');
    }
  }
});

var petitionSort = function() {
  var sort = {};
  sort[Session.get('petitionOrder')] = -1;
  return {
    petitions: Petitions.find({}, {sort: sort}).fetch(),
    petitionOrder: Session.get('petitionOrder'),
    tag: Session.get('tagName'),
    tags: Tags.find().fetch()
  };
};

PetitionsListController = RouteController.extend({
  onRun : function(){
    Session.set('activeTag', null);
    this.next();
  },
  onBeforeAction: function() {
    Meteor.subscribe('petitions', Session.get('petitionsLimit'), Session.get('petitionOrder'), Session.get('activeTag'), Session.get('showSigned'), Session.get('showCreated'));
    Meteor.subscribe('petitionsSignedByMe');
    infiniteScroll();
    this.next();
  },
  data: petitionSort
});

PetitionsWithResponsesController = RouteController.extend({
  onRun : function(){
    Session.set('activeTag', null);
    this.next();
  },
  onBeforeAction: function () {
    Meteor.subscribe('petitionsWithResponses', Session.get('petitionsLimit'), Session.get('petitionOrder'), Session.get('activeTag'), Session.get('showSigned'), Session.get('showCreated'));
    infiniteScroll();
    this.next();
  },
  data: petitionSort
});

PetitionsInProgressController = RouteController.extend({
  onRun : function(){
    Session.set('activeTag', null);
    this.next();
  },
  onBeforeAction: function () {
    Meteor.subscribe('petitionsInProgress', Session.get('petitionsLimit'), Session.get('petitionOrder'), Session.get('activeTag'), Session.get('showSigned'), Session.get('showCreated'));
    infiniteScroll();
    this.next();
  },
  data: petitionSort
});

PendingPetitionsController = RouteController.extend({
  onRun : function(){
    Session.set('activeTag', null);
    this.next();
  },
  onBeforeAction: function () {
    Meteor.subscribe('pendingPetitions');
    infiniteScroll();
    this.next();
  },
  data: petitionSort
})

Router.map(function() {

  // Privileged Routes

  this.route('admin', {
    path: '/admin',
    template: 'admin',
    waitOn: function() {
      return [Meteor.subscribe('privilegedUsers')];
    },
    data: function() {
      return {
        admins: Meteor.users.find({roles: {$in: ['admin']}}),
        moderators: Meteor.users.find({roles: {$in: ['moderator']}}),
        notifiers: Meteor.users.find({roles: {$in: ['notify-threshold-reached']}}),
        tags: Tags.find().fetch()
      };
    }
  });

  // User Routes

  this.route('userEdit', {
    path: '/users/edit',
    waitOn: function() {
      return [Meteor.subscribe('apiKeys')];
    },
    data: function() {
      return {
        user: Meteor.user(),
        apiKeys: ApiKeys.findOne()
      };
    }
  });

  // Petition Routes

  this.route('petitionSubmit', {
    path: '/petitions/create'
  });
  this.route('hello', {
    path: '/hello',
    template: 'helloWorld'
  });


  this.route('petitionsList', {
    path: '/petitions/list',
    template: 'petitionsList',
    controller: PetitionsListController
  });

  this.route('petitionsInProgress', {
    path: '/petitions/in-progress',
    template: 'petitionsInProgressList',
    controller: PetitionsInProgressController
  });

  this.route('petitionsResponses', {
    path: '/petitions/responses',
    template: 'petitionsWithResponsesList',
    controller: PetitionsWithResponsesController
  });

  this.route('moderate', {
    path: '/moderate',
    template: 'moderatePage',
    controller: PendingPetitionsController
  });

  this.route('petitionPage', {
    path: '/petitions/:_id',
    template: 'petitionPage',
    waitOn: function() {
      return [Meteor.subscribe('singlePetition', this.params._id),
              Meteor.subscribe('signatories', this.params._id),
              Meteor.subscribe('updates', this.params._id)];
    },
    data: function() {
      var petition = Petitions.findOne(this.params._id);
      if (this.ready() && !petition)
        this.render('pageNotFound');
      else
        return {
          petition: Petitions.findOne(),
          updates: Updates.find({}, {sort: {created_at: 1}}).fetch(),
          url: window.location.href
        };
    },
    onAfterAction: function() {
      if (this.data() && this.data().petition)
        setSEO({title: this.data().petition.title, description: this.data().petition.description});
      return;
    }
  });

  this.route('petitionEdit', {
    path: '/petitions/:_id/edit',
    template: 'petitionEdit',
    onBeforeAction: function () {
      if (Meteor.user() && !_.contains(Meteor.user().roles, "moderator") && !_.contains(Meteor.user().roles, "admin"))
        this.render('pageNotFound');
        this.next();
    },
    waitOn: function () {
      return [Meteor.subscribe('singlePetition', this.params._id),
              Meteor.subscribe('updates', this.params._id)];
    },
    data: function() {
      var petition = Petitions.findOne(this.params._id);
      if (this.ready() && !petition)
        this.render('pageNotFound');
      else
        return {
          petition: Petitions.findOne(this.params._id),
          updates: Updates.find({}, {sort: {created_at: 1}}).fetch(),
          newUpdate: {},
          user: Meteor.user()
        }
    }
  });

  // Static routes

  this.route('about', {
    path: '/about',
    template: 'aboutTemplate',
    data: function () {
      return {
        subtemplate: 'about'
      };
    }
  });


  this.route('search', {
    path: '/search',
    template: 'search',
    waitOn: function() {
      return [Meteor.subscribe('petitionsSearch')]
    }
  });

  this.route('pendingPetition', {
    path: '/pendingPetition',
    template: 'pendingPetition'

  });

  this.route('api', {
    path: '/api-access',
    template: 'aboutTemplate',
    data: function () {
      return {
        subtemplate: 'api'
      };
    }
  });

  this.route('moderation', {
    path: '/moderation',
    template: 'aboutTemplate',
    data: function () {
      return {
        subtemplate: 'moderation'
      };
    }
  });

  this.route('petitionProcess', {
    path: '/petition-process',
    template: 'aboutTemplate',
    data: function () {
      return {
        subtemplate: 'petitionProcess'
      };
    }
  });

  // Must be last route (catch-all)

  this.route('index', {
    path: '/',
    template: 'index',
    controller: PetitionsListController
  });

  this.route('pageNotFound', {
    path: '/*',
    onRun: function () {
      this.render('pageNotFound');
    }
  });


});

var requireLogin = function() {
  if (!Meteor.user()) {
    if (Meteor.loggingIn())
      this.render(this.loadingTemplate);
    else
      this.render('accessDenied');
  } else {
    this.next();
  }
};

var clearLoginMsg = function() {
  Session.set("loginMsg", "");
}

Router.onBeforeAction('loading');
Router.onAfterAction(clearLoginMsg);
Router.onBeforeAction(requireLogin, {only: ['admin', 'petitionSubmit', 'userEdit', 'petitionEdit']});
