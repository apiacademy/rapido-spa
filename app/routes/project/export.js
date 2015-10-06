import Ember from "ember";

// Transition to the relevant sketch.export based on the last working sketch.
export default Ember.Route.extend({
    model: function() {
		var project = this.modelFor('project');

        // Get the last sketch that was being used or the first sketch
        this.transitionTo('project.sketch.export', project.get('activeSketch'));
	}

    
});
