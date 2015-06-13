import Ember from "ember";

export default Ember.ArrayController.extend({
    needs: ['project','project/sketch'],
    sketchController: Ember.computed.alias('controllers.project/sketch'),
    projectController: Ember.computed.alias('controllers.project'),

    linkableContentTypes: ['application/vnd.collection+json'],

    transitionCreationActions: function() {
        // the list of availabile modal flows for a create link activitiy based on the media type 
        return [{'description': 'add item', 'icon': 'blah'}]
    }.property(),
    actions: {
        nodeSelected: function(id) {
            console.log('nodeSelected');
            console.log(id);
            if( !id ) {
                // The user probably clicked on the canvas.  Treat this as a cancel or unselect and send them to the collection
                //this.transitionToRoute('states');
            }else { 
                // Transition to the property editor for this response node
                var projectId = this.get('projectController').model.id;
                var sketchId = this.get('sketchController').model.id;
                this.transitionToRoute('project.sketch.hypernodes.hypernode', projectId, sketchId, id);
           }
        },
       nodeMoved: function(node) {
           node.set('x', node.x);
           node.set('y', node.y);
           node.save();
       }
    }
});

