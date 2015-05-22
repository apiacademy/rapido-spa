import Ember from "ember";

export default Ember.Route.extend({
	model: function() {
		var sketch = this.modelFor('sketch');

        // Get the last sketch that was being used or the first sketch
		//return this.store.find('hypernodes', {project: project.id});
        console.log('looking for hypernodes...');
		return this.store.find('hypernode', {sketch: sketch.id});
	}
});
