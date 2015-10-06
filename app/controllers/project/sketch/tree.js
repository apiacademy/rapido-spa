import Ember from "ember";

export default Ember.ArrayController.extend({
	needs: ['project', 'project/sketch'],
    sketchController: Ember.computed.alias('controllers.project/sketch'),
	projectController: Ember.computed.alias("controllers.project"),
    projectName: function() {
        return this.get('projectController').model.get('name');
    }.property('projectController'),
	typeaheadData: function() {						
		return this.get('projectController').model.get('simpleVocabulary');
	}.property(),
	isGETEnabled: true,
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
    newResourceIsDynamic: false,
	newResourceNameUpdated: function(e) {
		//TODO: Need rules to determine when to overwrite this URI and when not to (example, if the user has created a custom URI)
		var parent = this.get('newResourceParent');			
		var parentUri = '/';
		if( parent ) {
			parentUri = parent.get('url') + '/';			
		}
       
        var name = this.get('newResourceName'); 
        if( name.indexOf('{') === 0 && name.charAt(name.length-1) === '}' ) {
            this.set('newResourceIsDynamic', true);
            var dynamicName = name.substring(1,name.length-1);
            var newUri = encodeURI(e.newResourceName);
            newUri = newUri.replace(/7b/g,'{');
            this.set('newResourceUri', parentUri + newUri);

        }else {
            var newUri = encodeURI(e.newResourceName);		
            this.set('newResourceIsDynamic', false);
            this.set('newResourceUri', parentUri + newUri);						
        }
		
	}.observes('newResourceName'),

    sketchList: [],
    retrieveSketchList: function() {
        var controller = this;
        var projectId = this.get('projectController').model.get('id');
        this.store.find('sketch', {project: projectId}).then(function(sketches) {
            var sketchList = [];
            for( var i = 0; i < sketches.content.length; i++ ) {
                var label = 'Sketch #' + (i+1);
                sketchList.push({label: label, id: sketches.content[i].id});
            }
            controller.set('sketchList', sketchList );
            controller.set('selectedSketch', {id: controller.get('sketchController').model.get('id')});
            var thisSketchID = controller.get('sketchController').model.get('id');
            var selectedSketch = controller.get('selectedSketch');
        });
    }.observes('sketchController').on('init'),

    sketchSelected: function() {
        var thisSketchId = this.get('sketchController').model.get('id');
        var sketchId = this.get('selectedSketch').id;
        if( sketchId != thisSketchId ) {
            var projectId = this.get('projectController').model.get('id');
            console.log('transitioning to selected sketch');
            this.transitionToRoute('project.sketch.tree', projectId, sketchId);
        }
    }.observes('selectedSketch.id'),


    actions: {
        newSketch: function() {
            console.log('new sketch');
            // Add new sketch
            var projectId = this.get('projectController').model.get('id');
            var sketch = this.store.createRecord('sketch', {
                project: projectId, 
                name: 'auto generated'
            });

            // Debug
            console.log('debug...');
            console.log($('svg').html());
            console.log($('svg'));
            return;

            sketch.save();

            // Transition to the new sketch
            console.log(sketch);
            this.transitionToRoute('project.sketch.tree', projectId, sketch.get('id'));
        },
		createChildResource: function(parentId) {
			$('#modal_wizard_1').modal();
			this.set('wizardPage', 1);			
			var resources = this.get('model').content;		
			var parent = findParent(parentId, resources);			
			this.set('newResourceParent', parent);
			if( parent ) {
				this.set('newResourceUri', parent.get('url') + '/');
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
			var sketchId = this.get('sketchController').model.get('id');
			this.transitionToRoute('resource', id);
		},
		saveResource: function() {
			var sketchId = this.get('sketchController').model.get('id');
			
			// Find the parent resource			
            var parentID = null;
            if( this.get('newResourceParent') ) {
                parentID = this.get('newResourceParent').get('id');
            }
			
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

            var resourceType = 'resource'
            if( this.get('newResourceIsDynamic') ) {
                resourceType = 'dynamic'
            }

			var newResource = this.store.createRecord('crudnode', {
				name: this.get('newResourceName'),                
				description: this.get('newResourceDescription'),                
				responses: responses,
				url: this.get('newResourceUri'),
				children: [],
				parent: parentID,
				methods: methods,
                class: resourceType,
				sketch: sketchId
			});

			newResource.save();
		}
    }
});

function findParent(parentId, resources) {
	// Find the parent resource								
	if( parentId ) {				
                
		for( var i=0; i < resources.length; i++ ) {	
            console.log(resources[i]);            
			if( resources[i].get('id') === parentId ) { return resources[i]; }
		}
	}	
}
