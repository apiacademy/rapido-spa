import Ember from "ember";

export default Ember.Route.extend({
	model: function(params) {
		var sketch = this.modelFor('project.sketch');
		return this.store.find('hypernode', {sketch: sketch.id});
	}
});


