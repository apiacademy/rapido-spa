import DS from "ember-data";
 
var Map = DS.Model.extend({
    project: DS.attr(),
    name: DS.attr('string'),
    description: DS.attr('string'),
    steps: DS.attr()
});

export default Map;
