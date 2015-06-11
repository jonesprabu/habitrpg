/**
 * Created by Sabe on 6/11/2015.
 */
'use strict';

describe('Analytics Service', function () {
  var analytics;
  var onScriptLoad;

  beforeEach(function() {
    inject(function(Analytics) {
      analytics = Analytics;
    });
  });

  context('Amplitude', function() {

    before(function() {
      sinon.stub(amplitude, 'setUserId');
      sinon.stub(amplitude, 'logEvent');
      sinon.stub(amplitude, 'setUserProperties');
    });

    afterEach(function() {
      amplitude.setUserId.reset();
      amplitude.logEvent.reset();
      amplitude.setUserProperties.reset();
    });

    after(function() {
      amplitude.setUserId.restore();
      amplitude.logEvent.restore();
      amplitude.setUserProperties.restore();
    });

    sinon.stub($, 'getScript').returns(function(name,callback) {
      onScriptLoad = callback;
    });

    it('does not call provider without script loaded', function() {
      analytics.login();
      expect(amplitude.setUserId).to.have.been.notCalled;
    });

    it('puts data on a queue while waiting for script', function() {
      analytics.track('action');
      expect(amplitudeCache).to.eql([['setUserId'],['logEvent','action']]);
    });

    it('sends queued data when script loads', function() {
      onScriptLoad();
      expect(amplitude.setUserId).to.have.been.calledOnce;
      expect(amplitude.logEvent).to.have.been.calledOnce;
      expect(amplitude.logEvent).to.have.been.calledWith('action');
    });

    it('flushes the cache after sending data', function() {
      expect(amplitudeCache).to.not.exist;
    });

    it('sets up tracking when user registers', function() {
      analytics.register();
      expect(amplitude.setUserId).to.have.been.calledOnce;
    });

    it('sets up tracking when user logs in', function() {
      analytics.login();
      expect(amplitude.setUserId).to.have.been.calledOnce;
    });

    it('tracks a simple user action', function() {
      analytics.track('action');
      expect(amplitude.logEvent).to.have.been.calledOnce;
      expect(amplitude.logEvent).to.have.been.calledWith('action');
    });

    it('tracks a user action with properties', function() {
      analytics.track('action',{'booleanProperty': true, 'numericProperty': 17, 'stringProperty': 'bagel'});
      expect(amplitude.logEvent).to.have.been.calledOnce;
      expect(amplitude.logEvent).to.have.been.calledWith('action',{'booleanProperty': true, 'numericProperty': 17, 'stringProperty': 'bagel'});
    });

    it('updates user-level properties', function() {
      analytics.updateUser({'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
      expect(amplitude.setUserProperties).to.have.been.calledOnce;
      expect(amplitude.setUserProperties).to.have.been.calledWith({'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
    });

  });

  context('Google Analytics', function() {

    before(function() {
      sinon.stub(ga);
    });

    afterEach(function() {
      ga.reset();
    });

    after(function() {
      ga.restore();
    });

    it('sets up tracking when user registers', function() {
      analytics.register();
      expect(ga).to.have.been.calledOnce;
      expect(ga).to.have.been.calledWith('create');
    });

    it('sets up tracking when user logs in', function() {
      analytics.login();
      expect(ga).to.have.been.calledOnce;
      expect(ga).to.have.been.calledWith('create');
    });

    it('tracks a simple user action', function() {
      analytics.track('action');
      expect(ga).to.have.been.calledOnce;
      expect(ga).to.have.been.calledWith('send','event','behavior','action');
    });

    it('tracks a user action with properties', function() {
      analytics.track('action',{'booleanProperty': true, 'numericProperty': 17, 'stringProperty': 'bagel'});
      expect(ga).to.have.been.calledOnce;
      expect(ga).to.have.been.calledWith('send','event','behavior','action');
    });

    it('updates user-level properties', function() {
      analytics.updateUser({'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
      expect(ga).to.have.been.calledOnce;
      expect(ga).to.have.been.calledWith('set',{'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});

    });

  });

  context('Mixpanel', function() {

    before(function() {
      sinon.stub(mixpanel, 'alias');
      sinon.stub(mixpanel, 'identify');
      sinon.stub(mixpanel, 'track');
      sinon.stub(mixpanel, 'register');
    });

    afterEach(function() {
      mixpanel.alias.reset();
      mixpanel.identify.reset();
      mixpanel.track.reset();
      mixpanel.register.reset();
    });

    after(function() {
      mixpanel.alias.restore();
      mixpanel.identify.restore();
      mixpanel.track.restore();
      mixpanel.register.restore();
    });

    sinon.stub($, 'getScript').returns(function(name,callback) {
      onScriptLoad = callback;
    });

    it('does not call provider without script loaded', function() {
      analytics.login();
      expect(mixpanel.identify).to.have.been.notCalled;
    });

    it('puts data on a queue while waiting for script', function() {
      analytics.track('action');
      expect(mixpanelCache).to.eql([['identify'],['track','action']]);
    });

    it('sends queued data when script loads', function() {
      onScriptLoad();
      expect(mixpanel.identify).to.have.been.calledOnce;
      expect(mixpanel.track).to.have.been.calledOnce;
      expect(mixpanel.track).to.have.been.calledWith('action');
    });

    it('flushes the cache after sending data', function() {
      expect(mixpanelCache).to.not.exist;
    });

    it('sets up tracking when user registers', function() {
      analytics.register();
      expect(mixpanel.alias).to.have.been.calledOnce;
    });

    it('sets up tracking when user logs in', function() {
      analytics.login();
      expect(mixpanel.identify).to.have.been.calledOnce;
    });

    it('tracks a simple user action', function() {
      analytics.track('action');
      expect(mixpanel.track).to.have.been.calledOnce;
      expect(mixpanel.track).to.have.been.calledWith('action');
    });

    it('tracks a user action with properties', function() {
      analytics.track('action',{'booleanProperty': true, 'numericProperty': 17, 'stringProperty': 'bagel'});
      expect(mixpanel.track).to.have.been.calledOnce;
      expect(mixpanel.track).to.have.been.calledWith('action',{'booleanProperty': true, 'numericProperty': 17, 'stringProperty': 'bagel'});
    });

    it('updates user-level properties', function() {
      analytics.updateUser({'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
      expect(mixpanel.register).to.have.been.calledOnce;
      expect(mixpanel.register).to.have.been.calledWith({'userBoolean': false, 'userNumber': -8, 'userString': 'Enlightened'});
    });

  });

});
