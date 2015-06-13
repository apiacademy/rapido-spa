import Ember from "ember";


export default Ember.Route.extend({
	model: function() {
		var sketch = this.modelFor('project.sketch');

        // Get the last sketch that was being used or the first sketch
		//return this.store.find('hypernodes', {project: project.id});
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

        //var route = 'sketch.graph.hypernode.' + contentType;
        //TODO: dyanmically route to the correct content type
        var route = 'project.sketch.graph.hypernode.create-link';
        this.transitionTo(route, project.id, sketch.id, sourceId);

/*
        Ember.run.scheduleOnce('afterRender', this, function() {
            console.log('afterRender');
            $('#transitionModal').modal('show');
        });
        return this.render('sketch.transition-cj', {
            into: 'sketch.graph',
            controller: 'sketch.transition-cj',
            outlet: 'modal'
        });
*/
       
    }
  }
});
