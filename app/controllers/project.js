import Ember from "ember";

export default Ember.ObjectController.extend({    
    actions: {
        goToSketch: function() {
			var project = this.get('content');  

            if( project.get('projectType') === 'hypermedia' ) {
                this.transitionToRoute('states', project.get('id'));
            } else {
                this.transitionToRoute('resources', project.get('id'));
            }
            
        }
    }
});
