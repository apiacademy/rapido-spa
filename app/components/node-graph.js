import Ember from "ember";

export default Ember.Component.extend({
    didInsertElement: function() {

        var nodes = this.get('nodes');
        var knownContentTypes = this.get('contentTypes');

        // The d3 graph routine doesn't use the Ember style object.get(), so just store the 
        // x and y coordinates on the object itself.
        for( var i = 0; i < nodes.content.length; i ++ ) {
            var node = nodes.content[i];
            if( node.get('x') && node.get('y') ) {
                node.fixed = true;
                node.x = node.get('x');
                node.y = node.get('y');
            }

            // Use the list of understood content-types to determine the status of the 'add link' button
            if( knownContentTypes.indexOf(node.get('contentType')) < 0 ) {
                node.showLinkButton = false;
            }else {
                node.showLinkButton = true;
            }
        }
		
		var graphSVG = d3.select('#canvas')
            .append("svg")
            .attr("width", $('#canvas').width())            
            .attr("height", $( window ).height());
					
		var component = this;

        //console.log(nodes);

        // Don't forget: if you add a new event you need to add that property to the template
		simpleGraph.initialize(graphSVG, nodes.content, function(event, callback) {
			if( event.type === 'newTransition' ) {
                //component.sendAction('createTransitionAction', event.data.sourceId);                
                component.sendAction('createTransitionAction', event.data.sourceId);                
                if( callback ) {  callabck(null) }
            }else if( event.type === 'nodeSelected' ) {
				component.sendAction('nodeSelectedAction', event.data.id);
				callback(null);
            }else if( event.type === 'nodeMoved' ) {
                component.sendAction('nodeMovedAction', event.data.node);
			}else {
                console.warn('unrecoginzed event ' + event.type);
            }
		});
		
		// Attach an observer to the nodes array that will let us know when new resources are added or resources are removed.
        // We can then update the tree accordingly without doing a full redraw.
	var o = Ember.Object.create({
		arrayWillChange: Ember.K,
		arrayDidChange: function(nodes, start, removeCount, addCount) {
            console.log('changed');
        }
    });
		
    this.get('nodes').get('content').addArrayObserver(o);

    },
    nodeObserver: function(){                
        console.log("Node list has been updated");
        console.log(this.get('nodes'));
        simpleGraph.refresh(this.get('nodes').content);
    }.observes('nodes')
});
