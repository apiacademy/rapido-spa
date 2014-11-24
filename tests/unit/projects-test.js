import Ember from "ember";
import startApp from '../helpers/start-app';
var App;

module('Projects', {
 	setup: function() {
 		App = startApp();
 	},
	teardown: function() {
		//Ember.run(App, App.destroy);
	}
});

test("Page contents", function() {	
	expect(2);
	visit('/projects').then(function() {	
		equal(currentRouteName(), 'projects.index');
		equal(find('.create-project').length, '1');		
	});	
});

test("Create Project", function() {	
	expect(0);
	visit('/projects').then(function() {					
		var createProjectButton = findWithAssert('.create-project');				
		//console.log($el);		
		createProjectButton.click();
		fillIn('.project-name', 'A new project name.');
		var saveButton = findWithAssert('.save-project');
		//saveButton.click();
	});	
});
