import Ember from "ember";


export default Ember.Route.extend({
	model: function(params) {
        var nodeId = params.node_id;
		var sketchModel = this.modelFor('project.sketch.graph');
        var nodes = sketchModel.get('content');

        console.log('trying to find the node...');
        console.log(nodeId);

        if( nodeId === 'root' ) {
            return null;
        }else {
            for( var i=0; i < nodes.length; i++ ) {
                if( nodes[i].get('id') === nodeId ) { 
                    return nodes[i];
                }
            }
        }
	}
});

