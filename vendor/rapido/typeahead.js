/**
 * @fileoverview Creation and management of typeahead lists for editors
 * 
 */
var typeahead = (function (){
    
var typeAheadDivId = '#type-ahead' ;
var editor;
var words = [];
var typeAheadListener;
var typeAheadState = 'inactive';
    
/**
 * Handles specific keyboard events for navigation of suggestions and cancellation of the typeahead function
 * @param e - a jQuery event object
 */
function keyListener(e) {        
    if( e.keyCode === 27 ) { 
        $(typeAheadDivId).dialog('close');        
    }else if( e.keyCode === 40 ) {
        console.log('down');
//        if( typeAheadState === 'active' ) {
//            console.log('move the active selection down');
//            console.log('prevent the user from moving the anchor');
//            //TODO: This is a hack and looks bad.  I need to figure out how to stop ACE from letting the user move the cursor
//            editor.getSession().getSelection().moveCursorUp();
//        }
        // if the type-ahead dialog is open, move the selection down
    }else if( e.keyCode === 38 ) {
        // if the type-ahead dialog is open, move the selection up
    }else if( e.keyCode === 13 ) {
        // Enter
        // select the currently active typeahead
        
    }
}

/**
 * Create the empty type ahead dialog box
 * @param {number} top - the position of the top of the typeahead box  
 * @param {number} left - the position of the left side of the typeahead box
 */
function createTypeAheadBox(left, top) {
    
    //var coords = responseEditor.renderer.textToScreenCoordinates(range.start.row, range.start.column);    
    // TODO: the offset should be based on the font height / screen size
    //var yOffset = 20;
            
    // Let our focus listener know that we are temporarily taking focus away
    //expectedFocusChange = true;

    $(typeAheadDivId).dialog({
        position: [left, top],
        closeOnEscape: true,
        draggable: false,
        resizable: false,
        dialogClass: "type-ahead"
    });
    $(typeAheadDivId).dialog("open");
    
    // Set the focus back on the ace editor pane so the user can continue to type
    editor.focus();
            
    // reset our focus flag so that we can catch focus change events
    //expectedFocusChange = false;
}

function editorChanged(e) {
    
    // in some cases we may change the editor data without having a type ahead box popup
    //if( ignoreDataChange ) { 
    //    return;
    //}
    console.log(e.data.action);
    
    if (e.data.action === "insertText" || e.data.action === "removeText") {
        
        var document = editor.getSession().getDocument();
        
        // Read all characters to the left of the last character entered until we hit a non-legal character
        var range = e.data.range.clone();
        var buffer = "";
        
        while( range.start.column > 0 && (buffer.length === 0 || buffer.match(/^[+_\-0-9a-zA-Z]+$/)) ) {
            range.start.column--;
            buffer = editor.getSession().getTextRange(range);
        }   
        
        range.start.column++;
        var token = editor.getSession().getTextRange(range);
                
        $(typeAheadDivId).find('div').remove();
        
        // Look for matching words based on the token
        var matchingWords = [];
        for( var i = 0; i < words.length; i++ ) {
            var word = words[i];
            if( word.id.substring(0, token.length) === token) {
                matchingWords.push(word.id);                
            }            
        }
        
        console.log(matchingWords);
        
        // Update the typeahead div by calling the listener.  This will fire an event in the Ember framework via the component.
        typeAheadListener(matchingWords, token);
        
        // Open or close the typeahead box as appropriate
        if( token.length > 0 && matchingWords.length > 0 ) {
            var coords = editor.renderer.textToScreenCoordinates(range.start.row+1, range.start.column);
            console.log(coords);
            createTypeAheadBox(coords.pageX, coords.pageY + 5);        
            //editor.keyBinding.setDefaultHandler(null)             
            typeAheadState = 'active';
        } else if( typeAheadState === 'active' ) {
            // there is no list - make sure the typeAheadBox is closed.
            // TODO: handle the case where the dialog has not been initialized.
            $(typeAheadDivId).dialog('close');   
            typeAheadState = 'inactive';
        }        
        
    }
}

function initialize(_editor, _words, _typeaheadListener) {
    editor = _editor;
    words = _words;
    typeAheadListener = _typeaheadListener;
    editor.on("change", editorChanged);
    // Add event hook for changes to the parent div
    // TODO: Make this div id dynamic - can we reference it from the ACE object or does it need to be passed?
    //$("#editor").on("keyup", editorKeyUp);           
}
    
    
/** public methods **/
return {
    initialize: function(editor, list, typeaheadListener) {
        initialize(editor, list, typeaheadListener);
    },
    open: function(top, left, list) {
        createTypeAheadBox(top, left);
    },
    keyPressed: function(e) {
        console.log(e);
        keyListener(e);
    }
}
}());