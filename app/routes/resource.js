import Ember from "ember";

export default Ember.Route.extend({    
	setupController: function(controller, model) {
		this._super(controller, model);

		console.log(model);
		console.log(model.content);
		console.log(model.get('resource'));
		
		var resources = model.content;
		
		var urlList = [];
		for( var i = 0; i < resources.length; i++ ) {
			var resource = resources[i];
			if( resource.get('url') ) { 
				urlList.push({id: resource.id, url: resource.get('url')});
			}
		}			
				
		controller.set('urlList', urlList);
		//controller.set('locator', model.url);
/****	
		var responseStates = [];
		// Set the response states
		var resource = model;
		
		// Set method checkboxes
		controller.set('isGETEnabled', false);
		controller.set('isPUTEnabled', false);
		controller.set('isPATCHEnabled', false);
		controller.set('isPOSTEnabled', false);
		controller.set('isDELETEEnabled', false);
		
		console.log(resource.methods);
		
		for( var i = 0; i < resource.methods.length; i++ ) {
			console.log(resource.methods[i]);
			var propertyName = 'is' + resource.methods[i] + 'Enabled';			
			console.log(propertyName);
//			if( resource.methods[i] === 'GET' ) controller.set('isGETEnabled',true);
//			if( resource.methods[i] === 'PUT' ) controller.set('isPUTEnabled',true);
//			if( resource.methods[i] === 'POST' ) controller.set('isPOSTEnabled',true);
			controller.set(propertyName, true);
		}
		
		if( resource.responses ) {
			for( var i = 0; i < resource.responses.length; i++ ) {
				responseStates.push(resource.responses[i].name);				
			}
			controller.set('responseStates',responseStates);
			if( resource.responses.length > 0 ) {
				controller.set('activeResponseState',responseStates[0]);
			}
		}				
*****/
	},
    model: function(params) {   
		var resources = this.modelFor('resources');		
		if( resources ) {
console.log(resources);
			this.set('resources', resources);
		
			for( var i =0; i < resources.length; i++ ) {
				if( resources[i].id === params.resource_id ) {
					return resources[i];
				}
			}
		}
console.log('no resources');
		// Retrieve a list of resources
		var project = this.modelFor('project');  

console.log(project.id);
		
		return this.store.find('resource', {project: project.id});
	
/***	
		return new Promise(function(resolve, reject) {		
			Backend.findAll('CRUDResource',{'project': project.id}).then(function(resources) {
				route.set('resources', resources);

				for( var i =0; i < resources.length; i++ ) {
					if( resources[i].id === params.resource_id ) {
						resolve(resources[i]);
					}
				}

				reject('resource not found.');
			}).then(function(error) {
				reject(error);
			});			
		});
****/		
		
		
    }

,
	renderTemplate: function() {
		//this.render('project.editor',{controller: 'resource', into: 'application'});
		this.render('project.editor', {controller: 'resource'});
	}
});
