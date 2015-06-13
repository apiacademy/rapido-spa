import DS from "ember-data";
 
var NodeCollection = DS.Model.extend({
    sketch: DS.attr('string'),
    nodes: [] 
});

export default NodeCollection;

