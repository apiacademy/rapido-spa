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
 * @source {Record} an ember-data record of the state that owns the response body 
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

	// Existing Transitions = t1
	// parse links,queries,items,etc
	// when transition is found, move it to the new transitions object
    
    for( var i = 0; i < transitions.length; i++ ) {
        transitionsToBeMatched[transitions[i].target+'.'+transitions[i].className] = transitions[i];
    }
	var newTransitions = [];

	function parseTransition(name, className) {
		var id = nameMap[name];
		var matchingTransition = transitionsToBeMatched[id+className];
		if( matchingTransition ) {
			newTransitions.push(matchingTransition);
		}
		else {
			console.log('This is a new transition and needs to be added');
		}
	}

	// Sort the transitions to be matched by their target name.  This will allow us to determine which transitions still exist, which
	// have been deleted, and which ones are new.
	
	var nameMap = {}
	for( var i =0; i < states.length; i++ ) {
		nameMap[states[i].get('name')] = states[i].get('id');
	}

    console.log(transitionsToBeMatched);

    if( !cjDoc.collection ) { return; }
    var collection = cjDoc.collection;

    
    if( cjDoc.links ) {
        for( var i = 0; i < cjDoc.links.length; i++ ) {
            var link = cjDoc.links[i];
			var name = link.href.substr(2, link.href.length-3);
			parseTransition(name, '.cj-link');
        }
    }

    if( collection.items ) {
		for( var i = 0; i < collection.items.length; i++ ) {
			var item = collection.items[i];
			// Lookup the object ID for this item link
			var name = item.href.substr(2, item.href.length-3);
			parseTransition(name, '.cj-item');
		}
    }

	if( cjDoc.queries ) {
		for( var i = 0; i < cjDoc.queries.length; i++ ) {
			var query = cjDoc.queries[i];
			var name = query.href.substr(2, query.href.length-3);
			parseTransition(name, '.cj-query');
		}
	}

	// If transitions have been changed, save the updated transitions to the server 
	source.set('transitions', newTransitions);
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
