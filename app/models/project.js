import DS from "ember-data";
 
var Project = DS.Model.extend({
    name: DS.attr('string'),
    description: DS.attr('string'),
    contentType: DS.attr('string'),
    projectType: DS.attr('string'),
    creationDate: DS.attr('string'),
    simpleVocabulary: DS.attr()
});
  
export default Project;
