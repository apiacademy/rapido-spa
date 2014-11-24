import Ember from "ember";

export default Ember.ArrayController.extend({
	needs: ['project'],
	projectController: Ember.computed.alias("controllers.project"),
	/*
	resources: function() {
		console.log('resources changed');
		return this.get('model').resources;		
	}.property('model'.resources),    
	*/
	typeaheadData: function() {						
		return this.get('projectController').model.simpleVocabulary;		
	}.property(),
	isGETEnabled: false,
	isPUTEnabled: false,
	isPOSTEnabled: false,
	isDELETEENabled: false,
	wizardPage: '',
	isPage1Valid: function() {
		if( this.newResourceName && this.newResourceName.length > 0 ) { return true; }
		return false;
	}.property('newResourceName'),
    newResourceParent: null,
	newResourceName: '',
	newResourceUri: '',
	newResourceDescription: '',
	newResourceNameUpdated: function(e) {
		//TODO: Need rules to determine when to overwrite this URI and when not to (example, if the user has created a custom URI)
		var parent = this.get('newResourceParent');			
		var parentUri = '/';
		if( parent ) {
			parentUri = parent.url + '/';			
		}
		var newUri = encodeURI(e.newResourceName);		
		this.set('newResourceUri', parentUri + newUri);						
	}.observes('newResourceName'),
    actions: {
		createChildResource: function(parentId) {
			$('#modal_wizard_1').modal();
			this.set('wizardPage', 1);			
			var resources = this.get('content');		
			var parent = findParent(parentId, resources);			
			this.set('newResourceParent', parent);
			if( parent ) {
				this.set('newResourceUri', parent.url + '/');
			}
		},
		nextWizardStep: function(e) {
			var step = this.get('wizardPage');
			if( step > 0 ) { step = step + 1; }
			else { step = 1; }
			this.set('wizardPage', step); 
			var modalId = '#modal_wizard_' + step;
			$(modalId).modal();
		},
		previousWizardStep: function(e) {			
			var step = this.get('wizardPage');
			if( step > 1 ) { step = step - 1; }
			else { step = 1; }
			this.set('wizardPage', step);
			var modalId = '#modal_wizard_' + step;
			$(modalId).modal();
		},
		nodeSelected: function(id) {
			console.log(id);
			this.transitionToRoute('resource', id);
		},
		saveResource: function() {
			console.log('saveResource');
			//var projectId = this.get('projectController').model.id;  
			
			// Find the parent resource			
			var parent = this.get('newResourceParent');									
			
			// Create the method array string
			var methods = [];
			var responses = [];
			if( this.get("isGETEnabled") ) {
				methods.push("GET");
				responses.push({name: "GET", body: ""});
			}if( this.get("isPUTEnabled") ) {
				methods.push("PUT");
				responses.push({name: "PUT", body: ""});
			}if( this.get("isPOSTEnabled") ) {
				methods.push("POST");
				responses.push({name: "POST", body: ""});
			}if( this.get("isDELETEEnabled") ) {
				methods.push("DELETE");
				responses.push({name: "DELETE", body: ""});
			}

			console.log('this.store.createRecord');

			var newResource = this.store.createRecord('resource', {
				name: this.get('newResourceName'),                
                description: this.get('newResourceDescription'),                
				responses: responses,
				url: this.get('newResourceUri'),
				children: [],
				parent: parent,
				methods: methods
			});
			newResource.save();

			console.log(newResource);
			
			/*
			// Create new response state
			var newResource = App.CRUDResourceModel.create({
                name: this.get('newResourceName'),                
                description: this.get('newResourceDescription'),                
				responses: responses,
				url: this.get('newResourceUri'),
				children: [],
				parent: parent,
				methods: methods
            });
			var component = this;
			Backend.create('CRUDResource', newResource, {'project': projectId})
				.then(function(result) {
					
				component.set('newResourceName', '');
				component.set('newResourceDescription', '');
				
				
					// Update the child array of this resource's parent
					if( result.parent ) {
						if( result.parent.children ) {
							result.parent.children.push(result);
						}else {
							result.parent.children = [result];
						}
					}
				
				component.get('model').pushObject(result);					
				}).then(function(error) {
					if( error ) console.log(error);
				});
			*/		
		}
    }
});

function findParent(parentId, resources) {
	// Find the parent resource								
	if( parentId ) {							
		for( var i=0; i < resources.length; i++ ) {					
			if( resources[i].id === parentId ) { return resources[i]; }
		}
	}	
}