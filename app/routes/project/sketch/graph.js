import Ember from "ember";


export default Ember.Route.extend({
	model: function() {
		var sketch = this.modelFor('project.sketch');
		return this.store.find('hypernode', {sketch: sketch.id});
	},
    actions: {
       modelUpdated: function() {
           console.log('updating model');
           this.refresh();
    },
    openModal: function(sourceId) {
		var sketch = this.modelFor('project.sketch');
        var project = this.modelFor('project');

        var route = 'project.sketch.graph.hypernode.create-link';
        this.transitionTo(route, project.id, sketch.id, sourceId);
    }
  }
});
