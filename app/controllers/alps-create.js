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

    actions: {
        updated: function(newValue) {
            this.set('dirtyBody', newValue);
        },
        save: function() {
                console.log('****');
            console.log(this.get('dirtyBody'));
            var newALPSProfile = this.store.createRecord('alps', {
                name: this.get('name'),
                description: this.get('description'),
                contentType: 'xml',
                source: this.get('dirtyBody')
            });

            newALPSProfile.save();
            this.transitionToRoute('alps');

        }
    }
});
