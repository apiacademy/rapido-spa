import Ember from "ember";


export default Ember.ObjectController.extend( {    
    needs: ['project','states-editor'],
    projectController: Ember.computed.alias('controllers.project'),
    statesController: Ember.computed.alias('controllers.states-editor'),

    aceMode: 'ace/mode/json',
    responseBody: function() {
        return JSON.stringify(this.get('model').get('responses').primary, null, '    ');
    }.property('model.responses'),
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

        suggestionList.push(projectVocabList);
        return suggestionList;

    }.property('controller.project.model'),

    actions: {
        responseUpdated: function(newValue) {
        }
    }

});
