/** 
Functions for building and modifying standardized response bodies

A response generator should support the following event hooks:

created(resource)
parse(responseBody)
transitionAttached(transition)
transitionRemoved(transition)
contentChanged(resource)
toString()

**/

//TODO: Make this more generic.  Have it support a media type string as the key and call the appropriate media type handler.

var HALResponse = (function (){
    
var HAL = null;
    
function generateBody(resource, resourceList) {
    // Create a new response body based on this new resource
    HAL = {};
    
    var links = {};
    
    links['self'] = {'href': '$(' + resource.name + ')'}
    
    /*
    for( var i = 0; resource.transitions != null && i < resource.transitions.length; i++ ) {
        var transition = resource.transitions[i];
        var rel = transition.title;
        rel = rel.replace(' ', '_');
        // TODO: We should maintain a resource hash to avoid iterating
        var target = transition.target;
        var targetState = resourceList.findBy('id',target);    
        // TOD: convert spaces to _ so that the title is still a valid rel
        links[rel] = {'href': '$(' + targetState.name + ')'}
    }*/
    
    HAL['_links'] = links;
    console.log(HAL);
    return HAL;
}

function addTransition(transition, source, states, userInput) {
    console.log('addTransition HAL');
    // update an existing body with a new transition
    var body = source.response;
    HALBody = JSON.parse(body);
            
    var rel = transition.title.replace(' ', '_');
    var target = '';
    for( var i = 0; i < states.length; i++ ) {
        if( states[i].id === transition.target ) {
            target = '$(' + states[i].name + ')';    
        }
    }    
    HALBody._links[rel] = { 'href' : target };            
    
    source.response = JSON.stringify(HALBody, null, '\t');    
}

function transitionRemoved(HAL, transition) {
    // update an existing body by removing a transition/link
    if( HAL != null ) {
        delete HAL[transition.title.replace(' ', '_')];
    }
}

// Returns a list of transitions for this resource with the title as the key
function parseBody(body) {
    
    console.log('parseBody');
    
    HALBody = JSON.parse(body);
    var HALLinks = {};
    
    //console.log(HALBody);
    if( HALBody != null && HALBody._links != null ) {
        for( var rel in HALBody._links ) {
            console.log(rel);
            var href = HALBody._links[rel].href;            
            console.log(href);
            if( rel != 'self' && href != null && href.indexOf('$[') === 0 ) {
                console.log('adding link');
                
                var transition = {
                    title: rel,
                    description: '',
                    contentType: '',
                    url: href.substring(2, href.length-1),
                    method: 'GET'
                }
                
                // TODO: parse HREF and look for $() tokens.  If we find this we know that we need to manage a transition.
                // If the href doesn't contain tokens, we ignore it.                
                HALLinks[rel] = transition;
            }
        }
    }
    
    console.log(HALLinks);
    return HALLinks;
    
}
    
return {
    generateBody: function(resource, resourceList) {
        return generateBody(resource, resourceList);
    },
    addTransition: function(transition, source, states, userInput) {
        return addTransition( transition, source, states, userInput );
    },
    getTransitionQuestion: function(source, targetId, collection) {
        return '';
    }
    /*
    parse: function(responseBody) {
        return parseBody(responseBody);
    },
    transitionAttached: function(responseBody, transition) {
        return transitionAttached(responseBody, transition);
    },
    transitionRemoved: function(responseBody, transition) {
        return transitionRemoved(transition);
    },
    contentChanged: function(resource) {
    },
    toString: function() {
    }
    */
}
}());
