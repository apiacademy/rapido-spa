import Ember from "ember";

export default Ember.Controller.extend({    
    needs: ['project'],
	projectController: Ember.computed.alias("controllers.project"),
    actions: {
        goToSketch: function() {
			var project = this.get('projectController').model;  

            if( project.get('projectType') === 'hypermedia' ) {
                this.transitionToRoute('states', project.get('id'));
            } else {
                this.transitionToRoute('resources', project.get('id'));
            }
            
        }
    }
});
