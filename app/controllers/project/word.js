import Ember from "ember";

//* ObjectController is deprecated, but when I convert this class to a Controller the vocab lsit no longer works
export default Ember.ObjectController.extend({
	needs: ['project/vocabulary'],
	isEditing: false,
	actions: {
		editWord: function() {
			console.log('editWord');
			this.set('isEditing', true);
			//TODO: Update backend
		},
		saveWord: function(val) {
			if( !val ) {
				console.log('empty value');
				// Remove this word from the vocabulary				
				console.log(this.get('content'));
				this.send('deleteWord', this.get('content'));
			}
						
			console.log('saveWord');
			this.set('isEditing', false);
			//TODO: Update backend
		}
	}	
});
