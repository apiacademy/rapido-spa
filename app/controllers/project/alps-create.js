import Ember from "ember";


export default Ember.Controller.extend( {    
    needs: ['project'],
    projectController: Ember.computed.alias('controllers.project'),
    aceMode: 'ace/mode/xml',
    suggestions: function() {
        var suggestionList = [];
        suggestionList.push({ meta: 'ALPS', words: ['alps', 'doc', 'descriptor', 'ext', 'format', 'href', 'id', 'link', 'name', 'rel', 'rt', 'type', 'value', 'version' ]});
        return suggestionList;
    },
    alpsBody: '',
    dirtyBody: '',
    name: '',
    description: '',
    isNameValid: function(){
        if( this.get('name').length > 0 ) {
            return true;
        }else {
            return false;
        }
    }.property('name'),
    isButtonDisabled:  Ember.computed.not('isNameValid'),

    actions: {
        updated: function(newValue) {
            this.set('dirtyBody', newValue);
        },
        save: function() {
            var newALPSProfile = this.store.createRecord('alps', {
                name: this.get('name'),
                description: this.get('description'),
                contentType: 'xml',
                source: this.get('dirtyBody')
            });

            newALPSProfile.save().then(
                function(newProfile) { 
                    this.transitionToRoute('alps');
                }, 
                function(newProfile) {
                    console.log('there was an error');
                    console.log('how should we tell the user?');
                }
            );
        }
    }
});
