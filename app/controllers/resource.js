import Ember from "ember";

import HasTypeAheadEditor from '../mixins/hastypeahead';

export default Ember.ObjectController.extend(HasTypeAheadEditor, {    
	dirtyResponses: {},
	isDirty: false,
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
