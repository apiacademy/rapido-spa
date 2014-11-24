// ************************************************************************
// ** graph.js
// ** 
// ** data structures, functions and variables related to the node graph 
// ** and D3 drawing and animation
// ************************************************************************
var graph = (function (){
    
/** TODO:
    1.  Give arrows direction [done]
    2.  Make labels transparent [done]
    3.  Label the transitions
    4.  Implement event handlers for clicks [done]
    5.  Implement draggable transition creator [done]
    6.  Render orphans separately [done]
    7.  Support dyanmic add and remove of transitions and resources
    8.  Automatically keep nodes apart
    9.  When there are multiple transitions between the same resources, the lines should curve to show that there is more than one
**/
    

var nodes = [];
var links = [];
var linkedNodes = [];
var orphanNodes = [];
var graphSVG = null;
        
var force = null;
var path = null;
var linkedNodesSVG = null;
var drag_line = null;
    
var eventHandler = function(event, callback) {
    //console.log('Warning: no event handler defined for graph');
    callback('no handler defined');
}

var canvasWidth = null;
var height = $( window ).height();

function dblclick(d) {
    d3.select(this).classed("fixed", d.fixed = false);
}

function dragstart(d) {
    d3.select(this).classed("fixed", d.fixed = true);
}
        
 
// The main routine - updates/renders the graph visualization.      
function initGraph(_nodes) {
    
    nodes = _nodes;
    var idMap = {};    
    
    // Convert the application dataset into something that we can use with d3
    
    // Create a map of node ids so we can easily create transition objects that point to the correct array indices
    for( var i = 0; i < nodes.length; i++ ) {        
        var id = nodes[i].nodeId;
        idMap[id] = nodes[i];        
        nodes[i].nodeType = 'orphan';
    }
    
    
    console.log(links);
    links = [];
    // Create links
    for( var i = 0; i < nodes.length; i++ ) {
        var node = nodes[i];
                
        for ( var j = 0; node.transitions != undefined && j < node.transitions.length; j++ ) {
            var transition = node.transitions[j];
            var sourceNode = idMap[node.nodeId];            
            var targetNode = idMap[transition.target];
            
            if( targetNode === undefined ) {
                //console.log('warning: transition to non-existent state ' + transition.target);
            } else {
                //console.log(transition);
                links.push({source: sourceNode, target: targetNode, method: transition.method, id: transition._id});      
                // Change the nodeTypes of the source and target nodes to indicate that they are no longer orphans
                sourceNode.nodeType = 'linked';
                targetNode.nodeType = 'linked';
            }
            
            
        }        
    }    
    
    
    // Initialize the D3 objects with the nodes and links objects
    
    canvasWidth = $('#canvas').width();        

	/*
	function zoomed() {
	  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}
	var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);
	
	graphSVG.call(zoom);
	*/
    
    // define arrow markers for graph links
    graphSVG.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 6)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
      .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#000');

    graphSVG.append('svg:defs').append('svg:marker')
        .attr('id', 'start-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 4)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
      .append('svg:path')
        .attr('d', 'M10,-5L0,0L10,5')
        .attr('fill', '#000');
    
    // define glow filters for selected objects
    var glowFilter = graphSVG.append("defs")
      .append("filter")
        .attr("id", "glow");
    
      glowFilter.append("feColorMatrix")
        .attr("type", "matrix")
        .attr("values", 
            "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0");
    
    glowFilter.append("feGaussianBlur")
        .attr("stdDeviation", "20.5");
        //.attr("result", "colouredBlur");
        
//    glowFilter.append("feMerge")
//        .append("feMergeNode").attr("in", "colouredBlur");

    /**
    <filter id="glow">
    <feColorMatrix type="matrix"     [1]
        values=
            "0 0 0 0   0
             0 0 0 0.9 0 
             0 0 0 0.9 0 
             0 0 0 1   0"/>
    <feGaussianBlur stdDeviation="2.5"     [2]
        result="coloredBlur"/>     [3]
    <feMerge>     [4]
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
    </feMerge>
</filter>
**/

    
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
    .on("dragstart", dragstart);
    
    path = graphSVG.append('svg:g').selectAll('path');
	linkedNodesSVG = graphSVG.append('svg:g').selectAll('g');
    // line displayed when dragging new nodes
    drag_line = graphSVG.append('svg:path')
      .attr('class', 'link dragline hidden')
      .attr('d', 'M0,0L0,0');

    
    // update force layout (called automatically each iteration)
    function tick() {
    // _RM they are drawing the path first and moving the circle on top of the path
    
        // draw directed edges with proper padding from node centers
        path.attr('d', function(d) {
            //console.log(d);
            var deltaX = d.target.x - d.source.x,
            deltaY = d.target.y - d.source.y,
            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
            normX = deltaX / dist,
            normY = deltaY / dist,
            sourcePadding = d.left ? 17 : 12,
            targetPadding = d.right ? 17 : 12,
            sourceX = d.source.x + (sourcePadding * normX),
            sourceY = d.source.y + (sourcePadding * normY),
            targetX = d.target.x - (targetPadding * normX),
            targetY = d.target.y - (targetPadding * normY);
            return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
        });    
        
        linkedNodesSVG.attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });
        
    }
    
   
            
    update();

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
        
    //console.log(linkedNodes);
    //console.log(orphanNodes);
    
        
    /***** D3 Event Handlers *****/
    
     // Setup a click handler for the canvas itself.  If we recieve a click event that is not targetting an SVG, de-select any selected nodes.
    graphSVG.on("click", function() {
        //console.log('graphSVG click');
        //console.log(d3.event.target);
        //console.log(selectedSVG);
            if( d3.event.target != null && d3.event.target.tagName === 'svg' ) {                
                if( selectedSVG != null ) {
                    selectedSVG.classed({'selected': false});
                    selectedSVG.select("#shadow").attr("visibility", "hidden");                    
                }
                
                var selectEvent = {
                    'type' : 'stateSelected',
                    'data' : { 'targetId' : '' }
                };
                eventHandler(selectEvent, function(){});  
            }
    });
    
    // Handle target circle drag events
    // Activated when the user drags the small circle on the bottom of a node.
    var linkTargetDragListener = d3.behavior.drag()
        .on("dragstart", function(d) {
            //console.log('dragstart');
            // This handler is used by both orphans and linked states.  This means that we can't guarantee that d.x and d.y will be set
            // d.x and d.y are only used in force-directed graphs, so use a default value of 0 so that orphans can be supported.
            var dX, dY;
            dX = dY = 0;
            if( d.x != undefined ) { 
                dX = parseInt(d.x);
            }else {
                dX = parseInt(d3.select(this).attr("cx"));
            }
            
            if( d.y != undefined ) { 
                dY = parseInt(d.y) 
            }else {
                dY = parseInt(d3.select(this).attr("cy"));
            }
            
            /**
            var cx = dX + parseInt(d3.select(this).attr("cx"));
            var cy = dY + parseInt(d3.select(this).attr("cy"));
            **/
                                    
            // Create a new circle SVG element and use it as our transition target icon
            // TODO: Should I just replace the mouse cursor instead of dragging an SVG around?
            //targetIcon = graphSVG.append("circle").attr("id", "targetIcon").attr("cx", cx).attr("cy", cy).attr("r", 20);
            targetIcon = graphSVG.append("circle").attr("id", "targetIcon").attr("cx", dX).attr("cy", dY).attr("r", 20);
            
            // In order for the mouseEnter event to fire in an SVG, the targetIcon SVG must be inserted before the other objects
            var targetElement = targetIcon[0][0];            
            var parentSVG = targetElement.parentNode;
            parentSVG.insertBefore(targetElement, parentSVG.firstChild);
            
            d3.event.sourceEvent.stopPropagation(); // silence other listeners
            
            // set the drag flag so that mouseEnter events can handle this new state
            dragEnabled = true;                          
            
            // Stop the force directed layout so that the nodes don't keep moving while the user is trying to target them.
            force.stop();
            
            //console.log(dragEnabled);
        })
        .on("drag", function(d) {
            var dX_start, dX_end, dY_start, dY_end;
            dX_start = dY_start = dX_end = dY_end = 0;
            
            //console.log(d3.event.x);
            // In the forced layout case, d3.event.x is relative to the location of the node.
            // For an orphan, d3.event.x is an absolute coordinate.
            
            if( d.x != undefined ) { 
                dX_start = parseInt(d.x);
                dX_end = parseInt(d.x) + d3.event.x;
            } else {
                dX_start = parseInt(d3.select(this).attr("cx"));
                dX_end = d3.event.x;
            }
            if( d.y != undefined ) { 
                dY_start = parseInt(d.y);
                dY_end = parseInt(d.y) + d3.event.y;
            } else {
                dY_start = parseInt(d3.select(this).attr("cy"));
                dY_end = d3.event.y;
            }
            
//            //console.log(dX);
//            //console.log(parseInt(d3.select(this).attr("cx")));
            
            // TODO: Adjust coordinates for linked vs. orphans
            
            targetIcon.attr("r", 10);
            targetIcon.attr("cx", dX_end).attr("cy", dY_end);            
            //targetIcon.attr("cx", d3.event.x).attr("cy", d3.event.y);            
            
            // reposition drag line
            drag_line
                .style('marker-end', 'url(#end-arrow)')
                .classed('hidden', false)
                //.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);
                .attr('d', 'M' + dX_start + ',' + dY_start+ 'L' + dX_end + ',' + dY_end );

        })
        .on("dragend", function(d, i) {
            //console.log('dragend');
            // TODO: Animate the removal of the target icon
            targetIcon.remove();
            // needed by FF
            drag_line
                .classed('hidden', true)
                .style('marker-end', '')
            dragEnabled = false;
            
            var graphEvent = {
              type : 'newTransition',
              data : { 'sourceId' : d.nodeId}
            };
              
            if( nodeTarget != null ) {
                graphEvent.data.targetId = nodeTarget.nodeId;
            }
                                     
            eventHandler(graphEvent, function(error, newNode) {
                // TODO: we shouldn't maniuplate the data for the force graph until we know that the view says we can.
                if( error === null ) {                        
                    //console.log('callback from component...');
                    if( d.nodeType == 'orphan' ) {
                        d.nodeType = 'linked';
                    } 
                    if( nodeTarget.nodeType == 'orphan' ) {
                        nodeTarget.nodeType = 'linked';
                    }

                    //console.log(d);
                    //console.log(nodeTarget);

                    links.push({source: d, target: nodeTarget});
                    
                    //TODO: Add new node

                    update();
                }
            });                        
        });
    
    
    /***** D3 SVG Definitions *****/
    
    path = path.data(links);
    
    // add new links
    path.enter().append('svg:path')
        .attr('class', 'link')
        .style('marker-end', 'url(#end-arrow)')
		.attr('id', function(d,i) { return 'path.' + i });
		    
    path.on('click', function(d, i) {
        if( selectedSVG != null ) {
            selectedSVG.classed({'selected': false});
            selectedSVG.select("#shadow").attr("visibility", "hidden");
        }
        selectedSVG = d3.select(this);
        d3.select(this).classed({'selected': true});
        
        var sourceNodeId = d.source.nodeId;
        var targetNodeId = d.target.nodeId;
        var id = d.id;

        var selectEvent = {
            'type' : 'linkSelected',
            'data' : { 'sourceId' : sourceNodeId, 'targetId' : targetNodeId, 'id' : id }
        };

        //console.log(selectEvent);
        eventHandler(selectEvent, function(){});     
    });
    

    // remove old links
    path.exit().remove();
	
	
    
  linkedNodesSVG = linkedNodesSVG.data(linkedNodes, function(d) { if( d.nodeType != 'orphan' ) return d.nodeId; });
    
  linkedNodesSVG.exit().remove();
    
  // add new nodes
  linkedNodesSVG.enter()
      .append('svg:g')
      .call(force.drag)
      .on('mouseover', function(d, i) {
        if( dragEnabled ) {                       
            d3.select(this).select("#label").attr("class", "node-title-glow");
            d3.select(this).select("circle").transition().attr("r",20);   
            nodeTargetIndex = i;
            nodeTarget = d;
        }
      })
    .on( 'mouseout', function(d) {
         d3.select(this).select("#label").attr("class", "node-title"); 
        d3.select(this).select("circle").transition().attr("r",5);   
        nodeTarget = null;
    })
    .on('click', function(d) { 
        // A linked node has been clicked
        d3.select(this).select("#shadow").attr("visibility", "visible");
        
        selectedNodeId = d.nodeId;
        if( selectedSVG != null ) {
            selectedSVG.classed({'selected': false});
            selectedSVG.select("#shadow").attr("visibility", "hidden");        
        }
        
        //console.log(this);
        selectedSVG = d3.select(this);
        selectedSVG.classed({'selected': true});
    
        var transform = this.getAttribute('transform');        
        var x = transform.substr('translate('.length, (transform.indexOf('.') - 'translate('.length));
        var y = transform.substr(transform.indexOf(',')+1, (transform.lastIndexOf('.') - transform.indexOf(',')-1));
        var selectEvent = {
            type : 'stateSelected',
            data : { targetId : d.nodeId, x: x, y: y }
        };
        
        eventHandler(selectEvent, function(){});                
    });
    
	var boxHeight = 60;                          
	var boxWidth = 200;
//	var boxX = -50;
//	var boxY = -40;
	var boxX = -(boxWidth / 2);
	var boxY = -(boxHeight + 15);
	
    linkedNodesSVG.append('svg:circle')
    .attr('class', 'node-circle')
    .attr('r', 5 )
	.on('mouseover', function(d, i) {
        d3.select(this).transition()
            .attr("r",20);                
    })
    .on('mouseout', function(d, i) {
          d3.select(this).transition()
            .attr("r",5);                
    })
    .call(linkTargetDragListener);

//    // The shadow
//    linkedNodesSVG  
//        .append("rect")
//        .attr("id", "shadow")
//        .attr("visibility", "hidden")
//        .attr("filter", "url(#glow)")
//        .attr("width", 150)
//        .attr("height", 30)
//        .attr("class", "node-shadow")
//        .attr("x", -50 )
//        .attr("y", -40)
//        .attr("rx",5)
//        .attr("ry",5);
//    
	linkedNodesSVG
        .append("rect")
        .attr("id", "label")
        .attr("width", boxWidth)
        .attr("height", boxHeight)
        .attr("class", "node-title")
        .attr("x", boxX )
        .attr("y", boxY)
        .attr("rx",5)
        .attr("ry",5);
        
    linkedNodesSVG
            .append("text")
            .attr("y", boxHeight / 2 + boxY + 5)
            .attr("x", boxWidth / 2 + boxX)
			.attr("text-anchor", "middle")
			.attr("class", "node-title-text")
            .text(function( d ) { return d.title; });    
    
	
	/**
	var labels = graphSVG.selectAll("text")                                     
		 			    .data(linkedNodes)
		 			    .enter()
		 			    .append("text")
		 			    .attr({"x":function(d){return d.x;},
		 					   "y":function(d){return d.y;}})
		 			    .text(function(d){return d.name;})
		 			    .call(force.drag);
						**/

    
	//TODO: Remove orphan nodes
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
						
			//move the text editor into position and make it visible
//			var left = $('#svg-edit').position().left;
//			var top = $('#svg-edit').position().top;
//			console.log(this);
									
//			
//			console.log($('#svg-edit'));
//			console.log(left);
//			
//			$('#svg-edit').css('left', left + 80);
//			$('#svg-edit').css('top', top + 45);
			
        })
        .on("mouseover", function(d, i) {    
            if( dragEnabled ) {                       
                d3.select(this).select("#label").attr("class", "node-title-glow");
                d3.select(this).select("circle").transition().attr("r",20);   
                nodeTargetIndex = i;
                nodeTarget = d;
            }
        })
        .on("mouseout", function(d, i) {
             d3.select(this).select("#label").attr("class", "node-title"); 
            d3.select(this).select("circle").transition().attr("r",5);   
            nodeTarget = null;
        });
	
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
        })
        .call(linkTargetDragListener);
    
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
        }
    };
}());