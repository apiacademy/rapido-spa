import Ember from "ember";

export default Ember.Route.extend({
	model: function() {
		var project = this.modelFor('project');

        if( project.get('projectType') === 'CRUD' )  {
            this.transitionTo('project.sketch.tree', project.get('activeSketch'));
        }else {
            // Get the last sketch that was being used or the first sketch
            this.transitionTo('project.sketch.graph', project.get('activeSketch'));
        }

	}
});

