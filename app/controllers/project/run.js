import Ember from "ember";

export default Ember.Controller.extend({    
	needs: ['project'],
	projectController: Ember.computed.alias("controllers.project"),	

       actions: {
           start: function() {
               console.log('starting server...');
           }
       }
});
