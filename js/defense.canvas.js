//var board = [];
var WIDTH = 40;
var HEIGHT = 25;
var SIZE = 16;
var startPoint = [0,10];
var endPoint = [39,10]
var road = [[0,11], [0,12], [1,12], [2,12], [3,12], [4,12], [5,12],
			[5,11], [5,10], [5,9],  [5,8],  [5,7],  [6,7],  [7,7],
			[8,7],  [9,7],  [10,7], [11,7], [12,7], [13,7], [13,8],
			[13,9], [13,10],[13,11],[13,12],[13,13],[13,14],[14,14],
			[15,14],[16,14],[17,14],[18,14],[19,14],[20,14],[21,14],
			[22,14],[23,14],[24,14],[25,14],[26,14],[27,14],[28,14],
			[29,14],[29,13],[29,12],[29,11],[29,10],[29,10],[30,10],
			[31,10],[32,10],[33,10],[34,10],[35,10],[36,10],[37,10],
			[38,10]];
var enemies = [];

var block = function(x,y,color,c) {
	c.fillStyle = color;
	c.fillRect(x*SIZE, y*SIZE, SIZE, SIZE);
};
var triangle = function(x,y,color,c) {
	c.beginPath();
	c.moveTo(x*SIZE+2, y*SIZE+SIZE-2);
	c.lineTo(x*SIZE+SIZE/2, y*SIZE+2);
	c.lineTo(x*SIZE+SIZE-2, y*SIZE+SIZE-2);
	c.lineTo(x*SIZE+2, y*SIZE+SIZE-2);

	c.fillStyle = color;
	c.strokeStyle = color;
	c.fill();
	c.stroke();
	c.closePath();
};
var circle = function(x,y,color,c) {
	c.beginPath();
	c.arc(x*SIZE+SIZE/2+1, y*SIZE+SIZE/2+1, SIZE/2-3, 0, Math.PI*2, false)	;
	c.fillStyle = color;
	c.strokeStyle = color;
	c.fill();
	c.stroke();
	c.closePath();
};
var drawGrid = function(c) {
	c.beginPath();

	for (var i=1; i<WIDTH; i++) {
		c.moveTo(i*SIZE, 0);
		c.lineTo(i*SIZE, HEIGHT*SIZE);
	}
	for (var i=1; i<HEIGHT; i++) {
		c.moveTo(0, i*SIZE);
		c.lineTo(WIDTH*SIZE, i*SIZE);
	}

	c.strokeStyle = $('body').css('background-color');
	c.stroke();
	c.closePath();
};
var drawActionPoints = function(c) {
	block(startPoint[0], startPoint[1], 'green', c);
	block(endPoint[0], endPoint[1], 'red', c);
};
var drawRoad = function(c) {
	for (var i in road) {
		var x = road[i][0];
		var y = road[i][1];

		block(x, y, 'yellow', c);
	}
};
var drawEnemies = function(c) {
	for (var i in enemies) {
		var x = enemies[i].position[0];
		var y = enemies[i].position[1];
		var type = enemies[i].type;

		if (type === 'basic') {
			triangle(x,y,'black',c);
		} else if (type === 'medium') {
			circle(x,y,'black',c);
		}
	}
};
var arrEqual = function(a,b) {
	return !(a<b || b<a);
}
var createBasicEnemy = function() {
	var enemy = {
		type: 'basic',
		speed: 10,
		moveCounter: 10,
		position: startPoint,
		prevPosition: startPoint
	};

	return enemy;
};
var createMediumEnemy = function() {
	var enemy = {
		type: 'medium',
		speed: 5,
		moveCounter: 5,
		position: startPoint,
		prevPosition: startPoint
	};

	return enemy;
};
var moveEnemy = function(enemy) {
	var x = enemy.position[0];
	var y = enemy.position[1];
	var nextBlock;
	var candidates = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]];

	enemy.moveCounter--;

	if (enemy.moveCounter) {
		return;
	}

	enemy.moveCounter = enemy.speed;

	for (var i=0; i<candidates.length; i++) {
		var candidate = candidates[i];

		if (arrEqual(candidate, enemy.prevPosition)) {
			continue;
		}

		for (var j=0; j<road.length; j++) {

			if (arrEqual(candidate, road[j])) {
				nextBlock = candidate;
				break;
			}
		}

		if (nextBlock) {
			break;
		}
	}

	enemy.prevPosition = enemy.position;
	enemy.position = nextBlock;

	if (arrEqual(enemy.position, endPoint)) {
		for (var i in enemies) {
			if (enemy === enemies[i]) {
				enemies.splice(i, 1);
			}
		}
	}
};

var update = function(context) {
	drawGrid(context);
	drawActionPoints(context);
	drawRoad(context);
	drawEnemies(context);
};

var move = function() {
	for (var i in enemies) {
		moveEnemy(enemies[i]);
	}
};

$(function() {
	var context = $('#game').get(0).getContext('2d');

	$('#game').attr('width',WIDTH*SIZE).attr('height',HEIGHT*SIZE);

	enemies.push(createBasicEnemy());
	enemies.push(createMediumEnemy());

	update(context);

	setInterval(function() {
		move();
		update(context);
	}, 200);
});

