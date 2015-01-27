import Ember from "ember";

export default Ember.ArrayController.extend({    
    newProjectName: '',   
    newProjectDescription: '',
    newProjectHostname: '',
    updateHostname: function() {
        var name = this.get('newProjectName');
        this.set('newProjectHostname', name.trim().replace(/\s/g,'-'));
    }.observes('newProjectName'),        
    selectedProjectType: 'CRUD',
	selectedMediaType: 'application/json',
	projectTypes: [
		{name: "CRUD", id: "CRUD"},
		{name: "Hypermedia", id: "hypermedia"},
	],
  mediaTypes: function() {
      var mediaTypeList = [{name: "application/json", id: "application/json"}];
      if( this.get('selectedProjectType') === 'hypermedia' ) {
          mediaTypeList.push({name: "application/hal+json", id: "application/hal+json"});
          mediaTypeList.push({name: "application/vnd.collection+json", id: "application/vnd.collection+json"});
      }
      return mediaTypeList;
  }.property('selectedProjectType'),
    
    actions: {
        createProject: function() {
            console.log(this.get('newProjectHostname'));
            var newProject = this.store.createRecord('project', {
				name: this.get('newProjectName'),
                description: this.get('newProjectDescription'),
                hostname: this.get('newProjectHostname'),
				projectType: this.get('selectedProjectType'),
                contentType: this.get('selectedMediaType'),
                templates: [{'name': 'default', 'body': '{\n}'}]
			});

            newProject.save();
        }
    }
});
