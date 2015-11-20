var seoData = {
  admin: {
    title: "Admin",
    description: "Change administrative settings."
  },
  userEdit: {
    title: "Profile",
    description: "Edit profile information."
  },
  petitionSubmit: {
    title: "Submit Petition",
    description: "Submit a petition to PawPrints."
  },
  petitionsInProgress: {
    title: "Recognized Petitions",
    description: "View petitions being actively worked on by Student Government."
  },
  petitionsList: {
    title: "Petitions",
    description: "PawPrints is a place for sparking change at RIT. Share ideas with the RIT community and influence decision making."
  },
  petitionsResponses: {
    title: "Petition Responses",
    description: "View petitions that have received responses from RIT Student Government and Administration."
  },
  petitionsTagList: {
    title: "Tagged Petitions",
    description: "View tagged petitions on PawPrints."
  },
  petitionPage: {
    title: "View Petition",
    description: "View petition on PawPrints."
  },
  petitionEdit: {
    title: "Edit Petition",
    description: "Edit petition."
  },
  about: {
    title: "About PawPrints",
    description: "Learn more about the history of PawPrints, its goal and vision."
  },
  search: {
    title: "Search",
    description: "Search petitions"
  },
  api: {
    title: "API Access",
    description: "Student Government provides a read-only JSON REST API for retreiving petition information."
  },
  moderation: {
    title: "Moderation Policy",
    description: "PawPrints follows the RIT Code of Conduct for Computer and Network Use."
  },
  petitionProcess: {
    title: "Petition Process",
    description: "Learn how to effectively create a successful petition."
  },
  index: {
    title: "PawPrints",
    description: "PawPrints is a place for sparking change at RIT. Share ideas with the RIT community and influence decision making."
  },
  pageNotFound: {
    title: "Page Not Found",
    description: "The page you requested is not found."
  },
  moderate: {
    title: "Moderate",
    description: "A page where petitions can be moderated."
  },
  pendingPetition:{
    title: "Pending",
    description: "Your petition is pending approval!."
  }
};

Router.configure({
  onBeforeAction: function () {
    var routeName = Router.current().route.getName();
    if (routeName)
      setSEO(seoData[routeName]);
    this.next();
  }
});

setSEO = function (data) {
  if (Meteor.isClient) {
    var image_url;
    if( Meteor.settings && Meteor.settings.public !== undefined &&
        Meteor.settings.public.root_url !== undefined) {
      image_url = Meteor.settings.public.root_url + '/logo_200x200.png';
    }
    SEO.set({
      title: data.title,
      meta: {
        'description': data.description.replace(/<(?:.|\n)*?>/gm, '')
      },
      og: {
        'title': data.title,
        'description': data.description.replace(/<(?:.|\n)*?>/gm, ''),
        'image': image_url
      }
    });
  }
};
