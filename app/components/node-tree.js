import Ember from "ember";

export default Ember.Component.extend({
    didInsertElement: function() {
		
		//console.log('didInsertElement: node-tree');		
		var resources = this.get('resources');		

        // convert the resource tree from an ID based tree to an object tree
        var resourceList = resources.content;
        var resourceHash = {};
        for( var i = 0; i < resourceList.length; i++ ) {
            resourceHash[resourceList[i].get('id')]=resourceList[i];
        }
        for( var i =0; i < resourceList.length; i++ ) {
            var resource = resourceList[i];
            if( resource.get('parent') ) {
                resource.parent = resourceHash[resource.get('parent')];
            }
            if( resource.get('children') && resource.get('children').length > 0 ) {
                var children = [];
                for( var j = 0; j < resource.get('children').length; j++ ) {
                    var id = resource.get('children')[j];
                    children.push(resourceHash[id]);
                }
                resource.children = children;
            }
        }

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
			root: true,
            get: function(key) { 
                return this[key];
            }
		};

    // I will need to do the conversion after ember-data screws with my data set
    // :(

    // Create the root node by finding parent-less resources
    resources.forEach(function(resource) {			
        if(!resource.get('parent') ) {
            root.children.push(resource);
        }
    });

	
	return root;
}
