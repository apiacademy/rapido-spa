import DS from "ember-data";
 
var Sketch = DS.Model.extend({
    project: DS.attr(),
    name: DS.attr('string'),
    description: DS.attr('string'),
    contentType: DS.attr('string'),
    zoom: DS.attr('string'),
    rootNodeX: DS.attr('string'),
    rootNodeY: DS.attr('string')
});
  
export default Sketch;
