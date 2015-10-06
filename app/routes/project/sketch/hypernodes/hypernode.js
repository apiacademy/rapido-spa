import Ember from "ember";

export default Ember.Route.extend({
	model: function(params) {

        var nodeId = params.node_id;
		var nodes = this.modelFor('project.sketch.hypernodes').content;

        for( var i = 0; i < nodes.length; i++ ) {
            if( nodes[i].get('id') === nodeId ) {
                return nodes[i];
            }

        }
        console.error('unable to find matching node');
        return;
	}
});



