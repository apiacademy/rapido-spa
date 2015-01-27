/** 
Functions for building and modifying standardized response bodies

A response generator should support the following event hooks:

**/

var HAL = (function (){

/**
 * Validates that a JSON document adheres to the Collection+JSON specification.
 * Throws SyntaxExceptions when errors are found.
 * @param {object} doc A JavaScript object that represents a parsed JSON document. 
 * @return {array} Returns a collection of warnings
 */
function validate(doc) {
}
    
/**
 * Parse a Cj document and update this state's transitions based on the contents of the document.
 * @doc {string} the document to parse in string format
 * @states {Array} a collection of ember-data state records.  
 * @states {Record} an ember-data record of the state that owns the response body 
 */
function parse(doc, states, source)  {
}

function exportModel( exportType, states ) {
}

/**
  Class names:
  hal-link
  **/
    
return {    
    parse: function(doc, states, source) {
        parse(doc, states, source);
    },
    exportModel: function( exportType, states ) {
        return exportModel(exportType, states);
    },

    name: 'HAL',
    contentType: 'application/hal+json',
    keywords: ['_curie', 'link']
}
}());
