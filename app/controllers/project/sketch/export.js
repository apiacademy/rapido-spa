import Ember from "ember";

export default Ember.Controller.extend({    
	needs: ['project'],
	projectController: Ember.computed.alias("controllers.project"),
	exportTypes: ['API Blueprint'],
    //exportSelection: 'WADL',
    exportSelection: 'API Blueprint',
	exportData: function() {		
        console.log('exportData');
		var project = this.get('projectController').get('model');
        console.log(project);

        var exportSelection = this.get('exportSelection');
        var resources = this.get('model').get('content');

        if( exportSelection === 'WADL' ) {
			this.set('aceMode','ace/mode/xml');
            console.log(resources);
			return toWADL(resources);
        }else if( exportSelection === 'API Blueprint' ) {
			//this.set('aceMode','ace/mode/markdown');
            return toBlueprint(project, resources);
        }
    }.property('exportSelection'),
    actions: {
        download: function() {
            return this.fileSaver.save(
            JSON.stringify(this.get("model")),
            "application/json",
            this.get("suggestedFilename")
            );
        }
     }
});

function toBlueprint(project, resources) {

    var blueprint = "";
    
	// API name & overview
	blueprint += "FORMAT: 1A"
	blueprint = blueprint + "\n" + "#" + project.get('name');
	blueprint = project.get('description').length > 0 ? (blueprint + "\n" + project.get('description')) : blueprint;
	
	blueprint = blueprint + "\n";
	
    for( var i = 0; i < resources.length; i++ ) {
        var resource = resources[i];

        var url = resource.get('url').substr(0,2) === '$(' ? '/' + resource.get('url') : resource.get('url');

        if( resource.get('nodeClass') === 'node' ) {
            blueprint = blueprint + "\n" + "#" + resource.get('name') + " [" + url + "]";
            blueprint = resource.get('description') ? (blueprint + "\n" + resource.get('description')) : blueprint;
            blueprint = blueprint + "\n\n" + "## description [" + resource.get('method') + "]";
            blueprint += "\n+ Response 200 ("+resource.get('contentType')+")\n";
            blueprint += "    + Body\n\n";
            blueprint += resource.get('body');
			blueprint = blueprint + "\n";
        }
    }

    return blueprint;
}

/** CRUD to WADL **/
function toWADL(resources) {
	
    var wadl = "<?xml version=\"1.0\"?>\n<application xmlns=\"http://wadl.dev.java.net/2009/02\">\n\t<resources base=\"http://{yourserver}/{apiname}/\">\n";

    function serializeNode(node) {
		var id = resource.get('name')
		var path = resource.get('url')
        
        // Only export nodes
        if( resource.get('nodeClass') === 'node' ) {
            wadl = wadl + "\t\t<resource path=\"" + path + "\">\n";
            wadl = wadl + "\t\t\t<method name=\"" + resource.get('method') + "\">\n";
            wadl = wadl + "\t\t\t\t<representation mediaType=\"" + resource.get('contentType') + "\"/>\n";
            wadl = wadl + "\t\t\t</method>\n";
            wadl = wadl + "\t\t</resource>\n";
        }
    }
	

    // parse the resources recursively to build a tree structure in the WADL output
    // create a resource map
	for( var i = 0; i < resources.length; i++ ) {
		var resource = resources[i];


        serializeNode(resource);

        /*
		
		wadl = resource.get('methods').length > 0 ? wadl + '\n' : wadl;		

        for( var j = 0; j < resource.get('methods').length; j++ ) {
        	wadl = wadl + "\t\t\t<method name=\"" + resource.get('methods')[j] + "\"></method>\n";
        }
                
		wadl = resource.get('methods').length > 0 ? wadl + '\t\t' : wadl;
		wadl = i+1 < resources.length ? wadl + '\n' : wadl;
        */
		
	}
	wadl =  wadl + "\t</resources>\n</application>";
	return wadl;	
}


