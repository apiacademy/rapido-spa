import DS from "ember-data";
 
var alps = DS.Model.extend({
    name: DS.attr('string'),
    description: DS.attr('string'),
    contentType: DS.attr('string'),
    source: DS.attr('string'),
    json: DS.attr()
});
  
export default alps;
