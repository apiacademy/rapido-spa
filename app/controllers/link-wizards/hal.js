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

    wizardTitle: 'Add a HAL response',

    nodeChanged: function() {
        // Reset defaults when a new state is selected
        this.send('resetWizard');
    }.observes('nodeController.model', 'nodeController'),

    nodeName : function() {
        return this.get('nodeController').model.get('name');
    }.property('nodeController.model'),

    // New Resource Wizard Properties
    newNodeName: '',
    newNodeContentType: 'application/hal+json',
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
    link_nodename: '',
    link_prefix: '',
    link_suffix: '',
    link_url: '',
    link_rel: '',
    link_name: '',
    link_templated: false,
    link_title: '',
    link_deprecation: '',
    link_profile: '',
    link_hreflang: '',

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

    nameUpdated: function() {
        console.log('link_nodename has been updated.');
        // Update the href field based on the name value 
        var href = '/' + encodeURI(this.get('link_nodename'));
        this.set('link_prefix', href);
        var url = this.get('link_prefix') + this.get('link_suffix');
        this.set('link_url', url);
    }.observes('link_nodename'),

    suffixUpdated: function() {
        var url = this.get('link_prefix') + this.get('link_suffix');
        this.set('link_url', url);
    }.observes('link_suffix'),



    // Wizard state variables (used by the template to determine which modal screen to show)

    wizard_root: function() { if(this.get('wizardState') === 'root') { return true; } else { return false; } }.property('wizardState'),
    wizard_start: function() { if(this.get('wizardState') === 'start') { return true; } else { return false; } }.property('wizardState'),
    wizard_createLink: function() { if(this.get('wizardState') === 'createLink') { return true; } else { return false; } }.property('wizardState'),

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
                this.set('wizardState', 'createLink');
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

           var url = '$(' + this.get('newNodeName') + ')';

           // Create a new node with basic details
           var newNode = this.store.createRecord('hypernode', 
                   { sketch: sketchId, 
                     name: this.get('newNodeName'),
                     contentType: this.get('newNodeContentType'),
                     url: url,
                     body: '',
                     method: 'GET' });
           var body = HAL.createBody(newNode);
           body._links.self = { href: url };
           newNode.set('body', JSON.stringify(body, null, '    '));
           newNode.save().then(function(savedNode) { 
               // Close the modal
               $('#transitionModal').modal('hide');
               
               // Refresh the data model and transition the user back to the graph
               controller.send('modelUpdated');
               controller.transitionToRoute('project.sketch.graph', controller.get('projectController').model.id, sketchId);
           });
           
       },

       createLink_finish: function() {
           var controller = this;
           
           var link_url = this.get('link_url'); 
           var link_rel = this.get('link_rel'); 
           var link_name = this.get('link_name'); 
           var link_title = this.get('link_title'); 
           var link_profile = this.get('link_profile'); 
           var link_hreflang = this.get('link_hreflang'); 
           var link_templated = this.get('link_templated'); 
           var sketchId = this.get('sketchController').model.id;  
           var sourceNode = this.get('nodeController').model;


           function addLink(href, HALDoc) {
               var newLink = {};
               newLink.href = href;
               if( link_templated ) { newLink.templated = true; }
               if( !HALDoc._links ) { HALDoc._links = {}; }
               HALDoc._links[link_rel] = newLink;
               return HALDoc;
           }


           if( link_url.indexOf('://') > 0 ) {
               // This is a link to an external resource
               var HALDoc = JSON.parse(sourceNode.get('body'));
               addLink(link_url, HALDoc);
               sourceNode.set('body', JSON.stringify(HALDoc, null, '    '));
               sourceNode.save();
           } else if( link_url.substr(0,2) === '$(' ) {
               // This is a link to an existing hypernode
               
               // Get the id of the node we are linking to
               var nodes = this.get('graphController').get('model').content;

               var targetNode = null;
               
               for( var i =  0; i < nodes.length; i ++ ) {
                   var name = link_url.trim().substr(2, link_url.length-3);
                   if( nodes[i].get('name') === name ) {
                       targetNode = nodes[i];
                       break;
                   }
               }

               if( !targetNode ) {
                   throw new Error('Unable to locate target node');
               }

               // Update the HAL body with a new link
               var HALDoc = JSON.parse(sourceNode.get('body'));
               addLink(link_url, HALDoc)
               sourceNode.set('body', JSON.stringify(HALDoc, null, '    '));
               
               // Add a transition
               var transitions = sourceNode.get('transitions');
               if( !transitions ) { transitions = [] }
               transitions.push( { target: targetNode.id } );
               sourceNode.set('transitions', transitions);
               sourceNode.save();


           } else {
               // Create a new hypernode and link to it
               var linkResultNode = this.store.createRecord('hypernode',
                   {
                       sketch: sketchId,
                       name: this.get('link_url'),
                       contentType: HAL.contentType,
                       url: '$(' + link_url + ')',
                       body: '',
                       method: 'GET',
                       statusCode: '200'
                   }
               );
               var body = HAL.createBody(linkResultNode);
               body._links.self = { href: '$(' + link_url + ')' };
               linkResultNode.set('body', JSON.stringify(body, null, '    '));
               linkResultNode.save().then(function(savedNode) {
                   var HALDoc = JSON.parse(sourceNode.get('body'));
                   addLink('$(' + link_url + ')', HALDoc);
                   sourceNode.set('body', JSON.stringify(HALDoc, null, '    '));
                   
                   // Add a new transition
                   var transitions = sourceNode.get('transitions');
                   if( !transitions ) { transitions = [] }
                   transitions.push( { target: savedNode.id } );
                   sourceNode.set('transitions', transitions);

                   sourceNode.save();
               });
           }

           // Close the modal
           $('#transitionModal').modal('hide');
           
           // Refresh the data model and transition the user back to the graph
           controller.send('modelUpdated');
           controller.transitionToRoute('project.sketch.graph', controller.get('projectController').model.id, sketchId);

           return;

       }
    }
});


