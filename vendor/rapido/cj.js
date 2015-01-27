/** 
Functions for building and modifying standardized response bodies

A response generator should support the following event hooks:

**/

var CollectionJSON = (function (){

/**
 * Validates that a JSON document adheres to the Collection+JSON specification.
 * Throws SyntaxExceptions when errors are found.
 * @param {object} doc A JavaScript object that represents a parsed JSON document. 
 * @return {array} Returns a collection of warnings
 */
function validate(doc) {

    // Call error when something is wrong.
    error = function (m) {
        throw {
            name:    'SyntaxError',
            message: m
        };
    };
    
    if( !doc.collection ) {
        // No collection has been found, so all transitions should be deleted
        error( 'No collection object found'); 
    } 

    // Everything in the spec except for the collection property requirement is MAY and SHOULD
    // In the future I might make validation spit out warnings when SHOULD rules are not met.
    var warnings = [];
    return warnings;
}
    
/**
 * Generates a skeleton response body with a minimum set of properties.
 * @param {string} the name of the item for this collection 
 */
function generateBody(collectionName) {
    var doc = {};    
    doc.collection = {};

    doc.collection.version = '1.0';
    doc.collection.href = "$(" + collectionName + ")";
        
    return doc;
}


/**
 * Parse a Cj document and update this state's transitions based on the contents of the document.
 * @doc {string} the document to parse in string format
 * @states {Array} a collection of ember-data state records.  
 * @states {Record} an ember-data record of the state that owns the response body 
 */
function parse(doc, states, source)  {
    var cjDoc = JSON.parse(doc);

    /* transitions may be mapped to any of:
     *    1.  collection.links
     *    2.  collection.items
     *    3.  colleciton.items.links
     *    4.  colleciton.items.queries
     *    5.  collection.queries
     **/

    // Keep track of transitions that we have identified in the document
    
    var transitionsToBeMatched = {};
    var transitions = source.get('transitions');
    
    for( var i = 0; i < transitions.length; i++ ) {
        transitionsToBeMatched[transitions[i].target+'.'+transitions[i].className] = transitions[i];
    }
    console.log(transitionsToBeMatched);

    if( !cjDoc.collection ) { return; }
    var collection = cjDoc.collection;

    if( collection.links ) {
        for( var i = 0; i < collection.links; i++ ) {
            var link = collection.links[i];
        }
    }

}

function exportModel( exportType, states ) {
    var ex = '';
    
    if( exportType === 'WADL' ) { 
        
    }
    return exportType;
}

/**
  Class names:
  cj-link
  cj-query
  cj-item
  cj-item-link
  cj-item-query
  **/
    
return {    
    parse: function(doc, states, source) {
        parse(doc, states, source);
    },
    exportModel: function( exportType, states ) {
        return exportModel(exportType, states);
    },

    name: 'Collection+JSON',
    contentType: 'application/vnd.collection+json',
    keywords: ['collection','items','data','href','version','template','name','value']
}
}());
