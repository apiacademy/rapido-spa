import DS from "ember-data";
 
var State = DS.Model.extend({
    project: DS.attr('string'),
    name: DS.attr('string'),
    description: DS.attr('string'),
    url: DS.attr('string'),
    transitions: DS.attr(),
    responses: DS.attr(),
    x: DS.attr(),
    y: DS.attr()
});

//responses: a hash object of responses.  Using a hash for future extensions.  Use the key 'primary' for now.
  
export default State;
