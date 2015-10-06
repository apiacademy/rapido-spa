import DS from "ember-data";
 
var Crudnode = DS.Model.extend({
    sketch: DS.attr(),
    name: DS.attr('string'),
    description: DS.attr('string'),
    url: DS.attr('string'),
    methods: DS.attr(),
    responses: DS.attr(),
    parent: DS.attr(),
    children: DS.attr(),
    class: DS.attr('string')
});
  
export default Crudnode;
