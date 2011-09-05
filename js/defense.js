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
var weapons = [];
var currentWeapon = null;
var player = {
	health: 100,
	cash: 15
};
var rounds = [
	['basic'],
	['basic','basic'],
	['basic','basic','basic'],
	['basic','basic','basic','basic'],
	['basic','basic','basic','basic','basic','basic'],
	['basic','basic','basic','basic','basic','basic','basic','basic','basic'],
	['basic','basic','basic','basic','basic','basic','basic','basic','basic','basic','basic','basic','basic','basic'],
];

var block = function(point,color) {
	var x = point[0];
	var y = point[1];
	var html = $('<div class="block" style="left:'+x*SIZE+'px;top:'+y*SIZE+'px;background-color:'+color+'"></div>');

	html.appendTo($('#game'));

	return html;
};

var createRoad = function() {
	for (var i=0; i<road.length; i++) {
		block(road[i],'#eee');
	}
};

var createBasicEnemy = function() {
	var enemy = {
		type: 'basic',
		point: startPoint,
		prevPoint: startPoint,
		speed: 1000,
		maxHealth: 100,
		health: 100,
		prize: 10,
		alive: true,
		hit: function(damage) {
			this.health -= damage;

			if (this.health > 0) {
				var left = Math.round(this.health/this.maxHealth * SIZE);
				
				$('.health', this.elm).show();
				$('.health .left', this.elm).width(left);
				$('.health .used', this.elm).width(SIZE-left);
				return;
			}

			$(this.elm).remove();

			for (var i=0; i<enemies.length; i++) {
				if (enemies[i] === enemy) {
					enemies.splice(i,1);
					break;
				}
			}

			player.cash += this.prize;
			this.alive = false;

			if (!enemies.length) {
				startNextRound();
			}

			updateInfo();
		},
		move: function() {
			moveEnemy(this)
		}
	};

	var elm = block(enemy.point,'black');
	$(''+
		'<div class="health">'+
			'<div class="left"></div>'+
			'<div class="used"></div>'+
		'</div>'
	).appendTo(elm);

	enemy.elm = elm;

	return enemy;
};

var arrEqual = function(a,b) {
	return !(a<b || b<a);
}

var moveEnemy = function(enemy) {
	var x = enemy.point[0];
	var y = enemy.point[1];
	var nextBlock;
	var candidates = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]];

	if (arrEqual(enemy.point, endPoint)) {
		for (var i in enemies) {
			if (enemy === enemies[i]) {
				enemies.splice(i, 1);
				enemy.elm.remove();
				return;
			}
		}
	}

	for (var i=0; i<candidates.length; i++) {
		var candidate = candidates[i];

		if (arrEqual(candidate, enemy.prevPoint)) {
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

	enemy.prevPoint = enemy.point;
	enemy.point = nextBlock || endPoint;

	enemy.elm.animate({
		left: enemy.point[0]*SIZE,
		top: enemy.point[1]*SIZE
	}, {
		duration: enemy.speed,
		specialEasing: {
			left: 'linear',
			top: 'linear'
		},
		complete: function() {
			moveEnemy(enemy);
		}
	});
};

var move = function() {
	for (var i in enemies) {
		moveEnemy(enemies[i]);
	}
};

var addWeapon = function(weapon,pos) {
	if (arrEqual(pos,startPoint)) {
		return false;
	}
	if (arrEqual(pos,endPoint)) {
		return false;
	}
	for (var i=0; i<road.length; i++) {
		if (arrEqual(pos,road[i])) {
			return false;
		}
	}

	weapon.elm.css({left:pos[0]*SIZE,top:pos[1]*SIZE});
	weapon.point = pos;
	weapon.check();
	weapons.push(weapon);

	return true;
};

var putCurrentWeapon = function(e) {
	if (!currentWeapon) {
		return;
	}

	var x = Math.round((e.pageX+SIZE/2) / SIZE)-1;
	var y = Math.round((e.pageY+SIZE/2) / SIZE)-1;

	if (addWeapon(currentWeapon, [x,y])) {
		player.cash -= currentWeapon.price;
		currentWeapon = null;
		updateInfo();
	}	
};

var drawCurrentWeapon = function(e) {
	if (!currentWeapon) {
		$('#game').css('cursor','default');
		return;
	}
	
	$('#game').css('cursor','none');

	var x = Math.round((e.pageX+SIZE/2) / SIZE)-1;
	var y = Math.round((e.pageY+SIZE/2) / SIZE)-1;
	
	currentWeapon.elm.css({left:x*SIZE+'px',top:y*SIZE+'px'});	
};

var createSmallWeapon = function() {
	var weapon = {
		type: 'small',
		speed: 1000,
		damage: 5,
		price: 5,
		radius: 4,
		elm: block([-1,-1],'orange'),
		check: function() {
			for (var i=0; i<enemies.length; i++) {
				var enemy = enemies[i];
				var x = Math.pow(enemy.point[0] - weapon.point[0],2);
				var y = Math.pow(enemy.point[1] - weapon.point[1],2);
				var distance = Math.sqrt(x + y);

				if (!enemy.alive || distance > weapon.radius) {
					continue;
				}

				var top = $(weapon.elm).offset().top + SIZE/2-3 + 'px';
				var left = $(weapon.elm).offset().left + SIZE/2-3 + 'px';
				var elm = $('<div class="shell" style="top:'+top+';left:'+left+'"></div>');

				elm.animate({
					top: $(enemy.elm).offset().top + SIZE/2 + 'px',
					left: $(enemy.elm).offset().left + SIZE/2 + 'px',
				}, {
					duration: 500,
					complete: function() {
						enemy.hit(weapon.damage);
						elm.remove();
					}
				});

				elm.appendTo($('body'));

				break;
			};
			setTimeout(weapon.check, weapon.speed);
		}
	};

	return weapon;
};

var updateInfo = function() {
	$('#info .healthInfo .amount').text(player.health);
	$('#info .cashInfo .amount').text(player.cash);

	if (currentWeapon) {
		$('#weapons .listing').hide();
		$('#weapons .discard').show();
	} else {
		$('#weapons .listing').show();
		$('#weapons .discard').hide();
	}
	
};

var startNextRound = function() {
	if (!rounds.length) {
		alert('You won!');
		return;
	}

	var newEnemies = rounds.shift();

	var sendNext = function() {
		if (!newEnemies.length) {
			return;
		}

		var type = newEnemies.shift();

		if (type === 'basic') {
			var enemy = createBasicEnemy();
			
			enemies.push(enemy);
			enemy.move();
		}

		setTimeout(sendNext, 3000);
	}

	sendNext();
};

$(function() {
	$('#game').css({width:WIDTH*SIZE+'px', height:HEIGHT*SIZE+'px'});
	$('#control').css('width',WIDTH*SIZE+'px');
	$('#game').mousemove(drawCurrentWeapon);
	$('#game').click(putCurrentWeapon);
	$('#small').click(function() {
		if (player.cash >= 5) {
			currentWeapon = createSmallWeapon();
			updateInfo();
		}
	});
	$('#weapons .discard').click(function() {
		if (!currentWeapon) {
			return;
		}

		$(currentWeapon.elm).remove();
		currentWeapon = null;
		updateInfo();
	})
	updateInfo();

	block(startPoint, 'green');
	block(endPoint, 'red');
	createRoad();

	startNextRound();
});