import Ember from "ember";

export default Ember.TextField.extend({	
    didInsertElement: function() {
		this.$().focus();
		if(this.get('select')==='true') { 
		  this.$().select();
		}
    }
});