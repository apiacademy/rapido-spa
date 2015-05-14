import Ember from "ember";

export default Ember.Route.extend({
	model: function() {
		var project = this.modelFor('project');
		return this.store.find('state', {project: project.id});
	}
});
