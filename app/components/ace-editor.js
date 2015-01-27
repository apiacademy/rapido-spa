import Ember from "ember";

export default Ember.Component.extend({
    editor: {},
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
    //TODO: Hardcode the height for now.
    $(editorDiv).height(500);
            
    var editor = ace.edit(editorDiv.id);
            
    editor.setTheme("ace/theme/cobalt");
    editor.getSession().setMode(mode); 
    editor.setReadOnly(readOnly);
    
    editor.setValue(text, 1);    

    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
    });

    var langTools = ace.require("ace/ext/language_tools");
    var Range = ace.require("ace/range").Range;

    // Get vocabulary lists
    var nodeList = this.get('nodeList');
    if( !nodeList ) { nodeList = []; }
    if( !typeAheadSuggestions ) { typeAheadSuggestions = []; }

    var simpleVocabCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
            if (prefix.length === 0) { callback(null, []); return }
            var wordList = [];
            if( pos.column > 3 ) { 
                var textBefore = session.getTextRange(Range.fromPoints({row: pos.row, column: pos.column-3},{row: pos.row, column: pos.column-1}));
                if( textBefore === '$(' ) {
                    // Include the nodeList in the autocomplete results 
                    wordList = wordList.concat(nodeList.map(function(word) {
                        return {
                            caption: word,
                            value: word + ')',
                            score: 100,
                            meta: 'resource'
                        };
                    }));
                }
            }
            for( var i = 0; i < typeAheadSuggestions.length; i++ ) {
                var meta = typeAheadSuggestions[i].meta;
                wordList = wordList.concat(typeAheadSuggestions[i].words.map(function(word) {
                    return {
                        caption: word,
                        value: word,
                        score: 100,
                        meta: meta
                    };
                }));
            }
            callback(null, wordList); 
        }
    }
    langTools.addCompleter(simpleVocabCompleter);

    
    var thisComponent = this;
    
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
        console.log('text has changed!');
        var editor = this.editor;
        var text = this.get('text');
        console.log(text);
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
    
});
