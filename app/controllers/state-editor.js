import Ember from "ember";


export default Ember.ObjectController.extend( {    
    needs: ['project','states-editor'],
    projectController: Ember.computed.alias('controllers.project'),
    statesController: Ember.computed.alias('controllers.states-editor'),

    
    initialize: function() {
        this.set('responseBody', this.get('model').get('responses').primary);
    }.observes('model'),
    isDirty: false,
    outboundLinks: [],
    inboundLinks: [],
    updateLinks: function() {
        //TODO: implement this.
        // find all states that I'm linking to and turn into an addressable list
        var transitions = this.get('model').get('transitions');
        console.log(transitions);
        var states = this.get('statesController').model.content;
        var stateMap = {}

        var outboundLinks = [];
        var inboundLinks = [];

        for( var i = 0; i < states.length; i++ ) {
            stateMap[states[i].get('id')] = states[i];
        }

        console.log(stateMap);  

        for( var i = 0; i < transitions.length; i++ ) {
            var target = stateMap[transitions[i].target];
            console.log(target);
            if( target === this.get('model').get('id') ) {
                var source = transitions[i].source;
                inboundLinks.push({name: source.get('name'), href: 'state-editor', id: source.get('id')});
            }
            outboundLinks.push({name: target.get('name'), href: 'state-editor', id: target.get('id')});
        }
        this.set('outboundLinks', outboundLinks);
        this.set('inboundLinks', inboundLinks);

    }.observes('controller.states.model'),

    aceMode: 'ace/mode/json',
    responseBody: '',
    dirtyResponse: '',
    stateNames: function() {
        var states = this.get('statesController').model.content;
        var nameList = [];
        for( var i = 0; i < states.length; i++ ) {
            nameList.push(states[i].get('name'));
        }
        return nameList;
        
    }.property('controller.states.model'),
    suggestions: function() {		
        var suggestionList = [];

        var projectVocabulary = this.get('projectController').model.get('simpleVocabulary');
        var projectVocabList = { meta: 'vocabulary', words: []};
        for( var i = 0; i < projectVocabulary.length; i++ ) {
            projectVocabList.words.push(projectVocabulary[i]);
        }

        if( this.get('projectController').model.get('contentType') === CollectionJSON.contentType ) {
            var CJVocabList = { meta: CollectionJSON.name, words: []};
            for( var i = 0; i < CollectionJSON.keywords.length; i++ ) {
                CJVocabList.words.push(CollectionJSON.keywords[i]);
            }
            suggestionList.push(CJVocabList);
        }

        suggestionList.push(projectVocabList);
        return suggestionList;

    }.property('controller.project.model'),

    actions: {
        responseUpdated: function(newValue) {
            this.set('dirtyResponse', newValue);
            this.set('isDirty', true);

            // Validate the document
        },
        cancel: function() {
            console.log(this.get('model').get('responses').primary);
            var originalBody = this.get('model').get('responses').primary;
            this.set('responseBody', originalBody);
        },
        save: function() {
            //TODO: use ember-data model save method
            // Parse the document and update the states that are impacted
            var states = this.get('statesController').model.content;
            var contentType = this.get('projectController').model.get('contentType');

            if( contentType === CollectionJSON.contentType ) {
            	CollectionJSON.parse(this.get('dirtyResponse'), states, this.get('model'));
            	var responses = this.get('model').get('responses');
		responses.primary = this.get('dirtyResponse');
		this.get('model').set('responses', responses);
		this.get('model').save();
	    } else {
                // Treat this as a generic app/json, just save it.
		console.log('in else branch');
            }
        }
    }

});
