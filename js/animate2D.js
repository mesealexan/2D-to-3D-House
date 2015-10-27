define(["paper"], function(paper){
    var animate2D = {
        canvas: undefined,
        updateWall: update
    };
    //	Set up paper
    
	var openings_menu = document.getElementById('props');
    canvas = document.getElementById('paperCanvas');
    
    paper.setup(canvas);
    var wall_thick = 40;
    var walls;
    var selected = undefined;
    var lastPoint = paper.view.center;

	window.onresize = function() {
		paper.view.setViewSize(canvas.clientWidth, canvas.clientHeight);
		paper.view.scrollBy(lastPoint.subtract(paper.view.center));
		lastPoint = paper.view.center;
	}

	var tool = new paper.Tool();

    addWalls();

    var updateOpening = function (value, axis, angle) {
		for (var i = openings.length - 1; i >= 0; i--) {
			if (openings[i].rotation != angle) {
				var number = openings[i].position[axis] - paper.view.center[axis];
    			var sign = number?number<0?-1:1:0;
    			openings[i].position[axis] = sign*value + paper.view.center[axis];
			};
		};	
		for (var j = openings.length - 1; j >= 0; j--) {
			if (openings[j].rotation != angle) {
				var number = openings[j].position[axis] - paper.view.center[axis];
    			var sign = number?number<0?-1:1:0;
    			openings[j].position[axis] = sign*value + paper.view.center[axis];
			};
		};
    }
    var updatePaper = function(){
    	paper.view.draw();
    }
	window.updateThis = function(width,height,floor) {
		updatePaper();
		if (selected && selected._type) {
			if (Number(width)) { selected._size.height = Number(width);}
			if (Number(height)) { selected._size.Width = Number(height); }
			if (Number(floor)) { selected._size.Floor = Number(floor); }	
		} else {
			if (Number(width)) { update(width,height,floor) }
			if (Number(height)) { update(width,height,floor) }
			if (Number(floor)) { return }	

		}
		updatePaper();
	}
    var update = function(newWidth,newHeight,newThick) {
    	checkDrawFailure();
    	if (!isNaN(Number(newWidth)) && Number(newWidth)!=0) {
    		var value = Number(newWidth) / 2;   
    		updateOpening(value,'x', 90);
    		//	Upper Left
    		walls._segments[1].point.x = value + paper.view.center.x;
    		//	Lower Left
    		walls._segments[0].point.x = value + paper.view.center.x;
    		//	Upper Right
    		walls._segments[2].point.x = -value + paper.view.center.x;
    		//	Lower Right
    		walls._segments[3].point.x = -value + paper.view.center.x;
    	}
    	if (!isNaN(Number(newHeight)) && Number(newHeight)!=0) {
    		var value = Number(newHeight) / 2;
    		updateOpening(value,'y', 0);
    		//	Upper Left
    		walls._segments[1].point.y = value + paper.view.center.y;
    		//	Lower Left
    		walls._segments[0].point.y =- value + paper.view.center.y;
    		//	Upper Right
    		walls._segments[2].point.y = value + paper.view.center.y;
    		//	Lower Right
    		walls._segments[3].point.y = -value + paper.view.center.y;
    	}
    	if (!isNaN(Number(newThick)) && Number(newThick)!=0) {
    		walls.setStrokeWidth(Number(newThick));
    		    	//	Update openings
	    	for (var i = openings.length - 1; i >= 0; i--) {
	    		openings[i]._size.width = Number(newThick) -2;
	    	};
	    	for (var i = openings.length - 1; i >= 0; i--) {
	    		openings[i]._size.width = Number(newThick) -2;
	    	};
    	}
    	paper.view.draw();
    }

    window.updateWalls = update;

	clearEvents();

    function clearEvents() {
	    tool.onMouseMove = function(event) { return; }
		tool.onMouseDown = function(event) { 
			var hitResult = paper.project.hitTest(event.point, {fill:true, stroke: true, tolerance:30});
			if(hitResult) {
				
				if (hitResult.item && hitResult.type === 'fill' && hitResult.item._size) { 
					selected = hitResult.item;
					openings_menu.children[1].value = hitResult.item._size.height;
					openings_menu.children[5].value = hitResult.item._size.Width;
					openings_menu.children[9].value = hitResult.item._size.Floor;
					openings_menu.children[13].value = hitResult.item.wall;
					openings_menu.children[16].value = Number(hitResult.item.dist.toFixed(2));

				} else if(hitResult.item && hitResult.type === 'stroke'){
					selected = hitResult.item;
					openings_menu.children[1].value = (hitResult.item._segments[2]._point._x - hitResult.item._segments[1]._point._x);
					openings_menu.children[5].value = (hitResult.item._segments[0]._point._y - hitResult.item._segments[1]._point._y);
					openings_menu.children[9].value = hitResult.item.style.strokeWidth;
					openings_menu.children[13].value = undefined;
					openings_menu.children[16].value = undefined;
				}
			}  else {
					selected = undefined;
					openings_menu.children[1].value = undefined;
					openings_menu.children[5].value = undefined;
					openings_menu.children[9].value = undefined;
					openings_menu.children[13].value = undefined;
					openings_menu.children[16].value = undefined;
				}
			return };
		tool.onMousUp = function(event) { return };
    }




	tool.onMouseDrag = function(event) {
		move(event);
	}
	function round10(x)
	{
	    return Math.ceil(x/10)*10;
	}
	function getWallsCurveByCount(count) {
		for (var i = 0, l = walls.curves.length; i < l; i++) {
			if(walls.curves[i].count === count)
				return walls.curves[i];
		};
	}
	var openig_selected = undefined;
	var move = function(event) { 
		var hitResult = paper.project.hitTest(event.point, {segments: true, stroke: true, fill: true, tolerance:20});
		if (hitResult && hitResult.location){ // walls
			if (hitResult.location._segment1.point.x - hitResult.location._segment2.point.x === 0) {
				hitResult.location._segment1.point.x = hitResult.location._segment2.point.x = round10(event.point.x);
				for(var i=0,l=openings.length;i<l;i++) {
					if(Math.abs(event.point.x - openings[i].position.x) < walls._style._values.strokeWidth) {
						openings[i].position.x = round10(event.point.x);
					}
				}
				for(var j=0,k=openings.length;j<k;j++) {
					if(Math.abs(event.point.x - openings[j].position.x) < walls._style._values.strokeWidth) {
						openings[j].position.x = round10(event.point.x);
					}
				}
				
			} else {
				hitResult.location._segment1.point.y = hitResult.location._segment2.point.y = round10(event.point.y);
				for(var i=0,l=openings.length;i<l;i++) {
					if(Math.abs(event.point.y - openings[i].position.y) < walls._style._values.strokeWidth) {
						openings[i].position.y =round10(event.point.y);
					}
				}
				for(var j=0,k=openings.length;j<k;j++) {
					if(Math.abs(event.point.y - openings[j].position.y) < walls._style._values.strokeWidth) {
						openings[j].position.y = round10(event.point.y);
					}
				}
			}
			openings_menu.children[1].value = Math.abs(hitResult.item._segments[2]._point._x - hitResult.item._segments[1]._point._x);
			openings_menu.children[5].value = Math.abs(hitResult.item._segments[0]._point._y - hitResult.item._segments[1]._point._y);
		} else if(hitResult && hitResult.item) {
			if (hitResult.item.type) { // window or door
				hitResult.item.dist = hitResult.item.position.getDistance(getWallsCurveByCount(hitResult.item.wall)._segment2.point)
				if (hitResult.item.rotation!=90) {
					hitResult.item.position.y = round10(event.point.y);
				} else {
					hitResult.item.position.x = round10(event.point.x);
				}
				openig_selected = hitResult.item;

				openings_menu.children[13].value = hitResult.item.wall;
				openings_menu.children[16].value = Number(hitResult.item.dist.toFixed(2));
			}
		}
	}


	window.removeOpening = function(){
		if(selected && selected.wall>=0) {
			for(var i=0,l=openings.length;i<l;i++){
				if(openings[i].id === selected.id) {
					openings[i].remove();
					openings.splice(i,1);
					count--
				}
			}
			updatePaper();
		}
	}

	var current_window;
	var openings = [];
	var count = 0;
    function checkDrawFailure() {
    	if(openings.length!=count) {
    		openings[openings.length-1].remove();
    	}
    }
    window.addWindow = function(){	
    	checkDrawFailure();
    	var point = new paper.Point(0, 0);
		var size = new paper.Size(walls._style._values.strokeWidth/3, 120);
		openings[count] = new paper.Shape.Rectangle(point, size);
		openings[count].type = 1;
		openings[count].style = {
		    fillColor: '#FFF',
		    strokeColor: '#000',
		    strokeWidth: 1,
		    strokeJoin: 'miter'
		};
		current_window = openings[count];
		current_window._size.Width = 120;
		current_window._size.Floor = 90;

		var rotation = 0;
		tool.onMouseMove = function(event){
			var nearest = walls.getNearestPoint(event.point);
			var point =  new paper.Point(Math.round(nearest.x), Math.round(nearest.y));
			var hitResult = walls.hitTest(event.point, {stroke: true, tolerance:100});
			if (hitResult) {
				if (hitResult.location && hitResult.location._segment1._point.y == hitResult.location._segment2._point.y) {rotation = 90;}
				else {rotation = 0;} 
				openings[count].rotation = rotation;
				openings[count].wall = hitResult.location._curve.count;
				openings[count].dist = hitResult.point.getDistance(hitResult.location._curve._segment2.point);
			}
	    	openings[count].position = point;
    	}	
    	tool.onMouseDown = function(event){
    		clearEvents();
    		count++
    	}
    }
    window.addDoor = function(){	
    	checkDrawFailure()
    	var point = new paper.Point(0, 0);
		var size = new paper.Size(walls._style._values.strokeWidth-2, 80);
			openings[count] = new paper.Shape.Rectangle(point, size);
			openings[count].type = 2;
			openings[count].style = {
			    fillColor: '#FFF',
			    strokeColor: '#2E2E1C',
			    strokeWidth: 1
			};
			openings[count]._size.Width = 210;
			current_door = openings[count];
		tool.onMouseMove = function(event){
	    	var nearest = walls.getNearestPoint(event.point);
			var point =  new paper.Point(Math.round(nearest.x), Math.round(nearest.y));
			var hitResult = walls.hitTest(event.point, {stroke: true, tolerance:10000});
			if (hitResult) {
				if (hitResult.location && hitResult.location._segment1._point.y == hitResult.location._segment2._point.y) {rotation = 90;}
				else {rotation = 0;} 
				openings[count].rotation = rotation;
				openings[count].wall = hitResult.location._curve.count;
				openings[count].dist = hitResult.point.getDistance(hitResult.location._curve._segment2.point);
			}
	    	openings[count].position = point;
    	}	
    	tool.onMouseDown = function(event){
    		count++
    		clearEvents()
    	}
    }
    function addWalls(){
		var point = new paper.Point(0, 0);
		var size = new paper.Size(400, 500);
			walls = new paper.Path.Rectangle(point, size);
			walls.style = {
			    fillColor: '#E0F0FF',
			    strokeColor: '#2E2E1C',
			    strokeWidth: wall_thick
			};
		walls.position = new paper.Point(paper.view.center.x, paper.view.center.y);
		for (var i = 0, l = walls.curves.length; i < l; i++) {
			walls.curves[i].count = i;
			addDimensionLine(walls.curves[i]._segment1.point, walls.curves[i]._segment2.point, 20, count);
		};
		
		paper.view.draw();
    }

    function addDimensionLine(from,to,offset, identifier) {
    	/*
    	offset = wall_thick/2 + offset
    	if(from.x === to.x) {
    		if(from.y >= to.y) {
	 	      	var from = new paper.Point(from.x + offset, from.y - wall_thick/2);
				var to =new paper.Point(to.x + offset, to.y + wall_thick/2); 			
    		} else {
				var from = new paper.Point(from.x - offset, from.y + wall_thick/2);
				var to =new paper.Point(to.x - offset, to.y - wall_thick/2); 
    		}  
    	} else {
    		if(from.x >= to.x) {
	 	      	var from = new paper.Point(from.x - wall_thick/2, from.y - offset);
				var to = new paper.Point(to.x + wall_thick/2, to.y - offset); 	
    		} else {
    			var from = new paper.Point(from.x + wall_thick/2, from.y + offset);
				var to = new paper.Point(to.x - wall_thick/2, to.y + offset); 
    		}
    	}
    			var path = new paper.Path.Line(from, to);
				path.strokeColor = '#333';
				path.count = identifier;
				path.strokeWidth = 1; 
				*/
    }

    return animate2D;
});