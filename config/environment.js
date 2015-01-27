/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    contentSecurityPolicy: {
        'default-src': "'self'",
	'connect-src': "'self' http://localhost:8081",
	'style-src': "'self' 'unsafe-inline'"
    },
    modulePrefix: 'rapido',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  ENV['simple-auth'] = {
    routeAfterAuthentication: '/projects',
    store: 'simple-auth-session-store:local-storage',
    authorizer: 'authorizer:rapido',
    crossOriginWhitelist: ['http://localhost:8081']
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;

    ENV.backend = 'http://localhost:8081'
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'auto';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.backend = 'http://localhost:8081'
  }

  if (environment === 'production') {
      ENV.backend = 'http://rapidodesigner.com/backend';
  }

  return ENV;
};
