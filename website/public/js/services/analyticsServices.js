/**
 * Created by Sabe on 6/15/2015.
 */
'use strict';

angular.module("habitrpg").factory("Analytics",
['User', function(User) {
  var Analytics = {};
  var user = User.user;

  Analytics.register = function() {

  };

  Analytics.login = function() {

  };

  Analytics.track = function(type,action,properties) {
    amplitude.logEvent(action,properties);
    ga('send','event',type,action);
    mixpanel.track(action,properties);
  };

  Analytics.updateUser = function(properties) {
    properties.UUID = user._id;
    properties.Class = user.stats.class;
    properties.Experience = Math.floor(user.stats.exp);
    properties.Gold = Math.floor(user.stats.gp);
    properties.Health = Math.ceil(user.stats.hp);
    properties.Level = user.stats.lvl;
    properties.Mana = Math.floor(user.stats.mp);
    properties.contributorLevel = user.contributor.level;
    properties.subscription = user.purchased.plan.planId;

    amplitude.setUserProperties(properties);
    ga('set',properties);
    mixpanel.register(properties);
  };

  Analytics.revenue = function() {

  };

}]);
