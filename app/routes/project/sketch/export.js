import Ember from "ember";

// Transition to the relevant sketch.export based on the last working sketch.
export default Ember.Route.extend({
    model: function() {
		var project = this.modelFor('project');
        var sketch = this.modelFor('project.sketch');

        if( project.get('projectType') === 'hypermedia' ) {
            // get the list of hypermedia resources
            return this.store.find('hypernode', {sketch: sketch.id});
        }else {
            // get the list of CRUD resources
        }

	}

    
});
