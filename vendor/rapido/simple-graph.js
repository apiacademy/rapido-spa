var simpleGraph = (function() {

    // Force graph variables
    var nodes, links, idMap;
    var graphSVG;
    var force;

    // Constants
    var originRadius = 10

    // Zoom Behaviour and Handler 
    var zoomContainer;
    var zoom = 
        d3.behavior.zoom()
        .scaleExtent([-1,10])
        .on("zoom",function () {
          zoomContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")")
        });
    
    /**
     * Transmits events to a callback.  The callback should be handled by an Ember component or controller and is set in the initialization routine
     */
    var eventHandler = function(event, callback) {
        callback('no handler defined');
    }
    
    /**
     * Constructor for the graph.
     */
    function init() {
    
        var canvasWidth = $('#canvas').width();        
        var height = $( window ).height();

        // Setup the force directed graph object
        force = d3.layout.force()
            .charge(-2500)
            .linkDistance(250)
            .size([canvasWidth, height]);
        
        // Allow the user to drag a force layout node into a fixed position
        force.drag()
            .on("dragstart", dragstart)
            .on("dragend", dragend);

        var dragEnabled = false;

        function dragstart(d) {
            d3.event.sourceEvent.stopPropagation();

            // If this node has children, remove the fixed property so they are dragged along with the parent node.
            function unFreeze(node){
                node.fixed = false;
                for( var i = 0; i < node.get('transitions').length; i++ ) {
                    var childNode = idMap[node.get('transitions')[i].target];
                    unFreeze(childNode);
                }
            }
            unFreeze(d);
            d.fixed = true;

            dragEnabled = true;
        }

        function dragend(d) {
            dragEnabled = false;
            freeze(d);
            function freeze(node) {
                // Notify the Ember controller that a node position has moved.  Hopefully the new position data will be saved to the server.
                eventHandler({ type: 'nodeMoved', data: { node: d } }, function(){});                
                d3.select(this).classed("fixed", d.fixed = true);
                node.fixed = true;
                for( var i = 0; i < node.get('transitions').length; i++ ) {
                    var childNode = idMap[node.get('transitions')[i].target];
                    freeze(childNode);
                }
            }

        }

        // Setup zoom and panning container.  All SVG objects should be appended to this container.
        var canvas = graphSVG.append('g').call(zoom);
        zoomContainer = canvas.append('g');

    }


    /**
     * Creates a d3 force graph compatible set of nodes and links from an Ember array of hypernodes.
     * @param {Array} nodeList - An array of hypernode records
     */
    function parseNodeList(nodeList) {

        idMap = {};

        // Create a static root node for the graph, this is the root from which all 'home' response nodes are linked.
        var originNode = {
            id: 'origin',
            nodeType: 'origin',
            transitions: [],
            get: function(propName) {
                return this[propName];
            }
        };

        // Initialize the nodes and links lists
        nodes = [originNode].concat(nodeList);
        links = [];

        // First Pass: Populate the nodes list with parsed Ember record nodes
        idMap[originNode.id] = originNode;
        for( var i = 1; i < nodes.length; i++ ) {
            idMap[nodes[i].get('id')] = nodes[i];
            // Initially mark all nodes as 'orphan' nodes.  Once we begin identifying relationships we will change this designation.
            nodes[i].nodeType = 'orphan';
        }

        // Second Pass : populate the links table by parsing the transitions property of each node
        for( var i = 1; i < nodes.length; i++ ) {
            var node = nodes[i];
            addLinks(node.get('transitions'), idMap[node.get('id')]);
        }

        // Third Pass : look for orphan nodes and link them to the origin node
        var rootTransitions = [];
        for( var i = 1; i < nodes.length; i++ ) {
            var node = nodes[i];
            if( node.nodeType == 'orphan' ) { 
                rootTransitions.push({name: '', methods: ['GET'], target: node.get('id')});
            }
        }
        addLinks(rootTransitions, idMap[originNode.id]);

        // A utility function that stores links between graph nodes.  If a node is found to be the target of a link, its type is changed from
        // 'orphan' to 'linked'.
        function addLinks(transitions, sourceNode) {
            for ( var j = 0; j < transitions.length; j++ ) {
                var transition = transitions[j];
                var targetNode = idMap[transition.target];
                    
                if( targetNode === undefined ) {
                    console.log('warning: transition found that targets a non-existent state: ' + transition.target);
                } else {
                    // Calculate the angle for this transition to be rendered on the state's orbit
                    //var _theta = ((360 / transitions.length) * j) * (Math.PI/180);

                    var link = {
                        source: sourceNode,
                        target: targetNode,
                        //theta: _theta,
                        name: transition.name,
                        numTransitions: node.get('transitions').length
                    };
                    links.push(link);      

                    // Store the calculated angle in this transition object so we can draw the orbiting sphere from the point that the path starts.
                    //transition.theta = _theta;
                    transition.source = sourceNode.get('id');

                    // Change the nodeTypes of the target node to indicate that it is not an orphan
                    targetNode.nodeType = 'linked';
                }
            }        
        }
    }

    
        
    /**
     * Renders the SVG objects for the force graph and starts the force directed simulator.
     * This function should be called whenever the underlying data model has been updated.
     */
    function update() {

        force
          .nodes(nodes)
          .links(links)
          .start();

        // Draw links
        var link = zoomContainer.selectAll(".graph.link")
          .data(links);
        link.enter().append("path")
          .attr("class", "graph link");
        link.exit().remove();

        // Draw nodes
        var node = zoomContainer.selectAll("#node")
          .data(nodes);

        node
            .enter().append("g")
            .attr("id", "node")
            //TODO: fade buttons in and out
            //.on('mouseenter', nodeMouseEnter )
            //.on('mouseleave', function() { console.log('out') } )
            .call(force.drag);
        
        node.exit().remove();

        // Draw a background shape for the node.
        // The shape of the node is dependant on the type of node being drawn.  An SVG path is used
        // to allow for a dynamic shape.
        node.append('path')
            .attr("class", function(d) { return d.nodeType === 'origin' ? 'graph origin' : "graph node"; })
            .attr("d", function(d) { 
                if( d.nodeType === 'origin' ) {
                    return getCirclePath(0, 0, originRadius);
                }else if( d.get('nodeClass') === 'node' ) { 
                    var r = calculateRadius(d.get('transitions').length);
                    return getCirclePath(0, 0, r);
                }else if( d.get('nodeClass') === 'group' ) {
                    return getRectPath(150,50);
                }else {
                    console.warn('unknown nodeClass : ' + d.get('nodeClass'));
                    return '';
                }
            } );

        // Label the node with the name of the hypernode
        node 
            .append("text")
            .attr("x", 0)
            .attr("y", function(d) { return d.nodeType === 'origin' ? 20 : 8; } )
			.attr("text-anchor", "middle")
			.attr("class", "graph node title" )
            .text(function( d ) { return d.get('name'); });    

        // Draw a plus icon button for adding new transitions
        var createLinkButton = node 
            .append('g')
            .attr('style', function(d) { return d.showLinkButton ? 'visibility:hidden' : '' })
            .on('click', function(d) { eventHandler( { type : 'newTransition', data : {sourceId : d.get('id')} }) } )
            .attr('transform', function(d) { return d.nodeType === 'origin' ? 'translate(0,0)' :  'translate(0,40)' } );

        createLinkButton
            .append('circle')
            .attr('r', function(d) { return d.nodeType === 'origin' ? 35 :  25 } )
            .attr('class', 'graph node add-link')

        createLinkButton.append('text')
            .attr('text-anchor', 'middle')
            .text('+')
            .attr('x', 0)
            .attr('y', 5 );

        // Draw an elipses button for activating the popup menu

        var popupButton = node 
            .append('g')
            .attr('transform', 'translate(0,-40)')
            .attr('style', function(d) { return d.nodeType === 'origin' || d.get('nodeClass') === 'group' ? 'visibility:hidden' :  '' } )
            .on('click', function(d) { 
                eventHandler({ type: 'nodeSelected', data: { id: d.get('id') } }, function(){});      
            });

        popupButton
            .append('circle')
            .attr('r', '15')
            .attr('class', 'graph node add-link')

        popupButton.append('text')
            .attr('text-anchor', 'middle')
            .text('...')
            .attr('x', 0)
            .attr('y', 5 );

        // Animation function for the d3 force directed graph
        force.on("tick", function() {

            // draw directed edges with proper padding from node centers
            link.attr('d', function(d) {

                var sourceX = d.source.x;
                var sourceY = d.source.y;
                var targetX = d.target.x;
                var targetY = d.target.y;
                
                return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
            });    

            // move the linked nodes into place
            node.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
        });

    }

    /**
     * Calculate the radius distance for orbitals based on the nubmer of outbound transitions.  
     * As the transitions grow so should the size of the node circle.
     */
    function calculateRadius(numTransitions) {
        return 80 + 4 * numTransitions;
    }

    /**
     * Called when a node is clicked.  
     */
    function nodeClicked(d,i) {
    }

    
    /**
     * Called when the popup menu botton is clicked.  
     */
    function popupMenuClicked(d,i) {
        // Render a popup menu for the node 
		var popupId = '#node-popup' + i;
        // Hide all the popup menus in case there is already one that is open
		d3.selectAll('.graph.node.popup').attr('visibility', 'hidden');
        // Make this popup menu visible
		d3.select(popupId).attr('visibility', 'visible');
    }

    /**
     * Called when the mouse cursor enters a graph node  
     */
    function nodeMouseEnter(d,i) {
		var buttonClassId = 'node-buttons-' + i;
        //TODO: Implement fade-in and fade-out logic for buttons on the node
    }


    /**
     *  Generates a circle for a node by using SVG path statements.
     *  The circle is generated by drawing two arcs.
     */
    function getCirclePath(cx, cy, r) {
       var path = "M " + cx + ', ' + cy;
       path = path + " m -" + r + ", 0";
       path = path + " a " + r + "," + r + " 0 1,0 " + r*2 + ", 0";
       path = path + " a " + r + "," + r + " 0 1,0 " + -(r*2) + ", 0";
       return path;
    }


    /**
     *  Generates a rectangle for a node by using SVG path statements.
     *  The rectangle is drawn with the origin point at center
     */
    function getRectPath(width, height) {
        var path = "M " +  -(width/2) + " " + -(height/2) + " h " + width + " v " + height + " h " + -width + " z";
        return path;
    }


    /*
     * Public functions
     */

    return {
        refresh: function(nodeList) {
            parseNodeList(nodeList);
            update();
        },
        render: function() {
            update();
        },
        setEventHandler: function(aEventHandler) {
            //TODO: This should probably be addEventHandler
            eventHandler = aEventHandler;
        },
        initialize: function( svg, nodeList, aEventHandler) {
            graphSVG = svg;
            eventHandler = aEventHandler;
            init();
            parseNodeList(nodeList);
            update();
            
        },
        setZoom: function(scale) {
            setZoom(scale);
        }
    };

}());
