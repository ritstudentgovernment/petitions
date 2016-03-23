/*
 * Uses the settings file to create default emails.  Thus if we don't have at least the MAIL 
 * key set up this module is unusable and the site won't really work.
 */
if(!Meteor.settings.MAIL)
    throw new Error("You must have a Meteor.settings.MAIL attribute, please refer to the settings.json.sample file.");

//Pre-compile all the email templates at startup, that way we know immediately if there's an error.
_.each(Meteor.settings.MAIL.templates, function(settings, templateKey) {
  if(settings.template)
    SSR.compileTemplate(templateKey, Assets.getText('email_templates/{0}.html'.format(settings.template)));
});

Mailer = {
    sendTemplatedEmail: function(templateKey, overrides, context) {
        //Setting up default variables available in the template, so you don't have to pass them in every time.
        context = _.extend({}, {
          settings: Meteor.settings
        }, context || {});
        
        
        //You can override the templateSettings.template variable to render a different template in a different package.
        templateSettings = Meteor.settings.MAIL.templates[templateKey];
        //If the template doesn't exist we shouldn't go any further.
        if(!templateSettings)
          throw new Meteor.Error(500, 'Tried to send an email with nonexistent template {0}.'.format(templateKey));
          
        try {        
          /* 
          * The settings for an email trickle down from most to least important:
          * 1. Override template settings
          * 2. Overrides passed in
          * 3. Individual template settings
          * 4. Default template settings
          * 5. Settings in this file (like text)
          */               
          template = _.extend(              
              { text: SSR.render(templateKey, context) }, 
              Meteor.settings.MAIL.template_defaults, 
              templateSettings,
              overrides,
              Meteor.settings.MAIL.template_overrides
          );
        }catch(e) {
          //This means there was a general error either finding the template passed in or in rendering the compiled template.
          throw new Meteor.Error(500, 'There was an error rendering the email template for {0} template.  {1}'.format(templateKey, e.toString()));
        }
        template.subject = template.subject.replace(/_/g, " "); //Convert _ to space to accommodate environment + JSON config (e.g. meteor unit file)

        //Apply string formatting to every string variable in the template, this allows you to have a variable subject for example.
        template = _.object(_.map(template, function(value, key) {
          var finalValue = value;
          if(typeof value === "string") {
            finalValue = value.format(context);
          }
          
          return [ key, finalValue ];
        }));
        
        try {
            Email.send(template);
        }catch(e) {
            //May not be the best error message, I'm not sure if including the error string could expose any sensitive information.
            throw new Meteor.Error(500, 'There was a problem sending an email using the {0} template.  {1}.'.format(templateKey, e.toString()));
        }
    }
}