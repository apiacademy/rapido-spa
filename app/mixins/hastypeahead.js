import Ember from "ember";

export default Ember.Mixin.create({
    needs: "application",
    suggestions: [{id: 'notdefined'}],
    suggestion: '',        
    selectedSuggestion: function() {
        var suggestion = this.get("controllers.application.selectedSuggestion");
        this.set('suggestion', suggestion);
    }.observes("controllers.application.selectedSuggestion"),
    
    actions: {
        setTypeAheadList: function(context) {            
            this.get('controllers.application').set('typeAheadSuggestions', context.suggestions);
            this.get('controllers.application').set('typeAheadToken', context.token);   
        }
    }                                            
});
