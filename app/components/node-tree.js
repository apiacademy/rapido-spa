import Ember from "ember";

export default Ember.Component.extend({
    didInsertElement: function() {
		
		//console.log('didInsertElement: node-tree');		
		var resources = this.get('resources');		
		var root = createTree(resources);
		
		var graphSVG = d3.select('#canvas')
            .append("svg")
            .attr("width", $('#canvas').width())            
            .attr("height", $( window ).height());
					
		var component = this;
		
		tree.initialize(graphSVG, root, function(event, callback) {
			if( event.type === 'createChild' ) {
                component.sendAction('createChildAction', event.data.parentId);                
                callback(null);                                         
            }if( event.type === 'nodeSelected' ) {
				component.sendAction('selectAction', event.data.id);
				callback(null);
			}
		});
		
		// Attach an observer to the resources array that will let us know when new resources are added or resources are removed.
        // We can then update the tree accordingly without doing a full redraw.
        var o = Ember.Object.create({
            arrayWillChange: Ember.K,
            arrayDidChange: function(resources, start, removeCount, addCount) {
                console.log(arguments);
                var root = createTree(resources);
				console.log(root);
				tree.updateTree(root);
        }
        });
		
		this.get('resources').addArrayObserver(o);

    }
});

function createTree(resources) {
	var root = {
			id: "0",
			name: "ROOT",
			children: [],
			url: '',
			methods: [],
			root: true
		};
		// Create the root node by finding parent-less resources
		resources.forEach(function(_resource) {			
			var resource = _resource._data;
			if(!resource.parent || resource.parent === '0' || resource.parent.id === '0' ) {
				root.children.push(resource);
			}
		});
	
	return root;
}