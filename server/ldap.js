var assert, ldap, Future, LDAP;

ldap = Meteor.npmRequire('ldapjs');
assert = Npm.require('assert');
Future = Npm.require('fibers/future');

LDAP = {};
LDAP.searchOu = Meteor.settings.LDAP.search_ou;
LDAP.searchQuery = function(user){
  return {
    filter: "(" + Meteor.settings.LDAP.username_attribute + "=" + user + ")",
    scope: 'sub'
  };
};

LDAP.checkAccount = function(options) {
  var dn, future;
  //@TODO: Escape username and password per LDAP convention.
  LDAP.client = ldap.createClient({
    url: Meteor.settings.LDAP.url,
    maxConnections: 2,
    bindDN: Meteor.settings.LDAP.bind_dn_prefix + options.username + ',' + Meteor.settings.LDAP.search_ou,
    bindCredentials: options.password
  });
  
  options = options || {};
  dn = [];
  future = new Future();
  if (options.password.length === 0 || options.username.length === 0) {
    future['return'](void 8);
    return;
  }
  LDAP.client.search(LDAP.searchOu, LDAP.searchQuery(options.username), function(err, search) {    
    if (err) {
      future['return'](false);
      return false;
    } else {
      search.on('searchEntry', function(entry) {
        dn.push(entry.objectName);
                        
        LDAP.displayName = entry.object.displayName;
        LDAP.givenName = entry.object.givenName;
        LDAP.initials = entry.object.initials;
        LDAP.sn = entry.object.sn;
        LDAP.ou = entry.object.ou;
        LDAP.memberOf = entry.object.memberOf;
        LDAP.mail = entry.object.mail;
        
        return LDAP.displayName = entry.object.displayName;
      });
      search.on('error', function(err){
        throw new Meteor.Error(500, "LDAP server error");
      });
      return search.on('end', function() {
        if (dn.length === 0) {
          future['return'](false);
          return false;
        }
        return LDAP.client.bind(dn[0], options.password, function(err) {
          if (err) {
            future['return'](false);
            return false;
          }
          return LDAP.client.unbind(function(err) {
            assert.ifError(err);
            return future['return'](!err);
          });
        });
      });
    }
  });
  return future.wait();
};

Accounts.registerLoginHandler('ldap', function(loginRequest) {
  var user, userId, profile;
  if (LDAP.checkAccount(loginRequest)) {
    user = Meteor.users.findOne({
      username: loginRequest.username.trim().toLowerCase()
    });
    var name = (LDAP.givenName && LDAP.sn) ? LDAP.givenName + " " + LDAP.sn : null,
        profile = {
          displayName: LDAP.displayName || null,
          givenName: LDAP.givenName || null,
          initials: LDAP.initials || null,
          sn: LDAP.sn || null,
          name: name,
          memberOf: LDAP.memberOf || null,
          mail: LDAP.mail || null
        };
    if (user) {
      userId = user._id;
      profile.displayName = profile.displayName || user.profile.displayName || null;
      profile.givenName = profile.givenName || user.profile.givenName || null;      
      profile.sn = profile.sn || user.profile.sn || null;
      profile.name = profile.name || user.profile.name || null;      
      profile.email = profile.mail || user.profile.mail || null;
      //When a user changes their initials or has it set for the first time, keep it.
      profile.initials = user.profile.initials || profile.initials || null;
      
      Meteor.users.update(userId, {$set: {profile: profile}});
    } else {
      userId = Meteor.users.insert({
        username: loginRequest.username.trim().toLowerCase(),
        notify: {
          updates: true,
          response: true
        },
        profile: profile
      });
    }
       
    if(Meteor.settings.LDAP.auto_group) {        
        _.each(Meteor.settings.LDAP.auto_group, function(group, role) {
            var autogroupAction = null;
            if(profile.memberOf.indexOf(group) !== -1) {
                autogroupAction = {$addToSet: {roles: role}};
            }else{
                autogroupAction = {$pull: {roles: role}};
            }
            
            Meteor.users.update({_id: userId}, autogroupAction); 
        });        
    }
            
    return {
      userId: userId
    };
  }
});
