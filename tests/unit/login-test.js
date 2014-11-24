import Ember from "ember";
import { test } from 'ember-qunit';
import startApp from '../helpers/start-app';
var App;

module('Login', {
 	setup: function() {
 		App = startApp();
 	},
	teardown: function() {
		Ember.run(App, App.destroy);
	}
});

test("Login", function() {	
	expect(1);
	visit('/').then(function() {	
		equal(find('.login-form').length, '1');		
		fillIn('.login-name', 'kai');
		fillIn('.login-password', 'go');
		return click('.login-submit');
	}).then(function() {
		return visit('/projects');
	});	
});
