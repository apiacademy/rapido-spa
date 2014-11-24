/**
 * @fileoverview Utilities for parsing ALPS documents
 * 
 */
var ALPS = (function() {
        
/************************************************************** 
 * JSON Parsing Routines 
 **************************************************************/

/**
 * Parse a JSON formatted ALPS document.
 * @param {Object} ALPSObject - a JSON ALPS document in javascript object form.
 * @param {function} callback - function({string} error, {Object} descriptorHash, {Array} descriptorTreeArray).
 */
 function readJSON(ALPSObject, callback) {

 	var ALPSRoot = getProperty(ALPSObject, 'alps');
 	
	if( ALPSRoot == null ) {
 		callback('No Root defined');
 		return;		
 	}

	var version = getProperty(ALPSRoot, 'version');		 
 	var descriptor = getProperty(ALPSRoot, 'descriptor'); 	
     
 	// recursively parse the descriptor objects
 	if( !descriptor ) { 		
        callback(null, {});
    }else {
        var descriptors = {};
        
        if(Object.prototype.toString.call( descriptor ).indexOf('Array') < 0 ) {
            callback('JSON descriptor property must be an array');        
        }
        
        var promises = [];
        
        for( var i = 0; i < descriptor.length; i++ ) {
            promises.push(parseJSONDescriptor(descriptor[i]));
        }
        
        RSVP.all(promises).then(function(resolved) {
            console.log(resolved);
            for( var i = 0; i < resolved.length; i++ ) {
                var descriptor = resolved[i];
                descriptors[descriptor.id] = descriptor;
            }
            callback(null, descriptors);
        }, function(error) {
            callback(error);
        });         		
 	}
 } 

/**
 * Recursive function for parsing an array of JSON descriptors
 * @param {Object} JSONdescriptor - The JSON object to parse. 
 */
function parseJSONDescriptor(JSONDescriptor) {        
    
    return new RSVP.Promise(function (resolve, reject) {            
        
        console.log('normalizing');
        var descriptor = normalizeJSON(JSONDescriptor);        
        console.log(descriptor);        
        
        // If this descriptor has a child descriptor, parse the list
        if( !descriptor.descriptor ) {      
            resolve(descriptor);
        } else {
            console.log('has a descriptor');
            if(Object.prototype.toString.call( descriptor.descriptor  ).indexOf('Array') < 0 ) {
                reject('JSON descriptor property must be an array');        
            }
            
            var promises = [];
            
            for( var i = 0; i < descriptor.descriptor.length; i++ ) {
                promises.push(parseJSONDescriptor(descriptor.descriptor[i], descriptor.id));     
            }
            
            var descriptorHash = {};
            var descriptorArray = [];
            
            RSVP.all(promises).then(function(resolvedArray) {          
                for( var i = 0; i < resolvedArray.length; i++ ) {                    
                    var childDescriptor = resolvedArray[i];
                    descriptorArray.push(childDescriptor);
                    descriptorHash[childDescriptor.id] = childDescriptor;
                }
                descriptor.descriptor = descriptorArray;
                descriptor.descriptorHash = descriptorHash;
                resolve(descriptor);
            }, function(error) {
                reject(error);
            });            
        }         
    });
 }
 
/**
 * Converts a raw JSON descriptor into a normalized object.  Incorporates a case-insensitive conversion.
 * @param {Object} JSONdescriptor - The raw JSON object to parse 
 */

function normalizeJSON(JSONdescriptor) {
    var descriptor = {};

	// iterate through the descriptor and store the properties.
	// I'm iterating because of the need for case insensitivity.
	for( var propertyName in JSONdescriptor ) {

			var normalizedPropName = propertyName.toLowerCase();

			if( normalizedPropName === 'descriptor') {
                descriptor.descriptor = JSONdescriptor[propertyName];				
                console.log('descriptor.descriptor:');
                console.log(descriptor.descriptor);
			}

			else if( normalizedPropName === 'name') {
				descriptor.name = JSONdescriptor[propertyName];
			}

			else if( normalizedPropName === 'id') {
				descriptor.id = JSONdescriptor[propertyName];
			}

			else if( normalizedPropName === 'href') {
				// we will deref this link later.. for now just store the property.
				descriptor.href = JSONdescriptor[propertyName]; 				
			}

			else if( normalizedPropName === 'ext') {
				descriptor.ext = JSONdescriptor[propertyName];
			}

			else if( normalizedPropName === 'type') {
				descriptor.type = JSONdescriptor[propertyName];
			}

			else if( normalizedPropName === 'doc') {
				descriptor.doc = JSONdescriptor[propertyName];
			}

		} 	

		return descriptor;	 
 }
 
 function getProperty(obj, propertyName) {
	 for( property in obj) {
		 if( property.toUpperCase() === propertyName.toUpperCase()) return obj[property];
	 }

	 return null;
 }
 
 // A case insensitive search for a named property
 function findProperty(obj, propertyName) {
	 for( property in obj) {
		 if( property.toUpperCase() === propertyName.toUpperCase()) return property;
	 }

	 return null;
 }
    
/************************************************************** 
 * XML Parsing Routines 
 **************************************************************/

/**
 * Converts an ALPS XML document into a descriptor tree.  Returns an object hash of the root descriptors
 * @param {string} ALPSXMLProfile - An XML document string
 * @param {number} depth - the current depth of parsing.  Used to prevent circular references and recursion that is too deep
 */    
function parseXML(ALPSXMLProfile, depth) {    
                        
    console.log('parsing XML Document at depth ' + depth);
    return new RSVP.Promise(function(resolve, reject) {
        var descriptors = {};
        
        // For security we will only go 10 levels deep when parsing ALPS documents
        if( depth > 50 ) { reject ("too deep!"); }
    
        // Parse the XML String and turn into a DOM
        var alpsXml = $.parseXML(ALPSXMLProfile);
        var alpsRoot = alpsXml.firstChild;
        
        // Get promises for each descriptor that we can call asynchronously
        var promises = [];
        for( var index in alpsRoot.childNodes ) {
            if( alpsRoot.childNodes[index].localName === 'descriptor' ) {
                promises.push(parseXMLDescriptorNode(alpsRoot.childNodes[index], depth));
            }
        }        
        
        // Fire off the parsers and wait for all the results to come back
        RSVP.all(promises).then(
            function(resolved) {            
                for( var i = 0; i < resolved.length; i++ ) {
                    //descriptors.push(resolved[i]);
                    descriptors[resolved[i].id] = resolved[i];
                }
                console.log('resolving XML parse');
                resolve(descriptors);
            }, 
            function(error) {
                reject(error);
            }
        );                     
    });        
}
    
function parseXMLDescriptorNode(descriptorNode, depth) {     
    console.log('parsing ' + descriptorNode.getAttribute('id') +'/' + descriptorNode.getAttribute('href'));
    return new RSVP.Promise(function (resolve, reject) {            
        
        // Recurse through the descriptor and convert when complete 
        
        var promises = [];
        
        for( var i = 0; i < descriptorNode.childNodes.length; i++ ) {
            if( descriptorNode.childNodes[i].localName === 'descriptor' ) {  
                promises.push(parseXMLDescriptorNode(descriptorNode.childNodes[i], depth));
            }
        }                
        
        var childDescriptors = [];                        
        
        RSVP.all(promises).then(
            function(resolved) {  
                // Parse any child descriptors
                var childDescriptors = [];
                for( var i = 0; i < resolved.length; i++ ) {
                    var childDescriptor = resolved[i];
                    childDescriptors.push(childDescriptor);
                }
                
                // Parse this descriptor node
                var idAttr = descriptorNode.attributes.getNamedItem("id");
                var hrefAttr = descriptorNode.attributes.getNamedItem("href");
                var typeAttr = descriptorNode.attributes.getNamedItem("type");
                
                var id;
                var descriptor = {};                
                descriptor.childDescriptors = childDescriptors;

                // id attributes are optional in the ALPS spec
                if( idAttr ) { 
                    id = idAttr.nodeValue;
                    descriptor.id = id;
                }
                
                if( !hrefAttr ) {      
                    resolve(descriptor);
                } else {
                    var href = hrefAttr.nodeValue.trim();
                
                /***
                From the spec:
                If 'descriptor' has an 'href' attribute, then 'descriptor' is inheriting all the attributes and sub-properties of the descriptor pointed to by 'href'. When 'descriptor' has a property defined locally, that property value takes precedence over any inherited property value. Since there is no limit to the nesting of elements -- even ones linked remotely -- it is important to process 'all descriptor' chains starting from the bottom to make sure you have collected all the available properties and have established the correct value for each of them.
                **/
                
                    if( href.charAt(0) === '#' ) {
                        // This is a local reference
                        // TODO: Find descriptor in second pass after document has been parsed
                        descriptor.href = hrefAttr;
                        resolve(descriptor);
                    }  else {
                        console.warn('retrieving external ALPS descriptor from ' + hrefAttr.nodeValue);
                        // Look for an anchor
                        var anchorLocation = href.indexOf("#");
                        // This is an external reference that we can't retrieve (due to CORS) so we will ask the backend to do it for us
                        console.log('making external call ' + href);

                        Backend.retrieveExternalALPS(href)
                        .then(function(externalProfile) {
                            return parseXML(externalProfile, depth+1)
                        }).then(function(externalDescriptors) {
                            resolve(descriptor);
                        }, function(error) {
                            reject(error);
                        });
                    }
                }                 
            }, 
            function(error) {
                reject(error);
            });                                    
    });
}

 
 
    
/** public methods **/
return {
    parseJson: function(document, callback) {
        readJSON(document, callback);
    },
    parseXML: function(document, callback) {
        parseXML(document, 0).then(
            function(resolved) {
                console.log('XML Parsing complete.');
                console.log(resolved);
                callback(null, resolved);
            },
            function(error) {
                console.error('XML Parsing failed.');
                console.log(error);
                callback(error);
            }
        );        
    }
}
}());