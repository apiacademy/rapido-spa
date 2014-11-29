import Ember from "ember";

export default Ember.ObjectController.extend({    
    needs: ['project'],
	projectController: Ember.computed.alias("controllers.project"),
    actions: {
        goToSketch: function() {
            console.log(this.get('projectController'));
			var project = this.get('projectController').model;  
            console.log(project.get('projectType'));

            if( project.get('projectType') === 'hypermedia' ) {
                this.transitionToRoute('states', project.get('id'));
            } else {
                this.transitionToRoute('resources', project.get('id'));
            }
            
        }
    }
});
