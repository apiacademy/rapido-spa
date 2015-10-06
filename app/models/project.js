import DS from "ember-data";
 
var Project = DS.Model.extend({
    project: DS.attr('string'),
    name: DS.attr('string'),
    hostname: DS.attr('string'),
    activeSketch: DS.attr('string'),
    description: DS.attr('string'),
    contentType: DS.attr('string'),
    projectType: DS.attr('string'),
    creationDate: DS.attr('string'),
    simpleVocabulary: DS.attr(),
    alps: DS.attr(),
    sketchThumbnails: DS.attr()
});
  
export default Project;
