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
 * Inserts a new data item into an existing collection.
 * @param {string} the name of the item for this collection 
 */
function insertItem(collection)  {

}
    
return {    
    create: function(collectionName) {
        return generateBody(collectionName);
    }, 
    insertItem: function(itemId, body) {
    },
    contentType: 'application/vnd.collection+json'
}
}());
