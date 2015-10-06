/** 
Functions for building and modifying standardized response bodies

A response generator should support the following event hooks:

**/

var HAL = (function (){

function createBody(node) {
    return {
        _links: {}
    };
}

function validate(doc) {
}

return {    
    name: 'HAL',
    contentType: 'application/hal+json',
    createBody: function(node) {
        return createBody(node);
    },
    validate: function(doc) {
        return validate(doc);
    }
}
}());
