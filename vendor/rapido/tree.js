// ************************************************************************
// ** tree.js
// ** 
// ** data structures, functions and variables related to the node tree 
// ** and D3 drawing and animation.  Created for URI style API sketching.
// ************************************************************************
var tree = (function (){
        
var graphSVG = null;
var container = null;
        
var eventHandler = function(event, callback) {
    //console.log('Warning: no event handler defined for graph');
    callback('no handler defined');
}

var canvasWidth = null;
var height = $( window ).height();	
//var nodes = null;
var links = null;
var diagnoal = null;
var rootNode = null;
var tree = null;

var dragEnabled;
var drag_line = null;
	
// Behaviours
var zoom = d3.behavior.zoom()	
    .scaleExtent([-1, 10])
    .on("zoom", zoomed);

function zoomed() {	
    container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); 
}
	
var linkTargetDragListener = d3.behavior.drag()
        .on("dragstart", function(d) {
            //console.log('dragstart');
            // This handler is used by both orphans and linked states.  This means that we can't guarantee that d.x and d.y will be set
            // d.x and d.y are only used in force-directed graphs, so use a default value of 0 so that orphans can be supported.
            var dX, dY;
            dX = dY = 0;
			console.log(d.x);
			console.log(d.y);
			console.log(d);
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
            
            // Create a new circle SVG element and use it as our transition target icon
            // TODO: Should I just replace the mouse cursor instead of dragging an SVG around?
            //targetIcon = graphSVG.append("circle").attr("id", "targetIcon").attr("cx", cx).attr("cy", cy).attr("r", 20);
            targetIcon = container.append("circle").attr("id", "targetIcon").attr("cx", d.x).attr("cy", d.y).attr("r", 20);
            
            // In order for the mouseEnter event to fire in an SVG, the targetIcon SVG must be inserted before the other objects
            var targetElement = targetIcon[0][0];            
            var parentSVG = targetElement.parentNode;
            parentSVG.insertBefore(targetElement, parentSVG.firstChild);
            
            d3.event.sourceEvent.stopPropagation(); // silence other listeners
            
            // set the drag flag so that mouseEnter events can handle this new state
            dragEnabled = true;                          
            
            console.log(dragEnabled);
			console.log(dX);
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
	
// The main routine - updates/renders the graph visualization.      
function initTree(_rootNode) {

	rootNode = _rootNode;
            
    canvasWidth = $('#canvas').width();                
	canvasWidth = $('#canvas').width() - 100;                
    
	//var cluster = d3.layout.cluster().size([height, canvasWidth - 160]);
	tree = d3.layout.tree()
		.size([height, canvasWidth - 160])
		//.separation(function(a,b) { return a.parent == b.parent ? 209 : 1; } );
	//var tree = d3.layout.tree().nodeSize([10,20]);
	diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });
	
	// attach the zoom handler to the canvas
	graphSVG.call(zoom);
	
	// Create the container that will hold the graph.  The container can be zoomed and panned.
	container = graphSVG.append("g");
	
	update(rootNode);
}
	
function update(rootNode) {

	// Populate the tree
	var nodes = tree.nodes(rootNode);
	links = tree.links(nodes);		
	
	drag_line = container.append('svg:path')
      .attr('class', 'link dragline hidden')
      .attr('d', 'M0,0L0,0');
	
	var link = container.selectAll(".tree-link")
      .data(links)
    .enter().append("path")
      .attr("class", "tree-link")	  
      .attr("d", diagonal);
		
	var node = container.selectAll(".tree-node")
      .data(nodes, function(d) { console.log(d); return d.get('id'); })
      .enter().append("g")
      .attr("class", "tree-node")
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
	
	// Method rectangles		
	drawMethodTabs(node, ['GET','PUT','POST','DELETE']);	
	
	// Starting box
	node.append("rect")
        .attr("width", 225)
        .attr("height", 100)
		.attr("x", 40)
		.attr("y",-50)
        .attr("rx",5)
        .attr("ry",5)
		.style("opacity", "0.4")
		.style("fill", "green")
		.style("display", function(d) {if(rootNode.children) return 'none'});
	
	node.append("text")
        .attr("dx", 82)
		.attr("dy", 7)
        .style("opacity", "0.9")
		.style("fill", "green")
		.text("start here!")
		.style("font-size", "35")
		.style("fill", "white")
		.style("display", function(d) {if(rootNode.children) return 'none'});
			
	// Resource Box
	var resourceBoxHeight = 60;                          
	var resourceBoxWidth = 200;
	node.append("rect")
        .attr("width", resourceBoxWidth)
        .attr("height", resourceBoxHeight)
		//.attr("x", function(d) { return d.children ? -83 : 0; })
		.attr("y",-30)
        .attr("rx",5)
        .attr("ry",5)
		.style("display", function(d) {if(d.root) return 'none'})
        .attr("class", function(d) { console.log(d); var className = 'tree-node-name'; return (className + ' ' + d.get('class'));})
		.on("click", function (d, i) {
		  var event = {
                'type' : 'nodeSelected',
                'data' : { id: d.get('id') }
            };
			eventHandler(event, function(newValue){});                
	  });
	
	
	// URI Box	
	node.append("rect")
        .attr("width", resourceBoxWidth)
        .attr("height", 20)
		.attr("y",-30)
		.style("display", function(d) {if(d.root) return 'none'})
        .attr("class", "node-uri");
	
	// Child appender 
	node.append("circle")
      .attr("r", function(d){ return d.root ? 35 : 20 })	
	  .attr("cx", function(d) { return d.root ? 40 : resourceBoxWidth })
	  .style("cursor", "pointer")
	  .on("click", function (d, i) {
		  var event = {
                'type' : 'createChild',
                'data' : { parentId: d.get('id') }
            };
			eventHandler(event, function(newValue){});                
	  });
	
	node.append("text")
		.attr("dx", function(d) { return d.root ? 40 : resourceBoxWidth })
		//.attr("dx", resourceBoxWidth)		
		.attr("dy", function(d) { return d.root ? 12 : 7 })
		.style("text-anchor", "middle")
		.style("font-size", function(d) { return d.root ? "50" : "24" })
		.style("fill", "#6F198C")
		.style("cursor", "pointer")
	    .on("click", function (d, i) {
		  var event = {
                'type' : 'createChild',
                'data' : { parentId: d.get('id') }
            };
			eventHandler(event, function(newValue){});                
	  	})
		.text("+");
	
	// Parent modifier
	node.append("circle")
      .attr("r", function(d){ return d.root ? 0 : 5 })	
	  .attr("cx", function(d) { return d.root ? 0 : 0 })
	  .attr("id", "small-circle")
	  .style("cursor", "pointer")
		.call(linkTargetDragListener);
	  
	
	
  // Resource url
	node.append("text")
		.attr("dx", 10)
		.attr("dy", -15)
		//.style("text-anchor", function(d) { return d.children ? "end" : "start"; })
		.text(function(d) { return d.get('url'); })
		
	
  // Resource name
  node.append("text")
  	   .style("display", function(d) {if(d.root) return 'none'})
      .attr("dx", resourceBoxWidth / 2)
      .attr("dy", 15)
  	  .attr("class", "tree-node-name-text")
      .style("text-anchor", "middle")
      .text(function(d) { return d.get('name'); })
  	  .on("click", function (d, i) {
			//d3.event.stopPropagation();
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
				d.get('name') = newValue;
			});
	  });		
	
	
	var nodeExit = container.selectAll(".tree-node")
      .data(nodes).exit().attr("class", function(d) { console.log('exit' + d);}).remove();
	
	container.selectAll(".tree-link")
      .data(links).exit().remove();
	
	/*
	node.append("text")
      .attr("dx", function(d) { return d.children ? -8 : 8; })
      .attr("dy", 28)
      .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
      .text(function(d) { return d.methods; });
	  */

}
	
function drawMethodTabs(node, methods) {

	for( var i = 0; i < methods.length; i++ ) {	
		var method = methods[i];
		var rectClass = "tree-node-method " + method;
		var x = 5*(i) + 40*(i);
		
		node.append("rect")
			.attr("width", 40)
			.attr("height", 30)		
			.attr("x",x)
			.attr("y",-45)
			.attr("rx",5)
			.attr("ry",5)
			.attr("class", rectClass)
			.style("display", function(d) {if( d.get('methods').indexOf(method) < 0) {return "none";}});		

		node.append("text")
					.style("text-anchor", "middle")
					.attr("dx", 20 + x)
					.attr("dy", -33)
					.text(method)
					.attr("class", "tree-node-method-text")
					.style("display", function(d) {if( d.get('methods').indexOf(method) < 0) {return "none";}});		
	}	
}
	
	
function pushResource(node) {	
    //nodes.push(node); 
	if( !rootNode.children ) rootNode.children = [];
	//rootNode.children.push(node);
	rootNode.children = [];
	console.log(rootNode);
	update();
//	console.log(nodes)
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
        initialize: function( svg, rootNode, aEventHandler) {
            eventHandler = aEventHandler;
            graphSVG = svg;
            initTree(rootNode);            
        },
		pushNode: function(node) {
			console.log(node);
			pushResource(node);
		},
		updateTree: function(root) {
			update(root);
		}
    };
}());
