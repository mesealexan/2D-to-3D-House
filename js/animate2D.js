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

	var points_to_measure = [];
//	Global functions
	window.onresize = function() {
		paper.view.setViewSize(canvas.clientWidth, canvas.clientHeight);
		paper.view.scrollBy(lastPoint.subtract(paper.view.center));
		lastPoint = paper.view.center;
	}  
	window.update = function(width,height,floor) {
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
		} else {	// wall
			if (Number(width)) { updateWalls(width,height,floor) }
			if (Number(height)) { updateWalls(width,height,floor) }
			if (Number(floor)) { return }	
		}

		paper.view.draw();
	}	 
	window.addOpening = function(type) {
		if(selected) {
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
			var nearest = walls.getNearestPoint(event.point);
			var point =  new paper.Point(nearest.x, nearest.y);
			var hitResult = walls.hitTest(event.point, {stroke: true, tolerance:1000});
			if (hitResult && hitResult.location && hitResult.location._curve && hitResult.location._curve.count >=0) {
				if(last_wall != hitResult.location._curve.count) {
					var difference = Math.abs(hitResult.location._curve.count - last_wall);
					last_wall = hitResult.location._curve.count;
					if(difference===2)
						openings[count].rotation +=  180;
					else
						openings[count].rotation +=  90;
				}
				openings[count].wall = hitResult.location._curve.count;
				openings[count].dist = hitResult.point.getDistance(hitResult.location._curve._segment2.point);
			}
	    	openings[count].position = point;
    	}	
    	tool.onMouseDown = function(event){
    		defaultEvent();
    		count++
    	}    	
    }
	window.removeOpening = function(){
		if(selected && selected.wall>=0) {
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
			points_to_measure[i] =  walls.segments[i].point;
			walls.curves[i].count = i;
		};
		points_to_measure[points_to_measure.length] = points_to_measure[0];
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
    	/*
    	if (selected && selected.selected) {
			selected.selected = false;
		}*/
    }
//	Events
    var defaultEvent = function() {
	    tool.onMouseMove = function(event) { return; }
		tool.onMouseDown = function(event) { 
			hitResult = paper.project.hitTest(event.point, {fill:true, stroke: true, tolerance:3});
			if(hitResult) { // something selected
				if (selected && selected.selected) {
					selected.selected = false;
				}
				if (hitResult.item.type || hitResult.item._parent.type) {  // window or door
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
		} else if(hitResult && hitResult.item) {
			if (hitResult.item.type) { // window or door
				hitResult.item.dist = hitResult.item.position.getDistance(getWallsCurveByCount(hitResult.item.wall)._segment2.point);
				if (hitResult.item.wall === 0 || hitResult.item.wall === 2) {
					hitResult.item.position.y = round10(event.point.y);
				} else {
					hitResult.item.position.x = round10(event.point.x);
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