import DS from "ember-data";
 
var Sketch = DS.Model.extend({
    name: DS.attr('string'),
    description: DS.attr('string'),
    contentType: DS.attr('string')
});
  
export default Sketch;
