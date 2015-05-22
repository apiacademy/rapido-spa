import Ember from "ember";

export default Ember.Route.extend({
	model: function() {
		var project = this.modelFor('project');

        // Get the last sketch that was being used or the first sketch
		//return this.store.find('hypernodes', {project: project.id});
		return this.store.find('sketch', {project: project.id});
	}
});

