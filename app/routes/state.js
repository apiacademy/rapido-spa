import Ember from "ember";

export default Ember.Route.extend({    

	model: function(params) {
        
		var states = this.modelFor('states').content;		
		return new Promise(function(resolve, reject) {
			for( var i =0; i < states.length; i++ ) {
				if( states[i].id === params.state_id ) {
					resolve(states[i]);
				}
			}
			reject('unable to find response state with an id of ' + params.state_id);
		});
	}
});

