import Ember from "ember";

export default Ember.ArrayController.extend({
    needs: ['project','project/sketch'],
    sketchController: Ember.computed.alias('controllers.project/sketch'),
    projectController: Ember.computed.alias('controllers.project'),

    thumbnail: '',
    linkableContentTypes: ['application/vnd.collection+json'],
    projectName: function() {
        return this.get('projectController').model.get('name');
    }.property('projectController'),
       selectedSketch: {id: 14},
    sketchList: [],
    retrieveSketchList: function() {
        var controller = this;
        var projectId = this.get('projectController').model.get('id');
        this.store.find('sketch', {project: projectId}).then(function(sketches) {
            var sketchList = [];
            for( var i = 0; i < sketches.content.length; i++ ) {
                var label = 'Sketch #' + (i+1);
                sketchList.push({label: label, id: sketches.content[i].id});
            }
            controller.set('sketchList', sketchList );
            controller.set('selectedSketch', {id: controller.get('sketchController').model.get('id')});
            var thisSketchID = controller.get('sketchController').model.get('id');
            var selectedSketch = controller.get('selectedSketch');
        });
    }.observes('sketchController').on('init'),

    sketchSelected: function() {
        var thisSketchId = this.get('sketchController').model.get('id');
        var sketchId = this.get('selectedSketch').id;
        if( sketchId != thisSketchId ) {
            var projectId = this.get('projectController').model.get('id');
            console.log('transitioning to selected sketch');
            this.transitionToRoute('project.sketch.graph', projectId, sketchId);
        }
    }.observes('selectedSketch.id'),

    actions: {
        newSketch: function() {
            // Add new sketch
            var sketch = this.store.createRecord('sketch', {
                project: this.get('projectController').model.id, 
                name: 'auto generated'
            });
            sketch.save();

            // Transition to the new sketch
        },
        nodeSelected: function(id) {
            if( !id ) {
                //TODO: Implement
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

           this.set('thumbnail', $('#svg-canvas').html());
           var project = this.get('projectController').model;

           // Save the html thumbnail in the project
           var thumbs = project.get('sketchThumbnails');
           if( !thumbs ) { thumbs = []; }
           
           

       }
    }
});

