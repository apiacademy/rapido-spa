import Ember from "ember";

export default Ember.Controller.extend( {    
    needs: ['project','resources'],
    projectController: Ember.computed.alias('controllers.project'),
    statesController: Ember.computed.alias('controllers.states-editor'),

    initialize: function() {
        //this.set('activeMethod', 
        console.log('initialize');
    }.observes('model'),

    /** Method Checklist Properties **/
    activeMethod: '',
	isGETEnabled: false,
	isPUTEnabled: false,
	isPATCHEnabled: false,
	isPOSTEnabled: false,
	isDELETEEnabled: false,
    methodsUpdated: function() {
		Ember.run.once(this, 'processMethodUpdates');
	}.observes('isGETEnabled','isPUTEnabled','isPATCHEnabled','isPOSTEnabled','isDELETEEnabled'),
	processMethodUpdates: function() {
		var newResponseStates = [];
		var newMethods = [];

		if( this.isGETEnabled ) { newResponseStates.push('GET'); newMethods.push('GET'); }
		if( this.isPUTEnabled ) { newResponseStates.push('PUT'); newMethods.push('PUT'); }
		if( this.isPATCHEnabled ) { newResponseStates.push('PATCH'); newMethods.push('PATCH'); }
		if( this.isPOSTEnabled ) { newResponseStates.push('POST'); newMethods.push('POST'); }
		if( this.isDELETEEnabled ) { newResponseStates.push('DELETE'); newMethods.push('DELETE'); }
		
		this.set('responseStates',newResponseStates);
		this.get('content').set('methods',newMethods);
	},

    body: '',
    dirtyResponses: [],
    responseBody: function() {
		var activeMethod = this.get('activeMethod');

		var responses =  this.get('model').get('responses');		
        console.log(responses);
		
        for( var i = 0; i < responses.length; i++ ) {
			if( responses[i].name === activeMethod ) {
                console.log('returning model body');
                return responses[i].body; 
            }
		}

		// A response state was not found, so we will create it.  When saving the resource object we can throw away blank responses
        console.log('returning new body');
		responses.push({name: activeMethod, body: ''});
        console.log(responses);
        this.get('model').set('responses', responses);
        console.log(this.get('model').get('responses'));
		return '';				
	}.property('activeMethod'),

    /** Template engine properties **/
    templates: ['default','error'],

	aceMode: 'ace/mode/json',

	actions: {
        responseUpdated: function(newValue) {
            console.log('response udpated');
            var activeMethod = this.get('activeMethod');
            console.log(activeMethod);
            var responses = this.get('model').get('responses');
            console.log(responses);
            for( var i = 0; i < responses.length; i++ ) {
                console.log(responses[i].name);
                if( responses[i].name === activeMethod ) {
                    console.log('setting response body');
                    responses[i].body = newValue;
                    return;

                    // TODO: The model is not being set to dirty when this change is made.  
                    // I need to figure out how to update the ember-data record in a way that it can be marked as dirty and rolledback.
                    //this.get('model').get('responses').arrayContentDidChange(i);
                }
            }
            console.log('did not find reponse body matching this action');
            // Add a new response object if the method doesn't exist.
            console.log(responses);

            //this.get('model').set('responses', responses);
        },
        cancel: function() {
            this.get('model').rollback();
        },
        save: function() {
            console.log(this.get('model'));
            this.get('model').set('project', this.get('projectController').get('model').get('id'));
            this.get('model').save();
        },
        loadTemplate: function() {
            
        }
	}
});
