import Ember from "ember";

export default Ember.Route.extend({
	model: function() {
        console.log('******************TREE*********');
		var sketch = this.modelFor('project.sketch');

        console.log(this.modelFor('project'));
        console.log(this.modelFor('project.sketch'));
		return this.store.find('crudnode', {sketch: sketch.id});
	},
});
