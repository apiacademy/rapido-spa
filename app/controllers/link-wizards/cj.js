import Ember from "ember";

export default Ember.Controller.extend({
    needs: ['project', 'project/sketch', 'project/sketch/graph', 'project/sketch/graph/hypernode'],
    projectController: Ember.computed.alias('controllers.project'),
    sketchController: Ember.computed.alias('controllers.project/sketch'),
    nodeController: Ember.computed.alias('controllers.project/sketch/graph/hypernode'),
    graphController: Ember.computed.alias('controllers.project/sketch/graph'),

    // General wizard properties and helpers
    init: function() {
        this.send('resetWizard');
    },

    wizardTitle: 'Add a Collection+JSON Property',

    nodeChanged: function() {
        // Reset defaults when a new state is selected
        this.send('resetWizard');
    }.observes('nodeController.model', 'nodeController'),

    nodeName : function() {
        return this.get('nodeController').model.get('name');
    }.property('nodeController.model'),

    // New Resource Wizard Properties
    newNodeName: '',
    newNodeContentType: 'application/vnd.collection+json',
    contentTypes: ['application/vnd.collection+json','application/hal+json'],
    knownContentTypeHelp : '',

    // New Resource Wizard Helpers
    knownContentType: function() {
        var contentType = this.get('newNodeContentType');
        if( contentType === 'application/vnd.collection+json' ) {
            this.set('knownContentTypeHelp', 'Creating a Collection+JSON collection response node');
        }else if ( contentType === 'application/hal+json' ) {
            this.set('knownContentTypeHelp', 'Creating a HAL JSON response node');
        }else {
            return false;
        }
        return true;
    }.property('newNodeContentType'), 
    newNodeURI : function() {
        var name = this.get('newNodeName');
        if( name.length > 0 ) {
            return '$(' + name + ')';
        }
        return '';
    }.property('newNodeName'),



    // Link Wizard Properties
    link_url: '',
    link_rel: '',
    link_name: '',
    link_render: '',
    link_prompt: '',
    link_location: -1,

    // Link Wizard Helpers
    nodeNames: function() {
        var nodeNames = [];
        nodeNames.push('http://');
        nodeNames.push('https://');
        nodeNames.push('/');
        var nodes = this.get('graphController').get('model').content;

        //TODO: Add project vocabulary to this list
        for( var i =0; i < nodes.length; i++ ) {
            nodeNames.push('$(' + nodes[i].get('name') + ')');
        }
        return nodeNames;

    }.property('nodeController.model'),
    isLinkValid: function() {
        var linkUrl = this.get('link_url').trim();
        if( linkUrl.length === 0 ) {
            return false;
        }
        if(linkUrl.substr(0,2) === '$(' ) {
            var nodeNames = this.get('nodeNames');
            if( nodeNames.indexOf(linkUrl) > 0 ) {
                return true;
            }else {
                return false;
            }
        }
        return true;

    }.property('link_url'),
    isRelValid: function() {
        return this.get('link_rel').trim().length === 0 ? false : true;
    }.property('link_rel'),
    link_url_class: function() {
        return this.get('isLinkValid') ? '' : 'has-error';
    }.property('link_url'),
    link_rel_class: function() {
        return this.get('isRelValid') ? '' : 'has-error';
    }.property('link_rel'), 
    isLinkBad: function() {
        return !this.get('isLinkValid') || !this.get('isRelValid');
    }.property('link_url', 'link_rel'),
    linkLocationList: function() {
        var list = [{name: 'Collection', index: -1}];
        var collection = JSON.parse(this.get('nodeController').model.get('body')).collection;
        var items = collection.items;
        if( !items ) return list;
        for( var i = 0; i < items.length; i++ ) {
            list.push({name: items[i].href, index: i} );
        }
        return list;
    }.property('nodeController.model'),


    // Query properties
    newQueryName: '',


    // Wizard state variables (used by the template to determine which modal screen to show)

    wizard_root: function() { if(this.get('wizardState') === 'root') { return true; } else { return false; } }.property('wizardState'),
    wizard_start: function() { if(this.get('wizardState') === 'start') { return true; } else { return false; } }.property('wizardState'),
    wizard_createItem: function() { if(this.get('wizardState') === 'createItem') { return true; } else { return false; } }.property('wizardState'),
    wizard_createLink: function() { if(this.get('wizardState') === 'createLink') { return true; } else { return false; } }.property('wizardState'),
    wizard_defineLink: function() { if(this.get('wizardState') === 'defineLink') { return true; } else { return false; } }.property('wizardState'),
    wizard_createQuery: function() { if(this.get('wizardState') === 'createQuery') { return true; } else { return false; } }.property('wizardState'),
    wizard_createTemplate: function() { if(this.get('wizardState') === 'createTemplate') { return true; } else { return false; } }.property('wizardState'),

    wizardState: 'root',
    wizardStackPush: function() { this.get('wizardStack').push(this.get('wizardState')); }.observes('wizardState'),
    wizardStack: [],

    actions: {

       resetWizard: function() {
            // Reset defaults when a new state is selected
            var node = this.get('nodeController').get('model');
            
            // If this is a link for the root node, set the wizardState to root.
            if( !node ) {
                this.set('wizardState', 'root');
            }else {
                this.set('wizardState', 'start');
            }
            
            this.set('newNodeName', '');
            this.set('prompt', '');
            this.set('rel', '');
            this.set('url', '');
        },

       createNewNode: function() {
           // Create a new root collection
           var sketchId = this.get('sketchController').model.id;  
           var contentType = this.get('newNodeContentType');
           var controller = this;

           // Create a new node with basic details
           var newNode = this.store.createRecord('hypernode', 
                   { sketch: sketchId, 
                     name: this.get('newNodeName'),
                     contentType: this.get('newNodeContentType'),
                     url: '$(' + this.get('newNodeName') + ')',
                     body: '',
                     method: 'GET' });
           var body = CollectionJSON.createBody(newNode);
           newNode.set('body', JSON.stringify(body, null, '    '));

           newNode.save().then(function(savedNode) { 
               // Close the modal
               $('#transitionModal').modal('hide');
               
               // Refresh the data model and transition the user back to the graph
               controller.send('modelUpdated');
               controller.transitionToRoute('project.sketch.graph', controller.get('projectController').model.id, sketchId);
           });
           
       },
       createItem: function() {
           this.set('wizardState', 'createItem');
       },
       createItem_finish:  function() {

           // Collection JSON has implicit behvaiour for items:  All items can be read, deleted and updated.
           // This is modeled in Rapido by grouping the read, delete and update responses within a single item node.
           // We need to first create the read, delte and update nodes, followed by the item node group that owns them
           // and finally attach that item group to the original collection node.
          
           var controller = this; 
           var sketchId = this.get('sketchController').model.id;  
           //TODO: make this URL safe 
           var itemUrl = '$(' + this.get('newNodeName') + ')';

           var newNodes= [
           {
               name: 'Read ' + this.get('newNodeName'),
               contentType: 'application/vnd.collection+json',
               url: itemUrl,
               body: '',
               method: 'GET' ,
               statusCode: '200',
               tags: [{label: 'READ', className: 'CJ.read'}]
           },
           {
               name: 'Update ' + this.get('newNodeName'),
               contentType: 'application/vnd.collection+json',
               url: itemUrl,
               body: '',
               method: 'PUT',
               statusCode: '200',
               tags: [{label: 'UPDATE', className: 'CJ.update'}]
           },
           {
               name: 'Delete ' + this.get('newNodeName'),
               contentType: '',
               url: itemUrl,
               body: '',
               method: 'DELETE',
               statusCode: '204',
               tags: [{label: 'DELETE', className: 'CJ.delete'}]
           }
           ];


           // Create an array of promises so we can create all of these nodes before
           // processing the results.
           var promiseArray = [];
           for( var i = 0; i < newNodes.length; i++ ) {
               var node = newNodes[i];
               var newNode = this.store.createRecord('hypernode',
               {
                    sketch: sketchId,
                    name: node.name,
                    statusCode : node.statusCode,
                    contentType: node.contentType,
                    url: node.url,
                    body: node.body,
                    method: node.method
               });
               if( node.contentType === CollectionJSON.contentType ) {
                   var body = CollectionJSON.createBody(newNode);
                   newNode.set('body', JSON.stringify(body, null, '    '));
               }
               promiseArray.push(newNode.save());
           }


           Ember.RSVP.all(promiseArray).then(function(results) {

               // Create the item node group
               var itemNode = controller.store.createRecord('hypernode', 
                   {
                       sketch: sketchId,
                       name: controller.get('newNodeName'),
                       statusCode: '',
                       contentType: '',
                       url: itemUrl,
                       body: '',
                       nodeClass : 'group',
                       method: 'GET'
                   });

               var transitions = [];
               for( var i = 0; i < results.length; i++ ) {
                   transitions.push({ target: results[i].id });
               }
               itemNode.set('transitions', transitions);

               return itemNode.save();
           }).then(function(savedNode) {

               var sourceNode = controller.get('nodeController').model;
               var body = sourceNode.get('body');
               if( !body || body.length === 0 ) { 
                   body = '{ "collection": {} }';
               }
               var sourceCJ = JSON.parse(body);
               if( !sourceCJ.collection.items ) { sourceCJ.collection.items = []; }
               var transitions = sourceNode.get('transitions');
              
               // Although there are four new nodes, we only want to insert one item into the body 
               // CJ implicitely supports all four transitions from a single item entry.
               var itemUrl = savedNode.get('url');
               var newItem = { href: itemUrl, data: [], links: [] };
               sourceCJ.collection.items.push(newItem);
               sourceNode.set('body', JSON.stringify(sourceCJ, null, '    ') );

               transitions.push({target: savedNode.id});
               
               sourceNode.save();
           });

           // Close the modal
           $('#transitionModal').modal('hide');
           
           // Refresh the data model and transition the user back to the graph
           controller.send('modelUpdated');
           controller.transitionToRoute('project.sketch.graph', controller.get('projectController').model.id, sketchId);

       },


       // Create Link Wizard
       createLink: function() {
           // If this colleciton+JSON document does not have any items defined, assume that the user wants 
           // to place the link at the collection level.
           var sourceNode = this.get('nodeController').model;
           var sourceCJ = JSON.parse(sourceNode.get('body'));

           if( !sourceCJ.collection.items || sourceCJ.collection.items.length == 0 ) {
               this.set('wizardState', 'defineLink');
               this.set('linkLocationSelection', -1);
           }else {
               this.set('wizardState', 'createLink');
           }

       },
       defineLink: function() {
           this.set('wizardState', 'defineLink');
       },
       createLink_finish: function() {
           // Utility function for inserting links into the body
           var controller = this;
           function insertLink(container, href) {
                   if( !container.links ) { container.links = []; }
                   var link = {
                       href: href,
                       rel: controller.get('link_rel'),
                   }
                   if( controller.get('link_prompt') != '' ) { link.prompt = controller.get('link_prompt') }
                   if( controller.get('link_name') != '' ) { link.name = controller.get('link_name') }
                   if( controller.get('link_render') != '' ) { link.render = controller.get('link_render') }

                   container.links.push(link);
           }


           // Get the source node information ready
           var sourceNode = controller.get('nodeController').model;
           var body = sourceNode.get('body');
           if( !body || body.length === 0 ) { 
               body = '{ "collection": {} }';
           }
           var CJDoc = JSON.parse(body);
          
           var link_url = this.get('link_url'); 
           // Does this link point to an external resource?
           if( link_url.substr(0,4) === 'http' ) {
               // No need to add a transition, just update the body
               var linkLocation = this.get('link_location');

               if( linkLocation < 0 ) {
                   // Insert the link at the collection level
                   insertLink(CJDoc.collection, this.get('link_url'));
               }else {
                   insertLink(CJDoc.collection.items[linkLocation], this.get('link_url'));
               }
               sourceNode.set('body', JSON.stringify(CJDoc, null, '    '));
               sourceNode.save();
               return;
           }

           // Does this link point to an existing node?
           if( link_url.substr(0,2) === '$(' ) {
               console.log('internal link');
               return;

               // Get the ID of the targeted node
           }

           // Otherwise, create a new node for the result of the link
           var sketchId = this.get('sketchController').model.id;  
           var linkResultNode = this.store.createRecord('hypernode',
               {
                   sketch: sketchId,
                   name: this.get('link_url'),
                   contentType: '',
                   url: '$(' + link_url + ')',
                   body: '',
                   method: 'GET',
                   statusCode: '200',
                   tags: [{label: 'LINK', className: 'CJ.delete'}]
               }
           );
           linkResultNode.save().then(function(savedNode) {
               // Update the source node
               var linkLocation = controller.get('link_location');
               var newUrl = '$(' + controller.get('link_url') + ')';

               if( linkLocation < 0 ) {
                   // Insert the link at the collection level
                   insertLink(CJDoc.collection, newUrl);
               }else {
                   insertLink(CJDoc.collection.items[linkLocation], newUrl);
               }
               sourceNode.set('body', JSON.stringify(CJDoc, null, '    '));

               // Add a new transition
               var transitions = sourceNode.get('transitions');
               if( !transitions ) { transitions = [] }
               transitions.push( { target: savedNode.id } );
               sourceNode.set('transitions', transitions);
               
               sourceNode.save();

           });
           
           // Close the modal
           $('#transitionModal').modal('hide');
           
           // Refresh the data model and transition the user back to the graph
           controller.send('modelUpdated');
           controller.transitionToRoute('project.sketch.graph', controller.get('projectController').model.id, sketchId);
       },
       
       
       createQuery: function() {
           // Create a new root collection
           var sketchId = this.get('sketchController').model.id;  
           var contentType = this.get('newNodeContentType');
           var controller = this;

           console.log('createQuery');
           this.set('wizardTitle', 'Add a Query');
           this.set('wizardState', 'createQuery');

           
       },

       createQuery_finish: function() {

           var controller = this;

           var sketchId = this.get('sketchController').model.id;  
           var sourceNode = controller.get('nodeController').model;

           var queryResultNode = this.store.createRecord('hypernode',
               {
                   sketch: sketchId,
                   name: this.get('link_url'),
                   contentType: CollectionJSON.contentType,
                   url: '$(' + this.get('link_url') + ')',
                   body: '',
                   method: 'GET',
                   statusCode: '200'
               }
           );
           
           var body = CollectionJSON.createBody(queryResultNode);
           queryResultNode.set('body',JSON.stringify(body, null, '    ')),
           queryResultNode.save().then(function(savedNode) {
               // Update the source node body
               var CJDoc = JSON.parse(sourceNode.get('body'));
               if (! CJDoc.collection.queries ) { CJDoc.collection.queries = []; }
               var query = {
                   href: savedNode.get('url'),
                   rel: controller.get('link_rel'),
               }
               if( controller.get('link_prompt') != '' ) { query.prompt = controller.get('link_prompt') }
               if( controller.get('link_name') != '' ) { query.name = controller.get('link_name') }
               query.data = [];
               CJDoc.collection.queries.push(query);
               sourceNode.set('body', JSON.stringify(CJDoc, null, '    '));

               // Add a new transition
               var transitions = sourceNode.get('transitions');
               if( !transitions ) { transitions = [] }
               transitions.push( { target: savedNode.id } );
               sourceNode.set('transitions', transitions);
               
               sourceNode.save();
               
               // Close the modal
               $('#transitionModal').modal('hide');
               
               // Refresh the data model and transition the user back to the graph
               controller.send('modelUpdated');
               controller.transitionToRoute('project.sketch.graph', controller.get('projectController').model.id, sketchId);

           });


    
           
       }

    }
});


