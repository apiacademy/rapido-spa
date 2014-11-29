// ************************************************************************
// ** graph.js
// ** 
// ** data structures, functions and variables related to the node graph 
// ** and D3 drawing and animation
// ************************************************************************
var graph = (function (){
    
var nodes = [];
var links = [];
var linkedNodes = [];
var orphanNodes = [];
var graphSVG = null;
        
var force = null;
var path, canvas, zoomContainer;
var linkedNodesSVG = null;

var orbitRadius = 100;
    
var eventHandler = function(event, callback) {
    //console.log('Warning: no event handler defined for graph');
    callback('no handler defined');
}

var canvasWidth = null;
var height = $( window ).height();

var dragEnabled = false;

var zoom = d3.behavior.zoom()
    .scaleExtent([-1,10])
    .on("zoom", canvas_zoomed);
    
function canvas_zoomed() {
  zoomContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function dblclick(d) { 
    d3.select(this).classed("fixed", d.fixed = false);
}

function dragstart(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("fixed", d.fixed = true);
    dragEnabled = true;
}

function dragend(d) {
    console.log('dragend');
    dragEnable = false;

    var movedEvent = {
        type : 'stateNodeMoved',
        data : { state: d }
    };
    
    console.log(movedEvent);
    eventHandler(movedEvent, function(){});                
}

/* Calculate the radius distance for orbitals
   based on the nubmer of transitions.  As the transitions grow
   so should the size of the 'planet'
   */
function calculateRadius(numTransitions) {
    return 80 + 4 * numTransitions;
}

function drawHomeNode(container, nodes) {
    
    // If there is no graph, just draw a simple tree layout with a single root node.
    //TODO: I may switch to a static layout in general as the force directed layout is too unpredictable.
    var tree = d3.layout.tree()
        .size([height, canvasWidth - 160]);
    
    var nodes  = tree.nodes(nodes[0]);
	var stateBoxHeight = 30;                          
	var stateBoxWidth = 140;

    var node = container.selectAll(".tree-node")
      .data(nodes, function(d) {return d.get('id'); })
      .enter().append("g")
      .attr("class", "tree-node")
      .attr("transform", function(d) { return "translate(" + d.y + (canvasWidth / 2) +  "," + (d.x + 0) + ")"; })
      .on("click", function(d) { 
          if( d3.event.defaultPrevented ) {
            // The click event is being surpressed (probably by a drag), so do nothing.
            return;
        }

        var selectEvent = {
            type : 'stateSelected',
            data : { id : d.get('id')}
        };
        
        eventHandler(selectEvent, function(){});                
        
        // Stop other click events from propogating
        d3.event.stopPropagation(); 
      });


    node.append('svg:circle')
            .attr('class', 'node-orbit')
            .attr('r',100);

    //State rectangle
    node	
        .append("rect")
        .attr("id", "label")
        .attr("width", stateBoxWidth )
        .attr("height", stateBoxHeight )
        .attr("class", "node-title")
        .attr("x", -(stateBoxWidth/2))
        .attr("y", 0 )
        .attr("rx",5)
        .attr("ry",5);
        
       node 
        .append("text")
        .attr("x", 0)
        .attr("y", 8 )
        .attr("text-anchor", "middle")
        .attr("class", "node-title-text")
        .text(function( d ) { return d.get('name'); });    

// Create new node
    //TODO: Move style attributes to css
    var createLinkButton = node 
            .append('svg:g')
            .on('click', function(d, i) {
                // Fire an event and let the controller take over.
                var selectEvent = {
                    'type' : 'newTransition',
                    'data' : { 'sourceId' : d.get('id') }
                };
                eventHandler(selectEvent, function(){}); 

                d3.event.stopPropagation();
            });
    createLinkButton
            .append('circle')
            .attr('r', '10')
            .attr('cx', 0)
            .attr('cy', -(stateBoxHeight/2) - 15)
            .attr('stroke', 'black')
            .attr('fill', 'white');

    createLinkButton.append('text')
            .attr('text-anchor', 'middle')
            .text('+')
            .attr('x', 0)
            .attr('y', -(stateBoxHeight/2) - 15);


}
        
 
// The main routine - updates/renders the graph visualization.      
function initGraph(_nodes) {

    if( !_nodes || _nodes.length <= 0 ) { 
        console.warn('no nodes to render.');
        return;
    } 
    
    nodes = _nodes;
    var idMap = {};    
    
    // Convert the application dataset into something that we can use with d3
    
    // Create a map of node ids so we can easily create transition objects that point to the correct array indices
    for( var i = 0; i < nodes.length; i++ ) {        
        var id = nodes[i].get('id');
        idMap[id] = nodes[i];        
        nodes[i].nodeType = 'orphan';
    }
    console.log(idMap);
    
    links = [];
    // Create links
    for( var i = 0; i < nodes.length; i++ ) {
        var node = nodes[i];
        var transitions = node.get('transitions');
                
        for ( var j = 0; j < transitions.length; j++ ) {
            var transition = transitions[j];
            var sourceNode = idMap[node.get('id')];            
            var targetNode = idMap[transition.target];
            
            if( targetNode === undefined ) {
                console.log('warning: transition found that targets a non-existent state: ' + transition.target);
            } else {
                console.log(transition);
                // Calculate the angle for this transition to be rendered on the state's orbit
                var _theta = ((360 / transitions.length) * j) * (Math.PI/180);

                var link = {
                    source: sourceNode,
                    target: targetNode,
                    method: transition.methods[0],
                    theta: _theta,
                    name: transition.name,
                    numTransitions: node.get('transitions').length
                };
                links.push(link);      

                // Store the calculated angle in this transition object so we can draw the orbiting sphere from the point that the path starts.
                transition.theta = _theta;

                // Change the nodeTypes of the source and target nodes to indicate that they are no longer orphans
                sourceNode.nodeType = 'linked';
                targetNode.nodeType = 'linked';
            }
        }        
    }    

    console.log(links);
    console.log(nodes);
    
    
    // Initialize the D3 objects with the nodes and links objects
    canvasWidth = $('#canvas').width();        

    // Setup zoom and pan for the canvas

function canvas_dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
}
    canvas = graphSVG.append('g').call(zoom);
        
    zoomContainer = canvas.append('g');

    // init D3 force layout
    force = d3.layout.force()
        .nodes(linkedNodes)
        .links(links)
        .size([canvasWidth, height])        
		.linkDistance(250)
		//.linkStrength(2)
        .charge(-2500)
		//.chargeDistance(400)
        .on('tick', tick);
    
    // Allow the user to drag a force layout node into a fixed position
    var drag = force.drag()
        .on("dragstart", dragstart)
        .on("dragend", dragend);
    
    path = zoomContainer.append('svg:g').selectAll('path');
	linkedNodesSVG = zoomContainer.append('svg:g').selectAll('g');
    
    // update force layout (called automatically each iteration)
    function tick() {

        // draw directed edges with proper padding from node centers
        path.attr('d', function(d) {

            var deltaX = d.target.x - d.source.x,
            deltaY = d.target.y - d.source.y,
            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
            normX = deltaX / dist,
            normY = deltaY / dist,
            targetPadding = d.right ? 17 : 12,
            targetX = d.target.x - (targetPadding * normX),
            targetY = d.target.y - (targetPadding * normY);
            
            sourceX = d.source.x + calculateRadius(d.numTransitions) * Math.cos(d.theta);
            sourceY = d.source.y + calculateRadius(d.numTransitions) * Math.sin(d.theta);

            return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
        });    

        // move the linked nodes into place
        linkedNodesSVG.attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });

    }
    
    if( _nodes.length == 1 ) {
        // Draw a single home node
        console.log('single node');
        drawHomeNode(graphSVG, nodes);
    }else {
        update();
    }

}
    
/**
update 
Defines events, SVG objects and renders the D3 layout.  Call this function whenever the underlying data has changed.
**/    
function update() {        
    
    //console.log('update');
    
    var selectedSVG = null;
    var dragEnabled = false;
    var nodeTarget, nodeTargetIndex;
    var targetIcon;
    var selectedNodeId = "";
    //console.log(linkedNodes);
    
    //force.stop();
    //linkedNodes = [];
    orphanNodes = [];
     // create a filtered list so that only the non-orphan nodes are rendered in the force directed graph.
    for( var i = 0; i < nodes.length; i ++ ) {
        if( nodes[i].nodeType != 'orphan' ) {
            linkedNodes.push(nodes[i]);
        } else {
            orphanNodes.push(nodes[i]);
        }
    }
        
    console.log(linkedNodes);
    //console.log(orphanNodes);
    
        
    /***** D3 Event Handlers *****/
    
     // Setup a click handler for the canvas itself.  If we recieve a click event that is not targetting an SVG, de-select any selected nodes.
    graphSVG.on("click", function() {
        
        if( d3.event.defaultPrevented ) {
            // The click event is being surpressed (probably by a drag), so do nothing.
            return;
        }

        // turn off any selections on links or nodes
        path.classed({'incoming': false, 'outgoing': false});
        
        var selectEvent = {
            'type' : 'stateSelected',
            'data' : { 'targetId' : '' }
        };
        eventHandler(selectEvent, function(){});  
    });
    
    /***** D3 SVG Definitions *****/
    
    path = path.data(links);
    
    // add new links
    path.enter().append('svg:path')
        .attr('class', function(d,i) { var classList = 'link'; if( d.selected) { classList = classList + ' selected'; }  return classList  })
        .style('marker-end', 'url(#end-arrow)')
		.attr('id', function(d,i) { return 'path.' + i });
		    
    // remove old links
    path.exit().remove();

console.log('linkedNodes:');	
console.log(linkedNodes);	
    
  linkedNodesSVG = linkedNodesSVG.data(linkedNodes, function(d) { if( d.nodeType != 'orphan' ) return d.get('id'); });
  linkedNodesSVG.exit().remove();
    
  // add new nodes
  linkedNodesSVG.enter()
      .append('svg:g')
      .call(force.drag)
    .on('click', function(d) { 
        if( d3.event.defaultPrevented ) {
            // The click event is being surpressed (probably by a drag), so do nothing.
            return;
        }

        selectedNodeId = d.nodeId;
        
        var selectEvent = {
            type : 'stateSelected',
            data : { id : d.get('id')}
        };
        
        eventHandler(selectEvent, function(){});                
        
        // Stop other click events from propogating
        d3.event.stopPropagation(); 
    });
    
	var stateBoxHeight = 30;                          
	var stateBoxWidth = 140;
/*	var boxX = -(boxWidth / 2);
	var boxY = -(boxHeight + 15); */
	
    //Background circle for orbiting transitions
    linkedNodesSVG
        .append('svg:circle')
            .attr('class', 'node-orbit')
            .attr('r',function(d,i) { return calculateRadius(d.get('transitions').length); })
            .on('click', function(d,i) {
                d3.event.stopPropagation();
                //TODO: change colour of this state to show that it has been selected.
                // COmmenting this out because I haven't figured out how to 'de-select' nodes
                //d3.select(this).classed('selected', true);


                path.classed({
                    'outgoing': function(pathData,i) { 
                        if( pathData.source === d ) { return true; }
                    },
                    'incoming': function(pathData,i) {
                        if( pathData.target === d ) { return true; }
                    }
                });

                
            });

    // Transition circle and label.  Draw an orbital for each transition emanating from this node.
    // The path will be drawn in the tick function from the same theta.
    var transitionOrbital = linkedNodesSVG.selectAll('.transition')
        .data(function(d,i) { return nodes[i].get('transitions'); })
        .enter().append('svg:g');
        
    transitionOrbital
        .append('svg:circle')
            .attr('class', 'transition')
            .attr('r', 10)
            .attr('cx', function(d,i) { 
                var numTransitions = nodes[i].get('transitions').length; 
                console.log(nodes[i].get('name'));
                console.log(numTransitions);
                return (calculateRadius(numTransitions) * Math.cos(d.theta)); 
            })
            .attr('cy', function(d,i) { 
                var numTransitions = nodes[i].get('transitions').length;
                return (calculateRadius(numTransitions) * Math.sin(d.theta)); 
            });

    transitionOrbital
        .append("text")
            .attr("x", function(d,i) { 
                var numTransitions = nodes[i].get('transitions').length; 
                return (calculateRadius(numTransitions) * Math.cos(d.theta)) + 22; 
            })
            .attr("y", function(d,i) {
                var numTransitions = nodes[i].get('transitions').length; 
                return (calculateRadius(numTransitions) * Math.sin(d.theta)); 
            })
			.attr("text-anchor", "left")
			.attr("class", "transition-text")
            .text(function( d ) { console.log(d); return d.name; }); 
       
    //State rectangle
	linkedNodesSVG
        .append("rect")
        .attr("id", "label")
        .attr("width", stateBoxWidth )
        .attr("height", stateBoxHeight )
        .attr("class", "node-title")
        .attr("x", -(stateBoxWidth / 2) )
        .attr("y", -(stateBoxHeight / 2) )
        .attr("rx",5)
        .attr("ry",5);
        
    linkedNodesSVG
            .append("text")
            .attr("x", 0)
            .attr("y", 8 )
			.attr("text-anchor", "middle")
			.attr("class", "node-title-text")
            .text(function( d ) { return d.get('name'); });    

    // Button for creating new transitions from this source state
    var createLinkButton = linkedNodesSVG
            .append('svg:g')
            .on('click', function(d, i) {
                // Fire an event and let the controller take over.
                var selectEvent = {
                    'type' : 'newTransition',
                    'data' : { 'sourceId' : d.get('id') }
                };
                eventHandler(selectEvent, function(){}); 

                // Stop other click events from propogating
                d3.event.stopPropagation(); 
            });
    createLinkButton
            .append('circle')
            .attr('r', '10')
            .attr('cx', 0)
            .attr('cy', -(stateBoxHeight/2) - 15)
            .attr('stroke', 'black')
            .attr('fill', 'white');

    createLinkButton.append('text')
            .attr('text-anchor', 'middle')
            .text('+')
            .attr('x', 0)
            .attr('y', -(stateBoxHeight/2) - 15);
   //TODO: figure out how to insert an image 
	
    var orphanNodesSVG = graphSVG
    .selectAll(".orphan");
    
    orphanNodesSVG = orphanNodesSVG
    .data(orphanNodes, function(d) { return d.nodeId });
    
    orphanNodesSVG
    .enter()
    .append("g")
        .attr("class", "orphan")
        .on("click", function (d, i) {
            console.log('orphan click');
            if( selectedSVG != null ) {
                selectedSVG.classed({'selected': false});
            }
            selectedSVG = d3.select(this);
            selectedSVG.classed({'selected': true});
            //console.log(selectedSVG);

            var selectEvent = {
                'type' : 'stateSelected',
                'data' : { 'targetId' : d.nodeId }
            };

			// event handler disabled while we sort out the GUI
            eventHandler(selectEvent, function(){});                
        })
	
	var titleBoxHeight = 30;                                
	var descriptionBoxHeight = 80;
	
//	orphanNodesSVG
//        .append("rect")
//        .attr("width", 150)
//        .attr("height", descriptionBoxHeight)
//        .attr("x", function( d, i ) { return (i*180) + 75; } )
//        .attr("y", 24 + titleBoxHeight)
//        .attr("rx",0)
//        .attr("ry",0)
//        .attr("class", "node-description");
	
	orphanNodesSVG
        .append("rect")
        .attr("width", 150)
        .attr("height", titleBoxHeight)
        .attr("x", function( d, i ) { return (i*180) + 75; } )
        .attr("y", 24)
        .attr("rx",5)
        .attr("ry",5)
        .attr("class", "node-title");
	

    orphanNodesSVG
        .append("text")
        .text(function(d) { return d.title; } )
        .attr("x", function( d, i ) { return (i*180) + 80; } )
        .attr("y", 45)
		.attr("cursor", "text")
		.on("click", function (d, i) {
			d3.event.stopPropagation();
			// Determine the coordinates
			var svg = document.querySelector('svg');
			var corners = {};			
			var matrix = this.getScreenCTM();
			console.log(matrix);
			var pt  = svg.createSVGPoint();
			pt.x = this.x.animVal.getItem(0).value;
  			pt.y = this.y.animVal.getItem(0).value;
			corners.nw = pt.matrixTransform(matrix);
									
			// Send an event to the controller			
			// TODO: For some reason reducing the y cord by 16 works.  Need to find out why.
			var selectEvent = {
                'type' : 'textSelected',
                'data' : { x : corners.nw.x, y: corners.nw.y-16, id: d.nodeId, property: 'title', value: d.title }
            };
			eventHandler(selectEvent, function(newValue){
				console.log('in d3');
				console.log(newValue);
				d.title = newValue;
			});                
			

		});
	
//	orphanNodesSVG
//        .append("text")
//        .text(function(d) { return d.description } )
//        .attr("x", function( d, i ) { return (i*180) + 80; } )
//        .attr("y", 45 + titleBoxHeight);

    orphanNodesSVG.append('svg:circle')
        .attr('class', 'node')
        .attr('r', 5)
        .attr("cx", function( d, i ) { return (i*180) + 150; })
        .attr("cy", 24 + 40 )    
        .on('mouseover', function(d, i) {
            d3.select(this).transition().attr("r",20);                
        })
        .on('mouseout', function(d, i) {
              d3.select(this).transition().attr("r",5);                
        });
    
    //TODO: make sure this orphan is not selected anymore after a remove
    orphanNodesSVG.exit().remove();
    
    
    //console.log(nodes);
    //console.log(links);
    //console.log('force.start()');
    force.start();
}
    
//TODO: I can optimize this by maintaining a hash object in addition to an array
function parseNodesList() {
    var orphanMap = {};
    var linkedMap = {};
    
    for( var i =0; i < orphanNodes.length; i++ ) {
        var orphan = orphanNodes[i];
        orphanMap[orphan.id] = i;        
    }
    
    for( var i = 0; i < linkedNodes.length; i++ ) {
        var linkedNode = linkedNodes[i];
        linkedMap[linkedNode.id] = i;
    }
    
    // scenario 1: New Orphan
    // orphanNodes.push
    
    // scenario 2: Deleted Orphan
    // find orphan node and remove
    
    // scenario 3: Link with no more transitions
    // find linked node and remove, orphanNodes.push
    
    // scenario 4: Orphan with new transition
    // find orphan node and remove, linkedNodes.push
}
/**
Insert a new orphan node into an existing graph
**/
function pushNode(node) {
    // Path uses the links array which holds pointers to objects stored in the orphans and linked lists
    // We are going to create a new orphan, but none of the d3 objects are bound to the nodes list.
    
    //console.log('pushNode');
    node.nodeType = 'orphan';
    // Store this resource in our general nodes list so we can find it later if we need to delete it
    nodes.push(node);
    // Store the resource in the orphan list for immediate rendering.
    //console.log(node);
    orphanNodes.push(node);
    update();
}
    
function deleteNodes(startIdx, count) {
    //TODO: support multiple node removal    
    //console.log('deleteNodes');
    var node = nodes[startIdx];
    //console.log(node);
    
    if( node.nodeType === 'orphan' ) {
        var orphanIndex = 0;
        for( orphanIndex = 0; orphanIndex < orphanNodes.length; orphanIndex++ ) {
            var orphanNode = orphanNodes[orphanIndex];
            if( orphanNode.nodeId === node.nodeId ) {
                //console.log('found it');
                break;
            }
        }
        orphanNodes.splice(orphanIndex, 1);
    }else {
        // Remove this node and remove the transitions
        
        var linkedIndex = 0;
        for( linkedIndex = 0; linkedIndex < linkedNodes.length; linkedIndex++ ) {
            var linkedNode = linkedNodes[linkedIndex];
            if( linkedNode.nodeId === node.nodeId) {
                //console.log('found it');
                //console.log(linkedNode);
                //TODO remove all associated paths/links
                break;
            }
        }
        
        linkedNodes.splice(linkedIndex, 1);
                
        //console.log(links);
        for( var i = 0; i < links.length; i++ ) {
            var link = links[i];            
            if( link.source.nodeId === node.nodeId ) { 
                // remove this path
                links.splice(i, 1);
            } else if( link.target.nodeId === node.nodeId ) {
                // remove this path
                links.splice(i, 1);
            }
        }
        //console.log(links);
    }
        
    // remove the resource form the general nodes list
    nodes.splice(startIdx, count);
    update();
}

function setZoom(scale) {
    zoom.translate([0,0]).scale(scale);
    zoom.event(graphSVG.transition().duration(50));
}
    
     
    /** Public methods **/
    
    return {
        render: function() {
            update();
        },
        setEventHandler: function(aEventHandler) {
            //TODO: This should probably be addEventHandler
            eventHandler = aEventHandler;
        },
        initialize: function( svg, nodeList, aEventHandler) {
            eventHandler = aEventHandler;
            graphSVG = svg;
            initGraph(nodeList);
            
        },
        pushStateNode: function(stateNode) {
            pushNode(stateNode);
        },
        removeStateNodes: function(start, count) {
            deleteNodes(start, count);
        },
        setZoom: function(scale) {
            setZoom(scale);
        }
    };
}());