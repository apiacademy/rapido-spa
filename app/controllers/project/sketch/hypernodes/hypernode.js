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
        
        //suggestionList.push(this.get('projectController').model.get('alps'));
        
        var projectVocabList = { meta: 'vocabulary', words: []};
        var projectVocabulary = this.get('projectController').model.get('simpleVocabulary');
        for( var i = 0; i < projectVocabulary.length; i++ ) {
            projectVocabList.words.push(projectVocabulary[i]);
        }
        suggestionList.push(projectVocabList);
        
        //TODO Generecize this so it works with any content type 
        if( this.get('projectController').model.get('contentType') === CollectionJSON.contentType ) {
            var CJVocabList = { meta: CollectionJSON.name, words: []};
            for( var i = 0; i < CollectionJSON.keywords.length; i++ ) {
                CJVocabList.words.push(CollectionJSON.keywords[i]);
            }
            suggestionList.push(CJVocabList);
        }

        return suggestionList; 
    }.property('controller.project.sketch.model'),

    actions: {
       responseUpdated: function(newValue) {
           this.set('dirtyResponse', newValue);
           this.set('isDirty', true);
       },
       cancel: function() {
       },
       save: function() {
           //TODO: Parse the body and update hyperlinks
           var hyperNode = this.get('model');
           hyperNode.set('body', this.get('dirtyResponse'));
           hyperNode.save();
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
