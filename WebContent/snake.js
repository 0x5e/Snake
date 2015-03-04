/*16进制颜色转为RGB格式*/
var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
toRGB = function(t_color) {
    if (t_color == null)
	return null;
    var sColor = t_color.toLowerCase();
    if (sColor && reg.test(sColor)) {
	if (sColor.length === 4) {
	    var sColorNew = "#";
	    for (var i = 1; i < 4; i += 1) {
		sColorNew += sColor.slice(i, i + 1).concat(
			sColor.slice(i, i + 1));
	    }
	    sColor = sColorNew;
	}
	// 处理六位的颜色值
	var sColorChange = [];
	for (var i = 1; i < 7; i += 2) {
	    sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
	}
	return ("RGB(" + sColorChange.join(",") + ")").toLowerCase().replace(
		/[ ]/g, '');
    } else {
	return sColor.toLowerCase().replace(/[ ]/g, '');
    }
};
// --------------------------------------------------------------------------------------------------------------
var interID = null;// 定时器ID
var speeds = 200;// 刷新时间
var Direction = [ new Point(-1, 0), new Point(0, -1), new Point(1, 0),
	new Point(0, 1) ];// 左上右下0~3

function Point(tx, ty) {
    this.x = tx;
    this.y = ty;
}

var snakes = new Array();
function Snake(t_color, t_direction, t_head_point) {// 颜色，移动方向，初始坐标

    this.setTarget = function(dir) {
	if (this.head.after != null
		&& (Direction[dir].x + this.head.x == this.head.after.x)
		&& (Direction[dir].y + this.head.y == this.head.after.y)) {// 与运动方向相反
	    return;
	} else {
	    this.target = Direction[dir];// 方向坐标
	}
    }
    this.next = function() {
	return new Point(this.head.x + this.target.x, this.head.y
		+ this.target.y);
    }

    this.color = t_color;// 颜色
    this.len = 1;// 蛇长
    this.target = Direction[t_direction];// 方向坐标
    this.head = t_head_point;// 蛇头初始化坐标
    this.tail = this.head;
}
Snake.bkg_color = toRGB("#cccccc");
Snake.boder_color = toRGB("#000000");
Snake.food_color = toRGB("#f5f5f5");
Snake.food_point = null;

/*
Snake.setColor = function(block, t_color) {
    $("#x" + block.x + "y" + block.y).css("background-color", t_color);
}

Snake.getColor = function(block) {
    t_color = toRGB($("#x" + block.x + "y" + block.y).css("background-color"))
    if (t_color == null) {
	return Snake.bkg_color;
    } else {
	return t_color;
    }
}
*/

Snake.gameOver = function() {
    clearInterval(interID);
    interID = null;
    $("#score").append("<br>Game over!");
}

Snake.inRange = function(point) {
    if ((point.x < Snake.square && point.x > -1)
	    && (point.y < Snake.square && point.y > -1))
	return true;
    else
	return false;
}

Snake.score = function(t_snake) {
    if (t_snake.len > 2) {
	return t_snake.len * 10 - 20;
    } else {
	return 0;
    }
}

Snake.addFood = function() {
    // 如果填满了
    var all_len = 0;
    for (var i = 0; i < snakes.length; i++) {
	all_len += snakes[i].len;
    }
    if (all_len >= Snake.square * Snake.square) {
	Snake.gameOver();
	return;
    }

    function findFoodPos() {
	if (Snake.food_point == null)
	    return false;
	for (var i = 0; i < snakes.length; i++) {
	    for (var t_block = snakes[i].head; t_block != null; t_block = t_block.after) {
		if (t_block.x == Snake.food_point.x
			&& t_block.y == Snake.food_point.y) {
		    return false;
		}
	    }
	}
	return true;
    }

    while (findFoodPos() == false) {
	Snake.food_point = new Point(Math.round(Math.random() * 9), Math
		.round(Math.random() * 9));
    }
}

Snake.draw = function(snakes) {
    var score_text = '';
    for (var i = 0; i < snakes.length; i++) {
	// 碰撞检测
	if (!Snake.inRange(snakes[i].next())
		|| Snake.map[snakes[i].next().x][snakes[i].next().y] > 0) {
	    Snake.gameOver();
	    return;
	}
	score_text += '玩家' + (i + 1) + ':    ' + Snake.score(snakes[i])
		+ '分<br>';

	// 加蛇头
	snakes[i].head.before = new Point(
		snakes[i].head.x + snakes[i].target.x, snakes[i].head.y
			+ snakes[i].target.y);
	snakes[i].head.before.after = snakes[i].head;
	snakes[i].head = snakes[i].head.before;

	// 去蛇尾
	if (snakes[i].len >= 2) {
	    if (Snake.food_point != null
		    && Snake.food_point.x == snakes[i].head.x
		    && Snake.food_point.y == snakes[i].head.y) {
		snakes[i].len++;
		Snake.food_point = null;
	    } else {
		Snake.map[snakes[i].tail.x][snakes[i].tail.y] = 0;
		snakes[i].tail.before.after = null;
		snakes[i].tail = snakes[i].tail.before;
	    }
	} else {
	    snakes[i].len++;
	}
    }
    $("#score").html(score_text);

    // 加食物
    if (Snake.food_point == null) {
	Snake.addFood();
    }

    // $("td").css("background-color", Snake.bkg_color);
    // 画蛇
    for (var i = 0; i < snakes.length; i++) {
	for (var t_block = snakes[i].head; t_block != null; t_block = t_block.after) {
	    // Snake.setColor(t_block, snakes[i].color);
	    Snake.map[t_block.x][t_block.y] = i + 1;
	}
    }
    // 画食物
    // Snake.setColor(Snake.food_point, Snake.food_color);
    Snake.map[Snake.food_point.x][Snake.food_point.y] = -1;
}

Snake.drawTable = function(t_square) {
    Snake.square = t_square;

    var table = $("<table>");
    $("#mytable").html(table);
    for (var i = 0; i < Snake.square; i++) {
	var tr = $("<tr></tr>");
	tr.appendTo(table);
	for (var j = 0; j < Snake.square; j++) {
	    var td = $("<td id=x" + j + "y" + i + "></td>");
	    td.appendTo(tr);
	}
    }
    $("#mytable").append("</table>");
    // $("table").css("background-color", Snake.boder_color);
    // $("td").css("background-color", Snake.bkg_color);
}

Snake.refresh = function() {
    for (var i = 0; i < Snake.square; i++) {
	for (var j = 0; j < Snake.square; j++) {
	    t_block = $("#x" + i + "y" + j);
	    switch (Snake.map[i][j]) {
	    case -1:
		t_block.css('color', Snake.food_color);
		t_block.text('▣');
		break;
	    case 0:
		t_block.empty();
		break;
	    default:
		t_block.css('color', snakes[Snake.map[i][j] - 1].color);
		t_block.text('▧▤▨▥▩▦'[(Snake.map[i][j] - 1) % 5]);
		break;
	    }
	}

    }
}

$(document).ready(function() {
    //$('body').css("background-color", Snake.bkg_color);
    Snake.drawTable(20);

    $("#start").click(function() {// 开始
	//$("td").css("background-color", Snake.bkg_color);

	Snake.food_point = null;
	Snake.map = new Array(Snake.square);
	for (var i = 0; i < Snake.square; i++) {
	    Snake.map[i] = new Array(Snake.square);
	    for (var j = 0; j < Snake.square; j++) {
		Snake.map[i][j] = 0;// -1:food,0:background,1~n:snake
	    }
	}
	
	snakes[0] = new Snake(toRGB("#00ffff"), 1, new Point(18, 18));
	snakes[1] = new Snake(toRGB("#ffff00"), 1, new Point(1, 18));
	if (interID != null) {
	    clearInterval(interID);
	    interID = null;
	}
	interID = setInterval(timer, speeds);
    });

    function timer() {// 定时器
	Snake.draw(snakes);
	Snake.refresh();
	lastpoint = null;
    }

    // 按键检测
    $('body').keydown(function(e) {
	if (e.keyCode == 13) {
	    $("#start").trigger("click");
	}
	if (interID != null) {
	    if (e.keyCode >= 37 && e.keyCode <= 40 && snakes[0] != null) {
		snakes[0].setTarget(e.keyCode - 37);
	    }

	    if (snakes[1] != null) {
		switch (e.keyCode) {
		case 65:// a
		    snakes[1].setTarget(0);
		    break;
		case 87:// w
		    snakes[1].setTarget(1);
		    break;
		case 68:// d
		    snakes[1].setTarget(2);
		    break;
		case 83:// s
		    snakes[1].setTarget(3);
		    break;
		}
	    }
	}
    });

    // 方向
    var lastpoint;
    function move(point) {
	var sensivity = 10;
	if (interID == null)
	    return;

	if (lastpoint == null) {
	    lastpoint = point;
	    return;
	}
	dx = point.x - lastpoint.x;
	dy = point.y - lastpoint.y;

	if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > sensivity) {// 左右移动
	    snakes[0].setTarget((dx > 0) ? 2 : 0);
	} else if (Math.abs(dx) < Math.abs(dy) && Math.abs(dy) > sensivity) {// 上下移动
	    snakes[0].setTarget((dy > 0) ? 3 : 1);
	}
    }

    // 触摸手势
    if (document.addEventListener != null) {
	document.addEventListener("touchmove", function(e) {
	    move(new Point(e.touches[0].pageX, e.touches[0].pageY));
	}, false);
    }

    // 鼠标手势
    var press = false;
    $('body').mousedown(function(e) {
	press = true;
    });
    $('body').mousemove(function(e) {
	if (press) {
	    move(new Point(e.pageX, e.pageY));
	}
    });
    $('body').mouseup(function(e) {
	press = false;
    });
});