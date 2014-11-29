import Ember from "ember";

export default Ember.Route.extend({
	model: function() {
        //TODO: CHeck if user is authenticated.

        //TODO: decide what we should be returning as a model.
		return this.store.find('project');
	}
});
