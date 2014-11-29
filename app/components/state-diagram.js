import Ember from "ember";

export default Ember.Component.extend({
    didInsertElement: function() {
		
        var states = this.get('state-collection');		

        // Push the Ember x,y attributes to the top 
        for( var i = 0; i < states.length; i ++ ) {
            if( states[i].get('x') && states[i].get('y') ) {
                states[i].fixed = true;
                states[i].x = states[i].get('x');
                states[i].y = states[i].get('y');
            }
        }
		
		var graphSVG = d3.select('#canvas')
            .append("svg")
            .attr("width", $('#canvas').width())            
            .attr("height", $( window ).height());
					
		var component = this;

        // Don't forget: if you add a new event you need to add a property to the template
		graph.initialize(graphSVG, states, function(event, callback) {
			if( event.type === 'newTransition' ) {
                component.sendAction('createTransitionAction', event.data.sourceId);                
                callback(null);                                         
            }if( event.type === 'stateSelected' ) {
				component.sendAction('stateSelectedAction', event.data.id);
				callback(null);
            }else if( event.type === 'stateNodeMoved' ) {
                component.sendAction('stateMovedAction', event.data.state);
			}else {
                console.warn('unrecoginzed event ' + event.type);
            }
		});
		
		// Attach an observer to the states array that will let us know when new resources are added or resources are removed.
        // We can then update the tree accordingly without doing a full redraw.
	var o = Ember.Object.create({
		arrayWillChange: Ember.K,
		arrayDidChange: function(states, start, removeCount, addCount) {
            console.log('changed');
        }
    });
		
    this.get('state-collection').addArrayObserver(o);

    }
});
