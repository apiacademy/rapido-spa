import Ember from "ember";
import startApp from '../helpers/start-app';
var App,store;

module('Store', {
 	setup: function() {
 		App = startApp();
		store = App.__container__.lookup('store:main');
 	},
	teardown: function() {
		//Ember.run(App, App.destroy);
	}
});

/**
Don't add this until we implement delete

test("Retrieve Projects", function() {	
	expect(1);
	var numberOfProjects = 0;
	var projects, newProject;
	store.find('project').then(function(val) {
		console.log(val.content);
		projects = val.content;
		numberOfProjects = val.content.length;
		console.log('number of projects:');
		console.log(numberOfProjects);
		
		// Create a new project.
		newProject = store.createRecord('project', {
			name: 'test.project',
			description: 'testing project creation',
			hostname: 'test.project.hostname',
			projectType: 'CRUD',
			contentType: 'application/json'
		});
		console.log('saving new project');
	//	return newProject.save();
	}).then(function(val) {
		console.log(val);
		console.log(projects.length);
		console.log(numberOfProjects);
		equal(projects.length+1, numberOfProjects+1));

		// Delete the record that we created
		//newProject.deleteRecord();
		//newProject.save();
	}).then(function(val) {
		console.log(projects.length);
	});
	
});
**/

asyncTest("Manipulate Resources", function() {	
	expect(2);
	var projectId,numberOfResources,newResource;
	store.find('project').then(function(val) {
		// get the first project ID
		projectId = val.content[0].id;
		return store.find('resource', {project: projectId});
	}).then(function(val) {
		numberOfResources = val.content.length;

		var responses = [];
		var methods = ['GET'];
		var parent;

		// Create a new resource.
		newResource = store.createRecord('resource', {
			name: 'newResourceName',                
			description: 'newResourceDescription',                
			responses: responses,
			url: 'newResourceUri',
			children: [],
			parent: parent,
			methods: methods,
			project: projectId
		});
		return newResource.save();
	}).then(function(val) {
		// Update resource.
		newResource.set('description', 'updated description');
		return newResource.save();
	}).then(function(val) {
		return store.find('resource', {project: projectId});
	}).then(function(val) {
		equal(numberOfResources+1, val.content.length, "record has been added.");
		newResource.deleteRecord();
		return newResource.save();
	}).then(function(val) {
		return store.find('resource', {project: projectId});
	}).then(function(val) {
		equal(numberOfResources, val.content.length, "record has been deleted.");
	}).catch(function(error) {
		console.log(error);
	});
});

test("Retrieve Resources without Project ID", function() {
	expect(1);
	var newResource;

	store.find('project').then(function(val) {
		// Create a new resource without a project ID.

		var responses = [];
		var methods = ['GET'];
		var parent;
		newResource = store.createRecord('resource', {
			name: 'newResourceName',                
			description: 'newResourceDescription',                
			responses: responses,
			url: 'newResourceUri',
			children: [],
			parent: parent,
			methods: methods,
		});
		return newResource.save();
	}).catch(function(error) {
		equal(error, "A parent project identifier property must be present on records of type 'resource'", "Resource creation sucessfully rejected");
	});
});
