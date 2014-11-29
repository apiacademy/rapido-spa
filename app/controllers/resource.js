import Ember from "ember";

import HasTypeAheadEditor from '../mixins/hastypeahead';

export default Ember.ObjectController.extend(HasTypeAheadEditor, {    
	dirtyResponses: {},
	isDirty: false,

	isGETEnabled: false,
	isPUTEnabled: false,
	isPATCHEnabled: false,
	isPOSTEnabled: false,
	isDELETEEnabled: false,	
	methodsUpdated: function() {
		console.log('updated');
		Ember.run.once(this, 'processMethodUpdates');
	}.observes('isGETEnabled','isPUTEnabled','isPATCHEnabled','isPOSTEnabled','isDELETEEnabled'),
	processMethodUpdates: function() {
		this.set('isDirty',true);
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

	aceMode: 'ace/mode/json',

	actions: {
		responseUpdated: function(newValue) {
			this.set('isDirty', true);
			var activeResponseState = this.get('activeResponseState');
			var dirtyResponses = this.get('dirtyResponses');
			dirtyResponses[activeResponseState] = newValue;
		}
	}
});
