define(["paper"], function(paper){
    var animate2D = {
        canvas: undefined,
        updateWall: update
    };
    //	Set up paper
    
	var openings_menu = document.getElementById('props');
    canvas = document.getElementById('paperCanvas');
    
    paper.setup(canvas);
    
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
		for (var i = windows.length - 1; i >= 0; i--) {
			if (windows[i].rotation != angle) {
				var number = windows[i].position[axis] - paper.view.center[axis];
    			var sign = number?number<0?-1:1:0;
    			windows[i].position[axis] = sign*value + paper.view.center[axis];
			};
		};	
		for (var j = doors.length - 1; j >= 0; j--) {
			if (doors[j].rotation != angle) {
				var number = doors[j].position[axis] - paper.view.center[axis];
    			var sign = number?number<0?-1:1:0;
    			doors[j].position[axis] = sign*value + paper.view.center[axis];
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
			console.log(width,height,floor)
			if (Number(width)) { update(width,height,floor) }
			if (Number(height)) { update(width,height,floor) }
			if (Number(floor)) { update(width,height,floor) }	

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
    		    	//	Update doors
	    	for (var i = doors.length - 1; i >= 0; i--) {
	    		doors[i]._size.width = Number(newThick) -2;
	    	};
	    	for (var i = windows.length - 1; i >= 0; i--) {
	    		windows[i]._size.width = Number(newThick) -2;
	    	};
    	}
    	paper.view.draw();
    }

    window.updateWalls = update;

	clearEvents();

    function clearEvents() {
	    tool.onMouseMove = function(event) { return; }
		tool.onMouseDown = function(event) { 
			var hitResult = paper.project.hitTest(event.point, {fill: true, tolerance:30});
			if(hitResult) {
				if (hitResult.item && hitResult.item.type) { 
					selected = hitResult.item;
				} else {
					selected = hitResult.item;
					openings_menu.children[1].value = Math.abs(hitResult.item._segments[2]._point._x - hitResult.item._segments[1]._point._x);
					openings_menu.children[5].value = Math.abs(hitResult.item._segments[0]._point._y - hitResult.item._segments[1]._point._y);
					openings_menu.children[9].value = hitResult.item.style.strokeWidth;
				}
			}  else {
					selected = undefined;
					openings_menu.children[1].value = "N/A";
					openings_menu.children[5].value = "N/A";
					openings_menu.children[9].value = "N/A";
				}
			return };
		tool.onMousUp = function(event) { return };
    }

    function checkDrawFailure() {
    	if(doors.length!=doorCount) {
    		doors[doors.length-1].remove();
    	}
    	if(windows.length!=windowsCount) {
    		windows[windows.length-1].remove();
    	}
    }


	var windows = [];
	var windowsCount = 0;

	tool.onMouseDrag = function(event) {
		move(event);
	}

	var openig_selected = undefined;
	var move = function(event) { 
		var hitResult = paper.project.hitTest(event.point, {segments: true, stroke: true, fill: true, tolerance:20});
		if (hitResult && hitResult.location){ // walls
			if (hitResult.location._segment1.point.x - hitResult.location._segment2.point.x === 0) {
				hitResult.location._segment1.point.x = hitResult.location._segment2.point.x = event.point.x;
				for(var i=0,l=windows.length;i<l;i++) {
					if(Math.abs(event.point.x - windows[i].position.x) < walls._style._values.strokeWidth) {
						windows[i].position.x = event.point.x;
					}
				}
				for(var j=0,k=doors.length;j<k;j++) {
					if(Math.abs(event.point.x - doors[j].position.x) < walls._style._values.strokeWidth) {
						doors[j].position.x = event.point.x;
					}
				}
				
			} else {
				hitResult.location._segment1.point.y = hitResult.location._segment2.point.y = event.point.y;
				for(var i=0,l=windows.length;i<l;i++) {
					if(Math.abs(event.point.y - windows[i].position.y) < walls._style._values.strokeWidth) {
						windows[i].position.y = event.point.y;
					}
				}
				for(var j=0,k=doors.length;j<k;j++) {
					if(Math.abs(event.point.y - doors[j].position.y) < walls._style._values.strokeWidth) {
						doors[j].position.y = event.point.y;
					}
				}
			}
			openings_menu.children[1].value = Math.abs(hitResult.item._segments[2]._point._x - hitResult.item._segments[1]._point._x);
			openings_menu.children[5].value = Math.abs(hitResult.item._segments[0]._point._y - hitResult.item._segments[1]._point._y);
		} else if(hitResult && hitResult.item) {
			if (hitResult.item.type) { // window or door
				if (hitResult.item.rotation!=90) {
					hitResult.item.position.y = Math.round(event.point.y);
				} else {
					hitResult.item.position.x = Math.round(event.point.x);
				}
				openig_selected = hitResult.item;
			}
		}
	}



	var current_window;
    window.addWindow = function(){	
    	checkDrawFailure();
    	var point = new paper.Point(0, 0);
		var size = new paper.Size(walls._style._values.strokeWidth-2, 80);
		windows[windowsCount] = new paper.Shape.Rectangle(point, size);
		windows[windowsCount].type = 1;
		windows[windowsCount].style = {
		    fillColor: '#AEBACC',
		    strokeColor: '#2E2E1C',
		    strokeWidth: 2
		};
		current_window = windows[windowsCount];
		current_window._size.Width = 120;
		current_window._size.Floor = 90;
		current_window.onMouseDown = function(event) {
			openings_menu.children[1].value = this._size.height;
			openings_menu.children[5].value = this._size.Width;
			openings_menu.children[9].value = this._size.Floor;
		}
		var rotation = 0;
		tool.onMouseMove = function(event){
			var nearest = walls.getNearestPoint(event.point);
			var point =  new paper.Point(Math.round(nearest.x), Math.round(nearest.y));
			var hitResult = walls.hitTest(event.point, {stroke: true, tolerance:10000});
			if (hitResult) {
				if (hitResult.location && hitResult.location._segment1._point.y == hitResult.location._segment2._point.y) {rotation = 90;}
				else {rotation = 0;} 
				windows[windowsCount].rotation = rotation
			}
	    	windows[windowsCount].position = point;
    	}	
    	tool.onMouseDown = function(event){
    		clearEvents();
    		windowsCount++
    	}
    }

    var doors = [];
 	var doorCount = 0;
    window.addDoor = function(){	
    	checkDrawFailure()
    	var point = new paper.Point(0, 0);
		var size = new paper.Size(walls._style._values.strokeWidth-2, 80);
			doors[doorCount] = new paper.Shape.Rectangle(point, size);
			doors[doorCount].type = 2;
			doors[doorCount].style = {
			    fillColor: '#927944',
			    strokeColor: '#2E2E1C',
			    strokeWidth: 2
			};
			doors[doorCount]._size.Width = 210;
			current_door = doors[doorCount];
		current_door.onMouseDown = function(event) {
			openings_menu.children[1].value = this._size.height;
			openings_menu.children[5].value = this._size.Width;
			openings_menu.children[9].value = 'N/A';
		}
		tool.onMouseMove = function(event){
	    	var nearest = walls.getNearestPoint(event.point);
			var point =  new paper.Point(Math.round(nearest.x), Math.round(nearest.y));
			var hitResult = walls.hitTest(event.point, {stroke: true, tolerance:10000});
			if (hitResult) {
				if (hitResult.location && hitResult.location._segment1._point.y == hitResult.location._segment2._point.y) {rotation = 90;}
				else {rotation = 0;} 
				doors[doorCount].rotation = rotation
			}
	    	doors[doorCount].position = point;
    	}	
    	tool.onMouseDown = function(event){
    		doorCount++
    		clearEvents()
    	}
    }

    function addWalls(){
		var point = new paper.Point(0, 0);
		var size = new paper.Size(350, 500);
			walls = new paper.Path.Rectangle(point, size);
			walls.style = {
			    fillColor: '#E0F0FF',
			    strokeColor: '#2E2E1C',
			    strokeWidth: 35
			};
		walls.position = new paper.Point(paper.view.center.x, paper.view.center.y);
		paper.view.draw();

    }

    return animate2D;
});