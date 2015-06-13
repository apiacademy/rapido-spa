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

function exportModel( exportType, states, projectName, projectDescription ) {
    var ex = '';

    if( exportType === 'WADL' ) { 

            ex+="<?xml version=\"1.0\"?>\n";
            ex+="<application xmlns=\"http://wadl.dev.java.net/2009/02\">\n";
            ex+="<resources>\n";
            
            for( var i = 0; i < states.length; i++ ) {
                var state = states[i];

                ex = ex + "<resource path=\"" + "/" + state.get('url') + "\">";
                ex = ex + "<method name=\"GET\">\n";

            }

        /**
         *  
16   <resources base="http://api.search.yahoo.com/NewsSearchService/V1/"> 
17     <resource path="newsSearch"> 
18       <method name="GET" id="search"> 
19         <request> 
20           <param name="appid" type="xsd:string" 
21             style="query" required="true"/> 
22           <param name="query" type="xsd:string" 
23             style="query" required="true"/> 
24           <param name="type" style="query" default="all"> 
25             <option value="all"/> 
26             <option value="any"/> 
27             <option value="phrase"/> 
28           </param> 
29           <param name="results" style="query" type="xsd:int" default="10"/> 
30           <param name="start" style="query" type="xsd:int" default="1"/> 
31           <param name="sort" style="query" default="rank"> 
32             <option value="rank"/> 
33             <option value="date"/> 
34           </param> 
35           <param name="language" style="query" type="xsd:string"/> 
36         </request> 
37         <response status="200"> 
38           <representation mediaType="application/xml" 
39             element="yn:ResultSet"/> 
40         </response> 
41         <response status="400"> 
42           <representation mediaType="application/xml" 
43             element="ya:Error"/> 
44         </response> 
45       </method> 
46     </resource> 
47   </resources> 
48 
49 </application>**/

    } else if( exportType === 'API Blueprint') {

        function tabify(body) { 
            var _body = '';
            var lines = body.split('\n');
            for( var i = 0; i < lines.length; i++ ) {
                _body += '        ' + lines[i] + '\n';
            }

            return _body;
        }

        ex += "FORMAT: 1A\n"
        ex = ex + "\n" + "# " + projectName + "\n"
        ex = projectDescription.length > 0 ? (ex + "\n" + projectDescription) : ex;

        ex += "\n";

        for( var i = 0; i < states.length; i++ ) {
            var state = states[i];

            ex = ex + "\n" + "# " + state.get('name') + " [/" + state.get('url') + "]";
			//ex = state.get('description').length > 0 ? (ex + "\n" + state.get('description')) : ex;

            ex += "\n\n";

            ex += "## Read Collection [GET]\n\n";
            ex += "+ Response 200 (application/vnd.collection+json)\n\n";
            ex += tabify(state.get('responses').primary);
            ex += "\n\n";
            
            ex += "## Add Item [POST]\n\n";
            ex += "+ Response 201 (application/vnd.collection+json)\n\n";
            ex += "\n\n";
            
            ex += "## Delete Item [DELETE]\n\n";
            ex += "+ Response 200 (application/vnd.collection+json)\n\n";
            ex += "\n\n";
            
            ex += "## Update Item [PUT]\n\n";
            ex += "+ Response 200 (application/vnd.collection+json)\n\n";
            ex += "\n\n";
        }
    }
    
    return ex;
}

function createBody(hyperNode) {
    // Create an empty body
    var CJBody = {};
    CJBody.collection = {};
    CJBody.collection.version = "1.0";
    CJBody.collection.href = hyperNode.get('url');
    CJBody.collection.items = [];
    CJBody.collection.links = [];
    CJBody.collection.queries = [];
    CJBody.collection.template = {};

    return CJBody;

}

function create(hyperNode, store) {
    
    var promise = new Ember.RSVP.Promise(function(resolve, reject) {
    
        var CJBody = createBody(hyperNode);
        hyperNode.set('body', JSON.stringify(CJBody, null, '    ') );

    // Create a CREATE item response node automatically
        /*
    var CJBody = createBody(hyperNode);
    var name = 'Create ' + hyperNode.get('name');
    var createResponseNode = store.createRecord('hypernode',
    {
        sketch: hyperNode.get('sketch'),
        name: name,
        contentType: '',
        url: '$(' + name + ')',
        body: '',
        method: 'POST',
        statusCode: '201'
    });

    createResponseNode.save().then(function(savedNode) {
        console.log(savedNode);
        console.log(savedNode.id);
        hyperNode.set('body', JSON.stringify(CJBody, null, '    ') );
        var transitions = hyperNode.get('transitions');
        console.log(transitions);
        if( !transitions ) { transitions = []; }
        transitions.push( { target: savedNode.id } );
        console.log(transitions);
        hyperNode.set('transitions', transitions);
        console.log(hyperNode.get('transitions'));
        console.log(hyperNode);
        resolve(hyperNode);
    });*/
        
});
    return promise;
            
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
    createBody: function(hyperNode) {
        return createBody(hyperNode);
    },
    generate: function(hyperNode, store) {
        return create(hyperNode, store);
    },
    parse: function(doc, states, source) {
        parse(doc, states, source);
    },
    exportModel: function( exportType, states, name, description ) {
        return exportModel(exportType, states, name, description );
    },

    name: 'Collection+JSON',
    contentType: 'application/vnd.collection+json',
    keywords: ['collection','items','data','href','version','template','name','value']
}
}());
