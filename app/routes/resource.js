import Ember from "ember";

export default Ember.Route.extend({    

	setupController: function(controller, model) {
		this._super(controller, model);

		var methods = model.get('methods');
		for( var i = 0; i < methods.length; i++ ) {
			var propertyName = 'is' + methods[i] + 'Enabled';			
			controller.set(propertyName, true);
		}
	},
    
	model: function(params) {   
		var resources = this.modelFor('resources-editor').content;		
		return new Promise(function(resolve, reject) {
			for( var i =0; i < resources.length; i++ ) {
				if( resources[i].id === params.resource_id ) {
					resolve(resources[i]);
				}
			}
			reject('unable to find resource with id of ' + params.resource_id);
		});
	}
});
