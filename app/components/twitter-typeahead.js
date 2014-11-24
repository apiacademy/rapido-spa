/* global Bloodhound */

import Ember from "ember";

export default Ember.TextField.extend({	
    didInsertElement: function() {		
        var data = this.get('data');						
		// Just in case a data parameter was not passed or it is null, create an empty list
		if( !data ) { 
			data = []; 
		}		
		
		// Copy and paste from twitter typeahead example page:
		var bhData = new Bloodhound({
		  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
		  queryTokenizer: Bloodhound.tokenizers.whitespace,
		  local: $.map(data, function(datum) { return { value: datum }; })
		});
		
		// kicks off the loading/processing of `local` and `prefetch`
		bhData.initialize();
 
		//var selector = "#" + this.elementId + " .typeahead";
		var selector = "#" + this.elementId;
		
		$(selector).typeahead({
		  hint: true,
		  highlight: true,
		  minLength: 1
		},
		{
		  name: 'bhData',
		  displayKey: 'value',
		  // `ttAdapter` wraps the suggestion engine in an adapter that
		  // is compatible with the typeahead jQuery plugin
		  source: bhData.ttAdapter()
		});		
    }
});