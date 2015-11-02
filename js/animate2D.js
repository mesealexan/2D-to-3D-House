define(["paper"], function(paper){
    var animate2D = {};

    canvas = document.getElementById('paperCanvas');
    paper.setup(canvas);

	var tool = new paper.Tool();
    var wall_thick = 40;
    var walls;
    var selected = undefined;
    var lastPoint = paper.view.center;
	var hitResult;
	var openings = [];
	var count = 0;
	var dimension_offset = 50;
	var opening_dimension;
	var points_to_measure = [];
//	Global functions
	window.onresize = function() {
		paper.view.setViewSize(canvas.clientWidth, canvas.clientHeight);
		paper.view.scrollBy(lastPoint.subtract(paper.view.center));
		lastPoint = paper.view.center;
	}  
	window.Update = function(width,height,floor) {
		if(opening_dimension) {
			opening_dimension.removeChildren();
			opening_dimension.remove();
		}
		if (selected && selected.type) {	// opening			
			if (Number(width)) { 
				if(selected.wall === 1 || selected.wall === 3) {
					selected.scale(Number(width) / selected.sizes.width,1);
				} else {
					selected.scale(1, Number(width) / selected.sizes.width);
				}
				selected.sizes.width = Number(width);
			}
			if (Number(height)) { selected.sizes.height = Number(height) }
			if (Number(floor)) { selected.sizes.floor = Number(floor) }	

			createOpeningDimension(selected)
		} else {	// wall
			if (Number(width)) { updateWalls(width,height,floor) }
			if (Number(height)) { updateWalls(width,height,floor) }
			if (Number(floor)) { return }	
				createDimension(walls)
		}
		
		paper.view.draw();
	}	 
	window.AddOpening = function(type) {
		if(selected) {
			if(selected.dimension) {
				selected.dimension.removeChildren();
				selected.dimension.remove();
			}
			selected.selected = false;
			selected = undefined;
		}
		
    	checkDrawFailure();
    	if (type === 'window') {
	       	openings[count] = new paper.CompoundPath({
	       		pivot: new paper.Point(walls._style._values.strokeWidth/2,50),
			    children: [
			        new paper.Path.Rectangle({
			        	point: [0.5, 0],
			        	size: [walls._style._values.strokeWidth - 1, 100]
			        }),
			        new paper.Path.Rectangle({
			        	point: [walls._style._values.strokeWidth/2 - 3, 0],
			        	size: [6, 100]
			        })
			    ],
			    strokeColor: '#2E2E1C',
			    strokeWidth:1,
	    		fillColor: '#E0F0FF'
			});
			openings[count].sizes = {};
			openings[count].sizes.width = 100;
			openings[count].sizes.height = 150;
			openings[count].sizes.floor = 90;
			openings[count].type = 1;
    	} else if (type === 'door') {
    		pivot: new paper.Point(walls._style._values.strokeWidth/2,0),
	    	openings[count] = new paper.CompoundPath({
			    children: [
			        new paper.Path.Rectangle({
			        	point: [0, 0],
			        	size: [walls._style._values.strokeWidth+2, 100]
			        })
			    ],
			    strokeColor: '#E0F0FF',
	    		fillColor: '#E0F0FF'
			});
			openings[count].type = 2;
			openings[count].sizes = {};
			openings[count].sizes.width = 100;
			openings[count].sizes.height = 150;
    	}
    	openings[count].bringToFront()
    	openings[count].rotation = 90; 
		var last_wall = 1;

			selected = openings[count];
			selected.selected = true;
			fill_menu("width",selected.sizes.width);
			fill_menu("height",selected.sizes.height);
			if (selected.sizes.floor) {
				fill_menu("floor",selected.sizes.floor);
			} else {
				fill_menu("floor",undefined);
			}
		tool.onMouseMove = function(event){
			if(selected.dimension) {
				selected.dimension.removeChildren();
				selected.dimension.remove();
			}
			var nearest = walls.getNearestPoint(event.point);
			var point =  new paper.Point(nearest.x, nearest.y);
			var hitResult = walls.hitTest(event.point, {stroke: true, tolerance:1000});
				if (hitResult && hitResult.location && hitResult.location._curve && hitResult.location._curve.count >=0) {
					if(last_wall != hitResult.location._curve.count) {
						var difference = Math.abs(hitResult.location._curve.count - last_wall);
						last_wall = hitResult.location._curve.count;
						openings[count].position = point;
						if(difference===2)
							openings[count].rotation +=  180;
						else
							openings[count].rotation +=  90;
					}
					openings[count].wall = hitResult.location._curve.count;
					openings[count].dist = hitResult.point.getDistance(hitResult.location._curve._segment2.point);
					var current_wall_p1 = walls._curves[hitResult.location._curve.count]._segment1.point;
					var current_wall_p2 = walls._curves[hitResult.location._curve.count]._segment2.point;
					if(current_wall_p1.getDistance(point)>=openings[count].sizes.width/2 + 20 && current_wall_p2.getDistance(point)>=openings[count].sizes.width/2 + 20 ) {
						openings[count].position = point;
					}
			    	
			    	createOpeningDimension(openings[count])
		    	}	
			}
    	tool.onMouseDown = function(event){
    		if(openings[count].dimension) {
				openings[count].dimension.removeChildren();
				openings[count].dimension.remove();
			}
    		defaultEvent();
    		count++
    	}    	
    }

    var all_house = {};
    	all_house.wall_points = [];
    	all_house.openings = [];

    window.Export = function(){
    	for(var i=0,l=walls.segments.length;i<l;i++) {
    		all_house.wall_points[i] = walls.segments[i].point
    	}
    	for(var j=0,l=openings.length;j<l;j++) {
    		all_house.openings[j] = {};
    		all_house.openings[j].sizes = openings[j].sizes;
    		all_house.openings[j].type = openings[j].type;
    		all_house.openings[j].wall = openings[j].wall;
    		all_house.openings[j].dist = Number(openings[j].dist.toFixed(1));
    	}
    	console.log(all_house)
    }
	window.RemoveOpening = function(){
		if(opening_dimension) {
			opening_dimension.removeChildren();
			opening_dimension.remove();
		}
		if(selected && selected.wall>=0) {
			if(selected.dimension) {
				selected.dimension.removeChildren();
				selected.dimension.remove();
			}
			for(var i=0,l=openings.length;i<l;i++){
				if(openings[i] && openings[i].id === selected.id) {
					openings[i].remove();
					openings.splice(i,1);
					count--
				}
			}
			paper.view.draw();
		}
	}
//	Local Functions
	var dimensions;
	function createDimension(walls) {
		for (var i = 0, l = walls.curves.length; i < l; i++) {
			walls.curves[i].count = i;
			var x_multiply = 1, y_multiply = 0;
			var justification = 'center'
			switch(i) {
			    case 0:
			    	x_multiply = -1; y_multiply = 0;
			    	justification = 'right';
			        break;
			    case 1:
			    	x_multiply = 0; y_multiply = -1;
			    	justification = 'center';
			        break;
			    case 2:
			    	x_multiply = 1; y_multiply = 0;
			    	justification = 'left';
			        break;
			    case 3:
			    	x_multiply = 0; y_multiply = 1;
			    	justification = 'center';
			        break;
			}
			var from = new paper.Point(walls.curves[i]._segment1.point.x - 20*y_multiply,walls.curves[i]._segment1.point.y + 20*x_multiply);
			var to = new paper.Point(walls.curves[i]._segment2.point.x + 20*y_multiply,walls.curves[i]._segment2.point.y - 20*x_multiply);

			if(walls.curves[i].dimension) {
				walls.curves[i].dimension.removeChildren();
				walls.curves[i].dimension.remove();
				walls.curves[i].text.remove();
			}

			walls.curves[i].dimension = new paper.CompoundPath({
			    children: [
			        new paper.Path.Line({
						    from: [from.x + dimension_offset * x_multiply , from.y + dimension_offset * y_multiply],
						    to:  [to.x + dimension_offset * x_multiply, to.y + dimension_offset * y_multiply]
						}),
			        new paper.Path.Line({
						    from: [from.x + dimension_offset * x_multiply , from.y + dimension_offset * y_multiply],
						    to:  from
						}),
			        new paper.Path.Line({
						    from: [to.x + dimension_offset * x_multiply , to.y + dimension_offset * y_multiply],
						    to:  to
						})
			    ],
			    strokeColor: '#666666',
			    strokeWidth:1
			});
			walls.curves[i].dimension.children[0].scale(1.03,1.03);
			walls.curves[i].dimension.children[1].scale(1.6,1.6);
			walls.curves[i].dimension.children[2].scale(1.6,1.6);
			walls.curves[i].text = new paper.PointText({
				    point: [(from.x + to.x) / 2 + (dimension_offset) * x_multiply , (from.y + to.y) / 2 + (dimension_offset) * y_multiply],
				    content: from.getDistance(to),
				    fontSize: 16,
				    fillColor: '#666666',
				    justification: justification
				})
		};
		return dimensions;
	}

	function createOpeningDimension(opening) {
		var x_multiply = 1, y_multiply = 0;
			var justification = 'center'
			switch(opening.wall) {
			    case 0:
			    	x_multiply = -1; y_multiply = 0;
			    	justification = 'right';
			        break;
			    case 1:
			    	x_multiply = 0; y_multiply = -1;
			    	justification = 'center';
			        break;
			    case 2:
			    	x_multiply = 1; y_multiply = 0;
			    	justification = 'left';
			        break;
			    case 3:
			    	x_multiply = 0; y_multiply = 1;
			    	justification = 'center';
			        break;
			}
			if(opening_dimension) {
				opening_dimension.removeChildren();
				opening_dimension.remove();
			}
			var i = opening.wall;
			var from = new paper.Point(walls.curves[i]._segment1.point.x - 20*y_multiply,walls.curves[i]._segment1.point.y + 20*x_multiply);
			var to = new paper.Point(walls.curves[i]._segment2.point.x + 20*y_multiply,walls.curves[i]._segment2.point.y - 20*x_multiply);
			var dimension_offset = -60;

			var d1_offset = new paper.Point(from.x + dimension_offset * x_multiply , from.y + dimension_offset * y_multiply);
			var d2_offset = new paper.Point(to.x + dimension_offset * x_multiply, to.y + dimension_offset * y_multiply);

			var to1 =  new paper.Point(opening.position.x - 60 * x_multiply + opening.sizes.width/2 * y_multiply, opening.position.y - 60 * y_multiply  + opening.sizes.width/2 * x_multiply);
			var to2 =  new paper.Point(opening.position.x - 60 * x_multiply - opening.sizes.width/2 * y_multiply, opening.position.y - 60 * y_multiply  - opening.sizes.width/2 * x_multiply)

			var d1_tod2 = d1_offset.getDistance(d2_offset);
			var d1_to1 = d1_offset.getDistance(to1);
			var d2_to2 = d2_offset.getDistance(to2);
			var d2_to1 = d2_offset.getDistance(to1);
			var d1_to2 = d1_offset.getDistance(to2);


			var good_dim1 = 0;
			var good_dim2 = 0;
			if(d1_tod2 === d1_to1 + d2_to2 + opening.sizes.width) {
				good_dim1 = d1_to1;
				good_dim2 = d2_to2;
			} else {
				good_dim1 = d2_to1;
				good_dim2 = d1_to2;
			}

			opening_dimension = new paper.Group({
			    children: [
			        new paper.Path.Line({
						    from: d1_offset,
						    to: d2_offset,
			    strokeColor: '#666666',
			    strokeWidth:1
						}),
			        new paper.Path.Line({
						    from: [opening.position.x + opening.sizes.width/2 * y_multiply, opening.position.y + opening.sizes.width/2 * x_multiply],
						    to:  to1,
			    strokeColor: '#666666',
			    strokeWidth:1
						}),
			        new paper.Path.Line({
						    from: [opening.position.x - opening.sizes.width/2 * y_multiply, opening.position.y - opening.sizes.width/2 * x_multiply],
						    to:  to2,
			    strokeColor: '#666666',
			    strokeWidth:1
						}),
			        new paper.PointText({
					    point: [opening.position.x - 60 * x_multiply, opening.position.y - 60 * y_multiply],
					    content:  opening.sizes.width,
					    fontSize: 16,
					    fillColor: '#666666',
					    justification: justification
					}),
					new paper.PointText({
					    point: [opening.position.x - 60 * x_multiply + (opening.sizes.width/2 + 20) * y_multiply, opening.position.y - 60 * y_multiply + (opening.sizes.width/2 + 20) * x_multiply],
					    content:  good_dim1.toFixed(0),
					    fontSize: 16,
					    fillColor: '#666666',
					    justification: justification
					}),
					new paper.PointText({
					    point: [opening.position.x - 60 * x_multiply - (opening.sizes.width/2 + 20) * y_multiply, opening.position.y - 60 * y_multiply - (opening.sizes.width/2 + 20) * x_multiply],
					    content:  good_dim2.toFixed(0),
					    fontSize: 16,
					    fillColor: '#666666',
					    justification: justification
					})
			    ]
			});
	}

    var addWalls = function(){
		var point = new paper.Point(0, 0);
		var size = new paper.Size(400, 500);
			walls = new paper.Path.Rectangle(point, size);
			walls.style = {
			    fillColor: '#E0F0FF',
			    strokeColor: '#2E2E1C',
			    strokeWidth: 40
			};
		walls.position = new paper.Point(paper.view.center.x, paper.view.center.y);

		for (var i = 0, l = walls.curves.length; i < l; i++) {
			walls.curves[i].count = i;

		};
		createDimension(walls)
		walls.sendToBack()
		paper.view.draw();
    }
    addWalls();
	var updateWalls = function(newWidth, newHeight, floor) {
    	checkDrawFailure();
    	if (!isNaN(Number(newWidth)) && Number(newWidth)!=0) {
    		var value = Number(newWidth) / 2;   
    		//	Upper Left
    		walls._segments[1].point.x = -value + paper.view.center.x;
    		//	Lower Left
    		walls._segments[0].point.x = -value + paper.view.center.x;
    		//	Upper Right
    		walls._segments[2].point.x = value + paper.view.center.x;
    		//	Lower Right
    		walls._segments[3].point.x = value + paper.view.center.x;

    		updateOpening();
    	}
    	if (!isNaN(Number(newHeight)) && Number(newHeight)!=0) {
    		var value = Number(newHeight) / 2;
    		//	Upper Left
    		walls._segments[1].point.y = -value + paper.view.center.y;
    		//	Lower Left
    		walls._segments[0].point.y = value + paper.view.center.y;
    		//	Upper Right
    		walls._segments[2].point.y = -value + paper.view.center.y;
    		//	Lower Right
    		walls._segments[3].point.y = value + paper.view.center.y;

    		updateOpening();
    	}

    	paper.view.draw();
	}
    var updateOpening = function () {
    	for (var i=0,l=openings.length;i<l;i++) {
    		if (walls.curves[openings[i].wall]._segment2._point._x === walls.curves[openings[i].wall]._segment1._point._x) {
    			openings[i].position.x = walls.curves[openings[i].wall]._segment2._point._x;
    		} else {
    			openings[i].position.y = walls.curves[openings[i].wall]._segment2._point._y;
    		}
    	}
    }
    var fill_menu = function (field, value) {
    	//field can be "width", "height", "floor", "wall", "dist"
    	document.getElementsByName(field)[0].value = value
    }
    fill_menu("width",undefined);
	fill_menu("height",undefined);
	fill_menu("floor",undefined);
	fill_menu("wall",undefined);
	fill_menu("dist",undefined);
    var updatePaper = function(){ paper.view.draw(); }
	var round10 = function(x) { return Math.ceil(x/10)*10; }
	var getWallsCurveByCount = function(count) {
		for (var i = 0, l = walls.curves.length; i < l; i++) {
			if(walls.curves[i].count === count)
				return walls.curves[i];
		};
	}
    var checkDrawFailure = function() {
    	if(openings.length!=count) {
    		openings[openings.length-1].remove();
    	}
    	if(selected && selected.dimension) {
				selected.dimension.removeChildren();
				selected.dimension.remove();
			}
    	/*
    	if (selected && selected.selected) {
			selected.selected = false;
		}*/
    }
//	Events
    var defaultEvent = function() {
	    tool.onMouseMove = function(event) { return; }
		tool.onMouseDown = function(event) { 
			if(opening_dimension) {
				opening_dimension.removeChildren();
				opening_dimension.remove();
			}
			hitResult = paper.project.hitTest(event.point, {fill:true, stroke: true, tolerance:3});
			if(hitResult) { // something selected
				if (selected && selected.selected) {
					selected.selected = false;
				}
				if (hitResult.item.type || hitResult.item._parent.type) {  // window or door
					createOpeningDimension(hitResult.item);
					var this_one = undefined;
					if(hitResult.item.type)
						this_one = hitResult.item;
					else if(hitResult.item._parent.type)
						this_one = hitResult.item._parent;
					selected = this_one;
					selected.selected = true;
					fill_menu("width",this_one.sizes.width);
					fill_menu("height",this_one.sizes.height);
					if (this_one.sizes.floor) {
						fill_menu("floor",this_one.sizes.floor);
					} else {
						fill_menu("floor",undefined);
					}
					fill_menu("wall",hitResult.item.wall);
					if(hitResult.item.dist) fill_menu("dist",Number(hitResult.item.dist.toFixed(2)));
				} else { // wall
					selected = hitResult.item;
					fill_menu("width",hitResult.item._segments[2]._point._x - hitResult.item._segments[1]._point._x);
					fill_menu("height",hitResult.item._segments[0]._point._y - hitResult.item._segments[1]._point._y);
					fill_menu("floor",hitResult.item.style.strokeWidth);
					fill_menu("wall",undefined);
					fill_menu("dist",undefined);
					selected.selected = true;
				}
			}  else {
				if (selected && selected.selected) {
						selected.selected = false;
					}
					selected = undefined;
					fill_menu("width",undefined);
					fill_menu("height",undefined);
					fill_menu("floor",undefined);
					fill_menu("wall",undefined);
					fill_menu("dist",undefined);
				}
			return };
		tool.onMousUp = function(event) { return };
    }
    defaultEvent();
	tool.onMouseDrag = function(event) {
		if(opening_dimension) {
			opening_dimension.removeChildren();
			opening_dimension.remove();
		}
		if (selected && selected.selected) {
			selected.selected = false;
		}
		if (hitResult && hitResult.location && hitResult.location._curve.count>=0){ // walls
			if (hitResult.location._segment1.point.x - hitResult.location._segment2.point.x === 0) {
				hitResult.location._segment1.point.x = hitResult.location._segment2.point.x = round10(event.point.x);
				for(var i=0,l=openings.length;i<l;i++) {
					if(hitResult.location._curve.count === openings[i].wall) {
						openings[i].position.x = round10(event.point.x);
					}
				}
				
			} else {
				hitResult.location._segment1.point.y = hitResult.location._segment2.point.y = round10(event.point.y);
				for(var i=0,l=openings.length;i<l;i++) {
					if(hitResult.location._curve.count === openings[i].wall) {
						openings[i].position.y =round10(event.point.y);
					}
				}
			}
			selected = hitResult.item;
			selected.selected = true;
			fill_menu("width",hitResult.item._segments[2]._point._x - hitResult.item._segments[1]._point._x);
			fill_menu("height",hitResult.item._segments[0]._point._y - hitResult.item._segments[1]._point._y);
			createDimension(walls)
		} else if(hitResult && hitResult.item) {
			if (hitResult.item.type) { // window or door
				//console.log(hitResult.item.position.getDistance(getWallsCurveByCount(hitResult.item.wall)._segment2.point))
				//console.log(hitResult.item.position.getDistance(getWallsCurveByCount(hitResult.item.wall)._segment1.point))
				createOpeningDimension(hitResult.item);
				hitResult.item.dist = hitResult.item.position.getDistance(getWallsCurveByCount(hitResult.item.wall)._segment2.point);
				if (hitResult.item.wall === 0 || hitResult.item.wall === 2) {
					hitResult.item.position.y = (event.point.y);
				} else {
					hitResult.item.position.x = (event.point.x);
				}
				selected = hitResult.item;
				selected.selected = true;

				fill_menu("wall",hitResult.item.wall);
				fill_menu("dist",Number(hitResult.item.dist.toFixed(2)));
			}
		}
	}

    return animate2D;
});