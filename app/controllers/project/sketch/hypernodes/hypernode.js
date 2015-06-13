import Ember from "ember";

export default Ember.Controller.extend( {    
    needs: ['project', 'project/sketch','project/sketch/hypernodes'],
    projectController: Ember.computed.alias('controllers.project'),

    initialize: function() {
        this.set('responseBody', this.get('model').get('body'));
    }.observes('model'),

    // Navigation properties
    outboundLinks: [],

    // Editor properties
    isDirty: true,
    aceMode: 'ace/mode/json',
    responseBody: '',
    dirtyResponse: '',

    // Delete confirmation flags
    hasChildren: false,
    orphanNodes: [],


    updateLinks: function() {
        console.log('updating links...');
        // Create a list of route transitions to other hypernodes based on the transitions table of this node.
        var transitions = this.get('model').get('transitions');
        for( var i = 0; i < transitions.length; i++ ) {
            ouboundLinks.push({name: 'test', href: 'project.sketch.hypernodes.hypernode', id: transitions[i].target });
        }

    }.observes('controller.project.sketch.hypernodes.model'),
    suggestions: function() {
        // Build a typeahead suggestion list for the editor
        var suggestionList = [];
        
        suggestionList.push(this.get('projectController').model.get('alps'));
       
        console.log(suggestionList); 
        return suggestionList; 
    }.property('controller.project.sketch.model'),

       actions: {
           responseUpdated: function(newValue) {
           },
       cancel: function() {
       },
       save: function() {
       },
       delete: function() {
           // Build a list of child nodes that will be impacted by this deletion
           var orphanNodes = [];
           var transitions = this.get('model').get('transitions');

           if( transitions.length ===  0 ) { 
               this.set('hasChildren', false);
           }else {
               this.set('hasChildren', true);

               // TODO: What about nodes that have multiple parents?
               for( var i = 0; i < transitions.length; i++ ) {
                   orphanNodes.push(transitions[i].target);
               }

               this.set('orphanNodes', orphanNodes);
               
           }
           $('#delete-confirm').modal();
       },
       deleteConfirmed: function() {
           // Delete this node from the server and transition back to the graph route.
           console.log('deleteConfirmed');

           // Queue up the list of changes that need to be made and then fire them all

           // Iterate through the list of all nodes and find any transition references
           
       }

       }
});
