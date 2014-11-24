/** 
Functions for building and modifying standardized response bodies

A response generator should support the following event hooks:

**/

var CJResponse = (function (){
    
function parseBody(resource) {
    console.log('parseBody');
    var doc = JSON.parse(resource.response);
    console.log(doc);
    if( !doc.collection ) {
        // No collection has been found, so all transitions should be deleted
        console.log('no collection object found!');
        console.log('notifying parent that all transitions have been removed');
        for( var i = 0; i < resource.transitions.length; i++ ) {            
            transitionChanged(resource.transitions[i].target, -1);
        }
    } else {
        console.log('parsing...');
        // Check for links on the collection object
        if( doc.collection.links ) {
            for( var i = 0; i < doc.collection.links.length; i++ ) {
                var link = doc.collection.links[i];
                console.log('found collection link');
                console.log(link.rel);
                console.log(link.href);
            }
        }
        // Look for links in the items
        if( doc.collection.items ) {
            for( var i = 0; i < doc.collection.items.length; i++ ) {
                var item = doc.collection.items[i];
                for( var j = 0; item.links && j < item.links.length; j++ ) {
                    var link = item.links[j];
                    console.log(link.href);
                    console.log(link.rel);
                }
            }
        }
    }
}
    
function generateBody(resource, resourceCollection) {
    var doc = {};    
    doc.collection = {};
    
    
    /*
    for( var i = 0; resource.transitions && i < resource.transitions.length; i++ ) {
        var transition = resource.transitions[i];
        var rel = transition.title;        
        var target = transition.target;
        var targetState = resourceCollection.findBy('id',target);    
        // TOD: convert spaces to _ so that the title is still a valid rel
        links.push({"rel": rel, "href": '$(' + targetState.name + ')'});        
    }
    
    collection["links"] = links;
    */
    
    doc.collection.items = [];
    doc.collection.href = "$(" + resource.name + ")";
        
    return doc;
}
    
function addTransition(transition, resource, resourceCollection, userInput) {
    
    // convert the response body string into an object
    var cjDoc = JSON.parse(resource.response);    
    
    if( !cjDoc.collection ) {
        // This is not a collection JSON object
    }
        
    var newLink = { rel: transition.title, href: transition.url};
    
    if( !userInput || userInput === 'root' ) {
        if( !cjDoc.collection.links ) {
            cjDoc.collection.links = [];
        }
        cjDoc.collection.links.push(newLink);        
        
    }else if( userInput == 'new' ) {
        if( !cjDoc.collection.items ) {
            cjDoc.collection.items = [];
        }
        var links = [];
        links.push(newLink);
        var newItem = { "href" : "?", links: links }
        cjDoc.collection.items.push(newItem);
    }else if( userInput === 'all') {
        for( var i = 0; i < cjDoc.collection.items.length; i++ ) {
            if( !cjDoc.collection.items[i].links ) {
                cjDoc.collection.items[i].links = [];
            }
            cjDoc.collection.items[i].links.push(newLink);
        }
    }else {
        if( !cjDoc.collection.items[userInput].links ) {
            cjDoc.collection.items[userInput].links = [];
        }
        cjDoc.collection.items[userInput].links.push(newLink);
    }
    
    resource.response = JSON.stringify(cjDoc, null, '\t');
}
    
function getTransitionPrompt( source, targetId, collection ) {    
    // only prompt the user if items > 0,  Otherwise just assume the link will be inserted at the collection level.
    console.log(source.response);
    var cjDoc = JSON.parse(source.response);
    if( cjDoc.collection && cjDoc.collection.items && cjDoc.collection.items.length > 0 ) {
        var options = [{id: 'root', label: 'At the Collection Level'}, {id: 'new', label: 'Create New Item'},{id: 'all', label: 'In Every Item'}];
        for( var i = 0 ; i < cjDoc.collection.items.length; i++ ) {
            var item = cjDoc.collection.items[i];
            var label = 'In Item #' + i;
            if( item.href ) {
                label = item.href;
            }
            options.push({id: i, label: label});
        }
        return {
            question: "Where should this link be inserted?",
            options: options
        }
    } else {        
        return { 
            question: "Where should this link be inserted?",
            options: [{id: 'root', label: 'At the Collection Level'}, {id: 'new', label: 'Create New Item'}]
        }
    }
    
}
    
return {    
    generateBody: function(resource, resourceCollection, userPrompt) {
        return generateBody(resource, resourceCollection);
    }, 
    parseBody: function(resource) {
        return parseBody(resource);
    },
    getTransitionQuestion: function(source, targetId, collection) {
        return getTransitionPrompt( source, targetId, collection);
    },
    addTransition: function( transition, source, collection, userInput ) {
        return addTransition( transition, source, collection, userInput );
    },
    contentType: 'application/vnd.collection+json'
}
}());
