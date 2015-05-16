import Ember from "ember";

export default Ember.ObjectController.extend({    
	needs: ['project'],
	projectController: Ember.computed.alias("controllers.project"),
	exportTypes: ['WADL', 'API Blueprint'],
	exportSelection: 'WADL',
	exportData: function() {		
		var project = this.get('projectController').get('model');
        var projectType = project.get('projectType');
		if( projectType === 'CRUD' && this.get('exportSelection') === 'WADL') {			
			this.set('aceMode','ace/mode/xml');
			return CRUDtoWADL(this.get('model').content);
		}else if( projectType === 'CRUD' && this.get('exportSelection') === 'API Blueprint') {
			this.set('aceMode','ace/mode/markdown');
			return CRUDtoBlueprint(project, this.get('model').content);
		}else if( projectType === 'CRUD' && this.get('exportSelection') === 'Swagger') {
			this.set('aceMode','ace/mode/yaml');
			return CRUDtoSwagger(project, this.get('model'));
		}
		else if( project.get('contentType') === CollectionJSON.contentType ) {
            return CollectionJSON.exportModel(this.get('exportSelection'), this.get('model').get('content'), project.get('name'), project.get('description'));
        }else {
			return 'unsupported export type';
		}
	}.property('exportSelection'),
	dirtyExportData: '',
	aceMode: function() {
        var exportSelection = this.get('exportSelection');
        if( exportSelection === 'WADL' ) { this.set('aceMode', 'ace/mode/xml'); }
        else if( exportSelection === 'API Blueprint' ) { this.set('aceMode', 'ace/mode/markdown'); }
        else if( exportSelection === 'Swagger' ) { this.set('aceMode', 'ace/mode/yaml'); }
    }.property('exportSelection'),
	exportSelectionChanged: function() {
	}.observes('exportSelection'),
    actions: {     
	}
});

//TODO: Decide if I want to do this on the server side instead.

/** CRUD to WADL **/
function CRUDtoWADL(resources) {
	console.log(resources);
	
	var wadl = "<?xml version=\"1.0\"?>\n<application xmlns=\"http://wadl.dev.java.net/2009/02\">\n\t<resources base=\"http://{yourserver}/{apiname}/\">\n";

    // parse the resources recursively to build a tree structure in the WADL output
    // create a resource map
	for( var i = 0; i < resources.length; i++ ) {
		var resource = resources[i];

		var id = resource.get('name')
		var path = resource.get('url')
		wadl = wadl + "\t\t<resource path=\"" + path + "\">";
		
		wadl = resource.get('methods').length > 0 ? wadl + '\n' : wadl;		

        for( var j = 0; j < resource.get('methods').length; j++ ) {
        	wadl = wadl + "\t\t\t<method name=\"" + resource.get('methods')[j] + "\"></method>\n";
        }
                
		wadl = resource.get('methods').length > 0 ? wadl + '\t\t' : wadl;
        wadl = wadl + "</resource>\n";
		wadl = i+1 < resources.length ? wadl + '\n' : wadl;
		
	}
	wadl =  wadl + "\t</resources>\n</application>";
	return wadl;	
}

/** CRUD to API Blueprint **/
function CRUDtoBlueprint(project, resources) {
	var blueprint = "";
	var mediaType = project.get('contentType');
	
	//metadata
	
	// API name & overview
	blueprint += "FORMAT: 1A"
	blueprint = blueprint + "\n" + "#" + project.get('name');
	blueprint = project.get('description').length > 0 ? (blueprint + "\n" + project.get('description')) : blueprint;
	
	blueprint = blueprint + "\n";
	
	for( var i = 0; i < resources.length; i++ ) {
            var resource = resources[i];
		
            blueprint = blueprint + "\n" + "#" + resource.get('name') + " [" + resource.get('url') + "]";
			blueprint = resource.get('description').length > 0 ? (blueprint + "\n" + resource.get('description')) : blueprint;
    			
			for( var j = 0; j < resource.get('methods').length; j++ ) {
                blueprint = blueprint + "\n\n" + "## description [" + resource.get('methods')[j] + "]";
				blueprint += "\n+ Response 200 ("+mediaType+")\n";
				blueprint += "    + Body\n\n";
				for( var k = 0; k < resource.get('responses').length; k++ ) {
					if( resource.get('responses')[k].name === resource.get('methods')[j] ) {
						blueprint += resource.get('responses')[k].body;
					}
				}
				
            }
			blueprint = blueprint + "\n";
		
			// TODO: represent transitions as links within the sample response (similar to how they are shown in the tool)
			
     }
	
	return blueprint;
}


/** CRUD to Swagger 1.2 **/
function CRUDtoSwagger(project, resources) {
	var swagger = '';
	
	swagger += 'swagger: "1.2"\n';
	swagger += 'info:\n';
	swagger += '  title: ' + project.name +'\n';
	swagger = project.description.length > 0 ? swagger + '  description: ' + project.description +'\n' : swagger;
	swagger += '  version: "0"\n';
	
	swagger += 'produces:\n  - ' + project.contentType + '\n';
	
	swagger += 'paths:\n';
	
	
	for( var i = 0; i < resources.length; i++ ) {
		var resource = resources[i];
		
		swagger += '  ' + resource.url + ':\n';
	}
	
	return swagger;
	
}
