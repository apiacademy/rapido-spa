import Ember from "ember";

export default Ember.Controller.extend({    
    actions: {
        goToSketch: function() {
			var project = this.get('content');  
            this.transitionToRoute('project.sketches', project.get('id'));
        },
       goToVocab: function() {
           var project = this.get('content');  
           this.transitionToRoute('project.vocabulary', project.get('id'));
       },
       goToExport: function() {
           var project = this.get('content');  
           this.transitionToRoute('project.export', project.get('id'));
       },
       goToMap: function() {
           var project = this.get('content');  
           this.transitionToRoute('maps', project.get('id'));

       }
    }
});
