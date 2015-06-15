"use strict";

angular.module('habitrpg').controller("FooterCtrl",
['$scope', '$rootScope', 'User', '$http', 'Notification', 'ApiUrl', 'Analytics',
function($scope, $rootScope, User, $http, Notification, ApiUrl, Analytics) {

  $scope.Analytics = Analytics;

  if(env.isStaticPage){
    $scope.languages = env.avalaibleLanguages;
    $scope.selectedLanguage = _.find(env.avalaibleLanguages, {code: env.language.code});

    $rootScope.selectedLanguage = $scope.selectedLanguage;

    $scope.changeLang = function(){
      window.location = '?lang='+$scope.selectedLanguage.code;
    }
  }

  /**
   External Scripts
   JS files not needed right away (google charts) or entirely optional (analytics)
   Each file gets loaded async via $.getScript, so it doesn't bog page-load
  */
  $scope.deferredScripts = function(){

    // Stripe
    $.getScript('//checkout.stripe.com/v2/checkout.js');

    // Analytics, only in production
    if (window.env.NODE_ENV === 'production') {
      // Get experiments API
      $.getScript('//www.google-analytics.com/cx/api.js?experiment=t-AFggRWQnuJ6Teck_x1-Q', function(){
        $rootScope.variant = cxApi.chooseVariation();
        $rootScope.$apply();

        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        ga('create', window.env.GA_ID, {userId:User.user._id});
        ga('require', 'displayfeatures');
        ga('send', 'pageview');
      });

      $.getScript('//api.mixpanel.com/site_media/js/api/mixpanel.js', function() {
        (function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
          for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);
        mixpanel.init(window.env.MIXPANEL_TOKEN);
      });

      $.getScript('https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-2.2.0-min.gz.js', function() {
        (function(e,t){var r=e.amplitude||{};var n=t.createElement("script");n.type="text/javascript";
          n.async=true;n.src="https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-2.2.0-min.gz.js";
          var s=t.getElementsByTagName("script")[0];s.parentNode.insertBefore(n,s);r._q=[];
          function a(e){r[e]=function(){r._q.push([e].concat(Array.prototype.slice.call(arguments,0)));
          }}var i=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","setGlobalUserProperties"];
          for(var o=0;o<i.length;o++){a(i[o])}e.amplitude=r})(window,document);

        amplitude.init(window.env.AMPLITUDE_KEY);
      });
    }

    // Scripts only for desktop
    if (!window.env.IS_MOBILE) {
      // Add This
      //$.getScript("//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-5016f6cc44ad68a4"); //FIXME why isn't this working when here? instead it's now in <head>
      var addthisServices = 'facebook,twitter,googleplus,tumblr,'+window.env.BASE_URL.replace('https://','').replace('http://','');
      window.addthis_config = {
        ui_click: true,
        services_custom:{
          name: "Download",
          url: window.env.BASE_URL+"/export/avatar-"+User.user._id+".png",
          icon: window.env.BASE_URL+"/favicon.ico"
        },
        services_expanded:addthisServices,
        services_compact:addthisServices
      };

      // Google Charts
      $.getScript("//www.google.com/jsapi", function() {
        google.load("visualization", "1", {
          packages: ["corechart"],
          callback: function() {}
        });
      });
    }
  }

  /**
   * Debug functions. Note that the server route for gems is only available if process.env.DEBUG=true
   */
  if (_.contains(['development','test'],window.env.NODE_ENV)) {
    $scope.setHealthLow = function(){
      User.set({
        'stats.hp': 1
      });
    }
    $scope.addMissedDay = function(numberOfDays){
      if (!confirm("Are you sure you want to reset the day by " + numberOfDays + " day(s)?")) return;
      var dayBefore = moment(User.user.lastCron).subtract(numberOfDays, 'days').toDate();
      User.set({'lastCron': dayBefore});
      Notification.text('-' + numberOfDays + ' day(s), remember to refresh');
    }
    $scope.addTenGems = function(){
      $http.post(ApiUrl.get() + '/api/v2/user/addTenGems').success(function(){
        User.log({});
      })
    }
    $scope.addGold = function(){
      User.set({
        'stats.gp': User.user.stats.gp + 500,
      });
    }
    $scope.addMana = function(){
      User.set({
        'stats.mp': User.user.stats.mp + 500,
      });
    }
    $scope.addLevelsAndGold = function(){
      User.set({
        'stats.exp': User.user.stats.exp + 10000,
        'stats.gp':  User.user.stats.gp  + 10000,
        'stats.mp':  User.user.stats.mp  + 10000
      });
    }
    $scope.addOneLevel = function(){
      User.set({
        'stats.exp': User.user.stats.exp + (Math.round(((Math.pow(User.user.stats.lvl, 2) * 0.25) + (10 * User.user.stats.lvl) + 139.75) / 10) * 10)
      });
    }
    $scope.addBossQuestProgressUp = function(){
      User.set({
        'party.quest.progress.up': User.user.party.quest.progress.up + 1000
      });
    }
  }
}])
