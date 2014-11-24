import Ember from "ember";

export default Ember.Route.extend({
	model: function() {
		var project = this.modelFor('project');
		console.log(project);		
		return this.store.find('resource', {project: project.id});
	}
});