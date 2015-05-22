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
        
var force,idMap = null;
var path, canvas, zoomContainer;
var linkedNodesSVG = null;

//var orbitRadius = 100;
    
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
		console.log('force dragstart');
		console.log(d);
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("fixed", d.fixed = true);
    dragEnabled = true;
}

function dragend(d) {
    dragEnable = false;

    var movedEvent = {
        type : 'stateNodeMoved',
        data : { state: d }
    };
    
    eventHandler(movedEvent, function(){});                
}

var orbitalTargetIndex = -1;
var orbitTarget;

// Draw a 'shadow' circle to represent where a link source maybe moved to
//var orbitTargetCursor = 

// Drag logic for orbitals
var orbitalDrag = d3.behavior.drag()
	.on('dragstart', function() { d3.event.sourceEvent.stopPropagation(); })
	.on('drag', orbitalDragMove)
	.on('dragend', orbitalDragEnd);

function orbitalDragMove(d, i) {
        console.log('orbitalDragMove');
	function pointInCircle(x, y, cx, cy, radius) {
	  var distancesquared = (x - cx) * (x - cx) + (y - cy) * (y - cy);
	  return distancesquared <= radius * radius;
	}
	
	var transitionCircle = d3.select(this);

	// Check if the mouse cursor is inside the orbit of the parent node
	/*var orbit = 
			d3.select(transitionCircle.node().parentNode.parentNode)
			.select(".node-orbit");*/
    console.log(transitionCircle.node().parentNode.parentNode);
	var orbit = 
			d3.select(transitionCircle.node().parentNode.parentNode)
			.select(".node-orbit");
    console.log(orbit);
	var orbitRadius = orbit.attr('r');
	
	if( !pointInCircle(d3.event.x, d3.event.y, 0, 0, orbitRadius ) ) {
		// The circle is outside the transition source orbit, so let the user drag it around the canvas
		transitionCircle
			.attr("cx", d3.event.x)
			.attr("cy", d3.event.y);

		// Determine if the circle is now inside another orbit circle
		var SVGCoords = d3.mouse(graphSVG.node());

		var inCircle = false;

		for( var i = 0; i < linkedNodes.length; i++ ) {
			var radius = calculateRadius(linkedNodes[i].get('transitions').length);

			if( pointInCircle(SVGCoords[0], SVGCoords[1], linkedNodes[i].x, linkedNodes[i].y, radius) ) {
				orbitTarget = linkedNodes[i];

					/*
				if( orbitalTargetIndex != i ) {
					if( orbitalTargetIndex > 0 ) { linkedNodes[orbitalTargetIndex].highlight = false; }
					orbitalTargetIndex = i;
					linkedNodes[orbitalTargetIndex].highlight = true;
					console.log('update()');
					console.log('i: ' + i );
					console.log('orbitalTargetIndex: ' + orbitalTargetIndex);
					console.log(linkedNodes);
					update();
				}
				*/

				inCircle = true;
			}
		}
		//console.log(inCircle);
		
		if( !inCircle && orbitalTargetIndex > 0 ) {
			linkedNodes[orbitalTargetIndex].highlight = false;
			orbitalTargetIndex = -1;
			//update();
		}
		

	}else {
		// The circle is inside the original orbit, so allow the user to drag the circle along the orbit
		var theta = Math.atan2(d3.event.y, d3.event.x);
		transitionCircle
			.attr("cx", orbitRadius * Math.cos(theta))
			.attr("cy", orbitRadius * Math.sin(theta));
		console.log(orbitalTargetIndex);
		if( orbitalTargetIndex ) {
			orbitalTargetIndex.highlight = false;
			oribtalDragOwner = null;
			update();
		}

	}
}

function orbitalDragEnd( d ) {
	var transitionCircle = d3.select(this);

    // Check if orbitTarget is now inside another state circle
    // 
	console.log(orbitTarget);
	if( orbitTarget ) { 
		// The source for this transition has changed, update the data model accordingly
	}
}


/* Calculate the radius distance for orbitals
   based on the nubmer of transitions.  As the transitions grow
   so should the size of the 'planet'
   */
function calculateRadius(numTransitions) {
    // not working, disable for the demo
    return 80 + 4 * numTransitions;
}

// The main routine - updates/renders the graph visualization.      
function initGraph(_nodes) {

    if( !_nodes || _nodes.length <= 0 ) { 
        console.warn('no nodes to render.');
    } 

    // Create a static root node for the graph
    var rootNodeArray = [{
        id: 'root',
        nodeType: 'root',
        transitions: [],
        get: function(propName) {
            return this[propName];
        }
    }]

    // Create transitions from the root node
    //TODO: How do I represent 'home' nodes?

    nodes = rootNodeArray.concat(_nodes);
    idMap = {};    
    
    // Convert the application dataset into something that we can use with d3
    
    // Create a map of node ids so we can easily create transition objects that point to the correct array indices
    for( var i = 0; i < nodes.length; i++ ) {        
        var id = nodes[i].get('id');
        idMap[id] = nodes[i];        
        nodes[i].nodeType = nodes[i].nodeType === 'root' ? 'root' : 'orphan';
    }
    
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
                transition.source = sourceNode.get('id');

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
    
	// create a filtered list so that only the non-orphan nodes are rendered in the force directed graph.
    for( var i = 0; i < nodes.length; i ++ ) {
        if( nodes[i].nodeType != 'orphan' ) {
            linkedNodes.push(nodes[i]);
        } else {
            orphanNodes.push(nodes[i]);
        }
    }

    update();
   
   /* 
    if( _nodes.length == 1 ) {
        // Draw a single home node
        drawHomeNode(graphSVG, nodes);
    }else {
        update();
    }
    */

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
        
    /***** D3 Event Handlers *****/
    
     // Setup a click handler for the canvas itself.  If we recieve a click event that is not targetting an SVG, de-select any selected nodes.
    graphSVG.on("click", function() {
        
        if( d3.event.defaultPrevented ) {
            // The click event is being surpressed (probably by a drag), so do nothing.
            return;
        }

        // turn off any selections on links or nodes
        path.classed({'incoming': false, 'outgoing': false});
		d3.selectAll('.node-popup-group').attr('visibility', 'hidden');

		
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

  linkedNodesSVG = linkedNodesSVG.data(linkedNodes, function(d) { if( d.nodeType != 'orphan' ) return d.get('id'); });
  linkedNodesSVG.exit().remove();
   
  // add new nodes
  linkedNodesSVG.enter()
      .append('svg:g')
      .call(force.drag)
    .on('click', function(d,i) { 
        if( d3.event.defaultPrevented ) {
            // The click event is being surpressed (probably by a drag), so do nothing.
            return;
        }

		// Render a popup window
		var popupId = '#node-popup-group' + i;
		d3.selectAll('.node-popup-group').attr('visibility', 'hidden');
		d3.select(popupId).attr('visibility', 'visible');
	
        // Stop other click events from propogating
        d3.event.stopPropagation(); 
    });
  
	var stateBoxHeight = 30;                          
	var stateBoxWidth = 140;
/*	var boxX = -(boxWidth / 2);
	var boxY = -(boxHeight + 15); */

	graphSVG.append('defs')
		.append('pattern')
    .attr('id', 'diagonalHatch')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 4)
    .attr('height', 4)
		  .append('path')
		  .attr('d','M0 5L5 0ZM6 4L4 6ZM-1 1L1 -1Z')
		  .attr('stroke', '#888')
		 .attr('stroke-width','1');
    //.attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
    //.attr('stroke', 'black')
    //.attr('stroke-width', 1);

    //Background circle for orbiting transitions
    linkedNodesSVG
		.append('svg:circle')
        .attr('class', function(d,i) {
            if( d.nodeType === 'root' ) { return 'node-root'; }
            else { return 'node-orbit'; }
        })
		.attr('r', function(d,i) { 
            if( d.nodeType === 'root' ) {
                return 10;
            }else {
                return calculateRadius(d.get('transitions').length);
            }
        })
		.attr('stroke', 'black')
		//.attr('fill', 'url(#diagonalHatch)');
		.attr('fill', 'white');

/*	
    linkedNodesSVG
			.append('svg:circle')
            .attr('class', 'node-orbit')
			.classed('selected', function(d,i) { return d.highlight; } )
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
            */

    // Transition circle and label.  Draw an orbital for each transition emanating from this node.
    // The path will be drawn in the tick function from the same theta.
    var transitionOrbital = linkedNodesSVG.selectAll('.transition')
        .data(function(d,i) { return linkedNodes[i].get('transitions'); })
        .enter().append('svg:g');
        
    transitionOrbital
        .append('svg:circle')
			.call(orbitalDrag)
            .attr('class', function(d) { return 'transition ' + d.className;})
            .attr('r', 10)
            .attr('cx', function(d,i) { 
                var source = idMap[d.source];
                var numTransitions = source.get('transitions').length; 
                return (calculateRadius(numTransitions) * Math.cos(d.theta)); 
            })
            .attr('cy', function(d,i) { 
                var source = idMap[d.source];
                var numTransitions = source.get('transitions').length; 
                return (calculateRadius(numTransitions) * Math.sin(d.theta)); 
            });



	//TODO: the following code uses an initial to describe the transition and is CJ specific.  If I want to keep this mechanism I 
	// need to make the visualized initial a data attribute that any hypermedia type can use.
    /*
	transitionOrbital
		.append("text")
			.attr("fill", "white")
			.attr("class", "orbital-label")
			 .attr('x', function(d,i) { 
                var source = idMap[d.source];
                var numTransitions = source.get('transitions').length; 
                return (calculateRadius(numTransitions) * Math.cos(d.theta)) - 2; 
            })
            .attr('y', function(d,i) { 
                var source = idMap[d.source];
                var numTransitions = source.get('transitions').length; 
                return (calculateRadius(numTransitions) * Math.sin(d.theta)) + 5; 
            })
			.text(function( d ) { 
					console.log(d); 
					if( d.className === 'cj-item' ) { return "I" } 
					else if( d.className === 'cj-query' ) { return "Q" }
					else if( d.className === 'cj-link' ) { return "L" }
					else { return d.name } 
			});
            */

    transitionOrbital
        .append("text")
            .attr("x", function(d,i) { 
                var source = idMap[d.source];
                var numTransitions = source.get('transitions').length; 
                return (calculateRadius(numTransitions) * Math.cos(d.theta)) + 22; 
            })
            .attr("y", function(d,i) {
                var source = idMap[d.source];
                var numTransitions = source.get('transitions').length; 
                return (calculateRadius(numTransitions) * Math.sin(d.theta)); 
            })
			.attr("text-anchor", "left")
			.attr("class", "transition-text")
            .text(function( d ) { return d.name; }); 
       
    linkedNodesSVG
            .append("text")
            .attr("x", 0)
            .attr("y", 8 )
			.attr("text-anchor", "middle")
			.attr("class", "node-title-text")
            .text(function( d ) { return d.get('name'); });    

    

	// Popup window for node actions
	var popupWindow = linkedNodesSVG
		.append('svg:g')
		.attr('class', 'node-popup-group')
		.attr('id', function(d,i) { return 'node-popup-group' + i;} )
		//.attr('visibility', function(d) { if( d.popup ) { return 'visible' } else { return 'hidden' } } );
		.attr('visibility', 'hidden' );
	
	popupWindow
		.append('svg:rect')
		.attr('class', 'node-popup')
		.attr('x', -75)
		.attr('y', 20)
		.attr('rx', 10)
		.attr('ry', 10)
		.attr('width', 150)
		.attr('height', 50)

	 var createLinkButton = popupWindow 
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
            .attr('cx', -40)
            .attr('cy', 45)
            .attr('stroke', 'black')
            .attr('fill', 'white');

    createLinkButton.append('text')
            .attr('text-anchor', 'middle')
            .text('+')
            .attr('x', -40)
            //.attr('y', -(stateBoxHeight/2) - 15);
            .attr('y',49);

	var responseBodyButton = popupWindow
			.append('svg:g')
			.on('click', function(d) {
				var selectEvent = {
					type : 'stateSelected',
					data : { id : d.get('id')}
				};
        
				eventHandler(selectEvent, function(){});      
			});

	responseBodyButton
			.append('rect')
			.attr('fill', 'white')
			.attr('stroke', 'black')
			.attr('x', 20)
			.attr('y', 30)
			.attr('width', 20)
			.attr('height', 30);

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
