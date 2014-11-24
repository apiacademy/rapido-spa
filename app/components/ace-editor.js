import Ember from "ember";

export default Ember.Component.extend({
    editor: {},
    typeAheadtoken: '',
    updatingText: false,
    didInsertElement: function() {
        
        var typeAheadSuggestions = this.get('typeAheadSuggestions');
        var text = this.get('text');
        var mode = this.get('mode');
        var onChangeAction = this.get('onChangeAction');
        var readOnly = this.get('readonly');
        if( !readOnly ) { readOnly = false; }
        
        // Retrieve the ID of the div element that is wrapping this component
        var editorDiv = $('#' + this.elementId).parent()[0];        
        //console.log(editorDiv);
        //console.log($(editorDiv).parent().height());
        //var wrapperHeight = editorDiv.parent().height();        
        //editorDiv.height(wrapperHeight);
        //console.log(wrapperHeight);
        //TODO: Hardcode the height for now.
        $(editorDiv).height(500);
                
        var editor = ace.edit(editorDiv.id);
                
        editor.setTheme("ace/theme/cobalt");
        editor.getSession().setMode(mode); 
        editor.setReadOnly(readOnly);
        
        editor.setValue(text, 1);        
        
        var thisComponent = this;
        
        // Initialize a typeahead handler if the typeahed list exists
        console.log(typeAheadSuggestions);
        if( typeAheadSuggestions ) {                            
            typeahead.initialize(editor, typeAheadSuggestions, function(newList, token) {
                // This function is called when a type ahead list is created.  Send an event that will bubble up to the app controller to
                // generate the list            
                console.log(token);
                thisComponent.typeAheadtoken = token;
                thisComponent.sendAction('typeAheadAction', {token: token, suggestions: newList});
            });
            $(document).keyup(typeahead.keyPressed);    
        }
        
        // Notify handlers that the document has changed
        
        editor.on("change", function(e) {
            if( !thisComponent.updatingText ) {
                if(onChangeAction) {                
                    var newValue = editor.getSession().getDocument().getValue();            
                    thisComponent.sendAction('onChangeAction', newValue);                            
                }
            }
        });                
                
        this.editor = editor;
		
		//TODO: Observe the source data and update the text editor if it changes.
		
    },
    
    updateText: function() {
        var editor = this.editor;
        var text = this.get('text');
        this.updatingText = true;
        editor.setValue(text, 1);
        this.updatingText = false;
        //TODO: Set cursor to beginning of document        
    }.observes('text'),    
    
    updateMode: function() {
        var editor = this.editor;
        var mode = this.get('mode');
        editor.getSession().setMode(mode);
    }.observes('mode'),
    
    typeAheadSuggestionSelected: function() {
        var suggestion = this.get('suggestionClicked');
        var textToInsert = suggestion.substring(this.typeAheadtoken.length, suggestion.length);        
        var editor = this.editor;
        var cursorPosition = editor.getSession().getSelection().getCursor();
        editor.getSession().insert(cursorPosition, textToInsert);
        $('#type-ahead').dialog('close');    
    }.observes('suggestionClicked')
});
