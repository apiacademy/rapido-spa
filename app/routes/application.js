import Ember from "ember";

export default Ember.Route.extend({
	model: function() {
		// Try to get the user model from a cookie.  The controller will use this to determine
    	// if the user is authenticated.                  
    	//return Backend.getUser();				
		return this.store.find('project');
	}
});