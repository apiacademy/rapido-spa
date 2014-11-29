import Ember from "ember";

export default Ember.ArrayController.extend({
    transitionCreationActions: function() {
        // the list of availabile modal flows for a create link activitiy based on the media type 
        return [{'description': 'add item', 'icon': 'blah'}]
    }.property(),
    actions: {
        stateSelected: function(id) {
            console.log(id);
            if( !id ) {
                // The user probably clicked on the canvas.  Treat this as a cancel or unselect and send them to the collection
                this.transitionToRoute('states');
            }else { 
                // Transition to the property editor for this response node
                this.transitionToRoute('state-editor', id);
           }
        },
        createTransition: function(id) {
            this.transitionToRoute('state.create-cj-transition', id);
        },
       stateMoved: function(state) {
           state.set('x', state.x);
           state.set('y', state.y);
           state.save();
       }
    }
});
