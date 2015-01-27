import Ember from "ember";

export default Ember.Route.extend({    

	setupController: function(controller, model) {
		this._super(controller, model);
        console.log(model);

		var methods = model.get('methods');
		for( var i = 0; i < methods.length; i++ ) {
			var propertyName = 'is' + methods[i] + 'Enabled';			
			controller.set(propertyName, true);
		}
        controller.set('activeMethod', model.get('responses')[0].name);
        console.log('setting isDirty to false');
	},
    
	model: function(params) {   

        return this.store.find('resource', params.resource_id);
	}
});
