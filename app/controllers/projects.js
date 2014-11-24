import Ember from "ember";

export default Ember.ArrayController.extend({    
    newProjectName: '',   
    newProjectDescription: '',
    newProjectHostname: '',        
    selectedProjectType: 'CRUD',
	selectedMediaType: 'application/json',
	projectTypes: [
		{name: "CRUD", id: "CRUD"},
		{name: "Hypermedia", id: "hypermedia"},
	],
  mediaTypes: [
    {name: "application/json", id: "application/json"},
    {name: "application/hal+json", id: "application/hal+json"},   
    {name: "application/vnd.collection+json", id: "application/vnd.collection+json"}      
  ],
    
    actions: {
        createProject: function() {
            console.log(this.get('selectedMediaType'));
            var newProject = this.store.createRecord('project', {
				name: this.get('newProjectName'),
                description: this.get('newProjectDescription'),
                hostname: this.get('newProjectHostname'),
				projectType: this.get('selectedProjectType'),
                contentType: this.get('selectedMediaType')
			});
console.log(newProject);
		newProject.save();
        	/**
            var project = App.ProjectModel.create({
                name: this.get('newProjectName'),
                description: this.get('newProjectDescription'),
                hostname: this.get('newProjectHostname'),
				projectType: this.get('selectedProjectType'),
                contentType: this.get('selectedMediaType')
            });
            console.log(project);
            var controller = this;        
            **/
			            
			
        }
    }
});
