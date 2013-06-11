//This version will split pieces into either a paragog or a diagog, spawns the paragog in the corner options, diagogs in the other four.
function init() {

//global variables
var getHue = true, protagHue, antagHue, protagCount = 4, antagCount = 4, turn = 'protag', action = 'move', lastClicked, spaces = [], moveDests = [], splitDests = [], gameOver = false;

//generate space objects
for (var col=0; col<10; col++) {
	spaces[col] = [];
	for (var row=0; row<10; row++) {
		spaces[col][row] = {
			allegiance: null, 
			type: null, 
			range: null
		}
	}
}

//click event listener
document.getElementById('cancan').addEventListener('mousedown', function(evt) {
	//get canvas position
	var obj = cancan;
	var top = 0;
	var left = 0;
	while (obj && obj.tagName != 'BODY') {
		top += obj.offsetTop;
		left += obj.offsetLeft;
		obj = obj.offsetParent;
	}
	//get relative cursor position
	cursorX = evt.clientX - left + window.pageXOffset;
	cursorY = evt.clientY - top + window.pageYOffset;
	//get clicked column and row
	col = (cursorX < 500) ? Math.floor(cursorX/50) : 9;
	row = (cursorY < 500) ? Math.floor(cursorY/50) : 'options';
	if (!getHue && !gameOver) {
		boardClick(col, row);
	} else if (getHue && row == 'options') {
		protagHue = cursorX;
		antagHue = protagHue+180;
		setBoard();
		getHue = false;
	}
}, false);

drawColorPicker();
function drawColorPicker() {
	var c = document.getElementById('options').getContext('2d');
	for (var i=0; i<=500; i++) {
		c.strokeStyle = 'hsl(' + i + ', 100%, 50%)';
		c.beginPath();
		c.moveTo(i + 0.5, 0);
		c.lineTo(i + 0.5, 50);
		c.stroke();
	}
	c = document.getElementById('pieces').getContext('2d');
	c.fillRect(0, 0, 500, 500);
	c.font = '18pt Consolas';
	c.fillStyle = 'white';
	c.fillText('C H O O S E  A  C O L O R', 80, 400);
}

function setBoard() {
	//board
	document.getElementById('pieces').getContext('2d').clearRect(0, 0, 500, 500);
	//protag gogs
	spaces[5][8] = {
		allegiance: 'protag',
		type: 'paragog',
		range: 4
	}; drawSpace(5, 8);
	spaces[6][9] = {
		allegiance: 'protag',
		type: 'paragog',
		range: 4
	}; drawSpace(6, 9);
	spaces[4][9] = {
		allegiance: 'protag',
		type: 'diagog',
		range: 4
	}; drawSpace(4, 9);
	spaces[5][9] = {
		allegiance: 'protag',
		type: 'diagog',
		range: 4
	}; drawSpace(5, 9);
	//antag gogs
	spaces[3][0] = {
		allegiance: 'antag',
		type: 'paragog',
		range: 4
	}; drawSpace(3, 0);
	spaces[4][1] = {
		allegiance: 'antag',
		type: 'paragog',
		range: 4
	}; drawSpace(4, 1);
	spaces[5][0] = {
		allegiance: 'antag',
		type: 'diagog',
		range: 4
	}; drawSpace(5, 0);
	spaces[4][0] = {
		allegiance: 'antag',
		type: 'diagog',
		range: 4
	}; drawSpace(4, 0);
	//options
	c = document.getElementById('options').getContext('2d');
	c.clearRect(0, 0, 500, 50);
	c.fillStyle = (turn == 'protag') ? 'hsl(' + protagHue + ', 70%, 40%)' : 'hsl(' + antagHue + ', 70%, 40%)';
	c.fillRect(0, 0, 500, 50);
}

function boardClick(col, row) {
	if (row == 'options') {
		if (lastClicked != undefined && spaces[lastClicked.col][lastClicked.row].allegiance == turn) {
			action = 'move';
			if (4 < col && 1 < spaces[lastClicked.col][lastClicked.row].range) action = 'split';
			drawOptions();
			shadeRange(lastClicked.col, lastClicked.row);
		}
	} else if (action == 'split' && (1 < spaces[lastClicked.col][lastClicked.row].range) && spaces[lastClicked.col][lastClicked.row].allegiance == turn && izzin([col, row], splitDests)) {
		splitPiece(col, row);
		endTurn();
	} else if (action == 'move' && lastClicked != undefined && spaces[lastClicked.col][lastClicked.row].allegiance == turn && izzin([col, row], moveDests)) {
		movePiece(col, row);
		if ((turn == 'protag' && antagCount < 1) || (turn == 'antag' && protagCount < 1)) {endGame(col, row)} else {endTurn()}
	} else {
		action = 'move';
		moveDests = [];
		splitDests = [];
		lastClicked = {col: col, row: row};
		setObstructors(col, row);
		drawOptions();
		shadeRange(col, row);
	}
}

function setObstructors(col, row) {
	//moveDests
	switch (spaces[col][row].type) {
		case 'paragog':
			var checkTop = true, checkBottom = true, checkLeft = true, checkRight = true;
			for (var i=1; i<=spaces[col][row].range; i++) {
				if (checkTop && spaces[col][row-i] !== undefined) {
					moveDests.push([col, row-i]);
					if (spaces[col][row-i].type == 'paragog' || spaces[col][row-i].type == 'diagog') checkTop = false;
				}
				if (checkRight && spaces[col+i] !== undefined) {
					moveDests.push([col+i, row]);
					if (spaces[col+i][row].type == 'paragog' || spaces[col+i][row].type == 'diagog') checkRight = false;
				}
				if (checkBottom && spaces[col][row+i] !== undefined) {
					moveDests.push([col, row+i]);
					if (spaces[col][row+i].type == 'paragog' || spaces[col][row+i].type == 'diagog') checkBottom = false;
				}
				if (checkLeft && spaces[col-i] !== undefined) {
					moveDests.push([col-i, row]);
					if (spaces[col-i][row].type == 'paragog' || spaces[col-i][row].type == 'diagog') checkLeft = false;
				}
			}
			break;
		case 'diagog':
			var checkTopLeft = true, checkTopRight = true, checkBottomRight = true, checkBottomLeft = true;
			for (var i=1; i<=spaces[col][row].range; i++) {
				if (checkTopLeft && spaces[col-i] !== undefined && spaces[col-i][row-i] !== undefined) {
					moveDests.push([col-i, row-i]);
					if (spaces[col-i][row-i].type == 'paragog' || spaces[col-i][row-i].type == 'diagog') checkTopLeft = false;
				}
				if (checkTopRight && spaces[col+i] !== undefined && spaces[col+i][row-i] !== undefined) {
					moveDests.push([col+i, row-i]);
					if (spaces[col+i][row-i].type == 'paragog' || spaces[col+i][row-i].type == 'diagog') checkTopRight = false;
				}
				if (checkBottomRight && spaces[col+i] !== undefined && spaces[col+i][row+i] !== undefined) {
					moveDests.push([col+i, row+i]);
					if (spaces[col+i][row+i].type == 'paragog' || spaces[col+i][row+i].type == 'diagog') checkBottomRight = false;
				}
				if (checkBottomLeft && spaces[col-i] !== undefined && spaces[col-i][row+i] !== undefined) {
					moveDests.push([col-i, row+i]);
					if (spaces[col-i][row+i].type == 'paragog' || spaces[col-i][row+i].type == 'diagog') checkBottomLeft = false;
				}
			}
			break;
	}
	//splitDests
	if    (spaces[col  ][row+1] !== undefined && (spaces[col  ][row+1].type == null || spaces[col  ][row+1].type == 'bonus')) splitDests.push([col  , row+1]);
	if    (spaces[col  ][row-1] !== undefined && (spaces[col  ][row-1].type == null || spaces[col  ][row-1].type == 'bonus')) splitDests.push([col  , row-1]);
	if    (spaces[col+1]        !== undefined) {
		if                                        (spaces[col+1][row  ].type == null || spaces[col+1][row  ].type == 'bonus')  splitDests.push([col+1, row  ]);
		if (spaces[col+1][row+1] !== undefined && (spaces[col+1][row+1].type == null || spaces[col+1][row+1].type == 'bonus')) splitDests.push([col+1, row+1]);
		if (spaces[col+1][row-1] !== undefined && (spaces[col+1][row-1].type == null || spaces[col+1][row-1].type == 'bonus')) splitDests.push([col+1, row-1]);
	}
	if    (spaces[col-1]        !== undefined) {
		if                                        (spaces[col-1][row  ].type == null || spaces[col-1][row  ].type == 'bonus')  splitDests.push([col-1, row  ]);
		if (spaces[col-1][row+1] !== undefined && (spaces[col-1][row+1].type == null || spaces[col-1][row+1].type == 'bonus')) splitDests.push([col-1, row+1]);
		if (spaces[col-1][row-1] !== undefined && (spaces[col-1][row-1].type == null || spaces[col-1][row-1].type == 'bonus')) splitDests.push([col-1, row-1]);
	}
}

function shadeRange(col, row) {
	var c = document.getElementById('shader').getContext('2d');
	c.clearRect(0, 0, 500, 500);
	c.fillStyle = (spaces[col][row].allegiance == 'protag') ? 'hsla(' + protagHue + ', 100%, 60%, 0.3)' : 'hsla(' + antagHue + ', 100%, 40%, 0.3)';
	if (action != 'move') {
		if (spaces[col][row+1] !== undefined && izzin([col, row+1], splitDests)) { //top
			previewSpace((col)*50, (row+1)*50, turn, 'diagog', Math.floor(spaces[lastClicked.col][lastClicked.row].range / 2));
			c.fillRect((col)*50, (row+1)*50, 50, 50);
		}
		if (spaces[col][row-1] !== undefined && izzin([col, row-1], splitDests)) { //bottom
			previewSpace((col)*50, (row-1)*50, turn, 'diagog', Math.floor(spaces[lastClicked.col][lastClicked.row].range / 2));
			c.fillRect((col)*50, (row-1)*50, 50, 50);
		}
		if (spaces[col+1] !== undefined) {
			if (izzin([col+1, row  ], splitDests)) { //right
				previewSpace((col+1)*50, (row)*50, turn, 'diagog', Math.floor(spaces[lastClicked.col][lastClicked.row].range / 2));
				c.fillRect((col+1)*50, (row)*50, 50, 50);
			}
			if (spaces[col+1][row+1] !== undefined && izzin([col+1, row+1], splitDests)) { //bottomright
				previewSpace((col+1)*50, (row+1)*50, turn, 'paragog', Math.floor(spaces[lastClicked.col][lastClicked.row].range / 2));
				c.fillRect((col+1)*50, (row+1)*50, 50, 50);
			}
			if (spaces[col+1][row-1] !== undefined && izzin([col+1, row-1], splitDests)) { //topright
				previewSpace((col+1)*50, (row-1)*50, turn, 'paragog', Math.floor(spaces[lastClicked.col][lastClicked.row].range / 2));
				c.fillRect((col+1)*50, (row-1)*50, 50, 50);
			}
		}
		if (spaces[col-1] !== undefined) {
			if (izzin([col-1, row], splitDests)) { //left
				previewSpace((col-1)*50, (row)*50, turn, 'diagog', Math.floor(spaces[lastClicked.col][lastClicked.row].range / 2));
				c.fillRect((col-1)*50, (row)*50, 50, 50);
			}
			if (spaces[col-1][row+1] !== undefined && izzin([col-1, row+1], splitDests)) { //bottomleft
				previewSpace((col-1)*50, (row+1)*50, turn, 'paragog', Math.floor(spaces[lastClicked.col][lastClicked.row].range / 2));
				c.fillRect((col-1)*50, (row+1)*50, 50, 50);
			}
			if (spaces[col-1][row-1] !== undefined && izzin([col-1, row-1], splitDests)) { //topleft
				previewSpace((col-1)*50, (row-1)*50, turn, 'paragog', Math.floor(spaces[lastClicked.col][lastClicked.row].range / 2));
				c.fillRect((col-1)*50, (row-1)*50, 50, 50);
			}
		}
	} else {
		switch (spaces[col][row].type) {
			case 'paragog':
				for (var i=1; i<=spaces[col][row].range; i++) {
					if (spaces[col][row-i] !== undefined && izzin([col, row-i], moveDests)) c.fillRect(col*50, (row-i)*50, 50, 50);
					if (spaces[col+i] !== undefined && izzin([col+i, row], moveDests)) c.fillRect((col+i)*50,  row*50, 50, 50);
					if (spaces[col][row+i] !== undefined && izzin([col, row+i], moveDests)) c.fillRect(col*50, (row+i)*50, 50, 50);
					if (spaces[col-i] !== undefined && izzin([col-i, row], moveDests)) c.fillRect((col-i)*50,  row*50, 50, 50);
				}
				break;
			case 'diagog':
				for (var i=1; i<=spaces[col][row].range; i++) {
					if (spaces[col+i] !== undefined) {
						if (spaces[col+i][row+i] !== undefined && izzin([col+i, row+i], moveDests)) c.fillRect((col+i)*50, (row+i)*50, 50, 50);
						if (spaces[col+i][row-i] !== undefined && izzin([col+i, row-i], moveDests)) c.fillRect((col+i)*50, (row-i)*50, 50, 50);
					}
					if (spaces[col-i] !== undefined) {
						if (spaces[col-i][row+i] !== undefined && izzin([col-i, row+i], moveDests)) c.fillRect((col-i)*50, (row+i)*50, 50, 50);
						if (spaces[col-i][row-i] !== undefined && izzin([col-i, row-i], moveDests)) c.fillRect((col-i)*50, (row-i)*50, 50, 50);
					}
				}
				break;
		}
	}
}

function movePiece(toCol, toRow) {
	switch (spaces[toCol][toRow].allegiance) {
		case 'protag':
			protagCount--;
			break;
		case 'antag':
			antagCount--;
			break;
	}
	spaces[toCol][toRow].allegiance = turn;
	spaces[toCol][toRow].type = spaces[lastClicked.col][lastClicked.row].type;
	spaces[toCol][toRow].range = (9 < spaces[lastClicked.col][lastClicked.row].range + spaces[toCol][toRow].range) ? 9 : spaces[lastClicked.col][lastClicked.row].range + spaces[toCol][toRow].range;
	sweepBonus(toCol, toRow);
	drawSpace(toCol, toRow);
	spaces[lastClicked.col][lastClicked.row] = {allegiance: null, type: null, range: null};
	drawSpace(lastClicked.col, lastClicked.row);
}

function splitPiece(toCol, toRow) {
	var bonus = (spaces[toCol][toRow].type == 'bonus') ? spaces[toCol][toRow].range : 0;
	spaces[toCol][toRow].allegiance = turn;
	spaces[toCol][toRow].range = Math.floor(spaces[lastClicked.col][lastClicked.row].range / 2);
	if (toCol == lastClicked.col) {
		spaces[toCol][toRow].type = 'diagog';
	} else {
		spaces[toCol][toRow].type = (toRow == lastClicked.row) ? 'diagog' : 'paragog';
	}
	if (9 < spaces[toCol][toRow].range + bonus) {spaces[toCol][toRow].range = 9} else {spaces[toCol][toRow].range += bonus};
	drawSpace(toCol, toRow);
	spaces[lastClicked.col][lastClicked.row].range = Math.ceil(spaces[lastClicked.col][lastClicked.row].range / 2);
	drawSpace(lastClicked.col, lastClicked.row);
	if (turn == 'protag') {protagCount++} else {antagCount++}
}

function sweepBonus(toCol, toRow) {
	switch (spaces[toCol][toRow].type) {
		case 'paragog':
			if (lastClicked.col+1 < toCol) {
				for (var i=1; i<=(toCol - lastClicked.col); i++) {
					if (spaces[toCol-i][toRow] !== undefined && spaces[toCol-i][toRow].type == 'bonus') {
						spaces[toCol][toRow].range = (9 < spaces[toCol-i][toRow].range + spaces[toCol][toRow].range) ? 9 : spaces[toCol-i][toRow].range + spaces[toCol][toRow].range;
						spaces[toCol-i][toRow] = {allegiance: null, type: null, range: null};
						drawSpace(toCol-i, toRow);
					}
				}
			} else if (toCol < lastClicked.col-1) {
				for (var i=1; i<=(lastClicked.col - toCol); i++) {
					if (spaces[toCol+i][toRow] !== undefined && spaces[toCol+i][toRow].type == 'bonus') {
						spaces[toCol][toRow].range = (9 < spaces[toCol+i][toRow].range + spaces[toCol][toRow].range) ? 9 : spaces[toCol+i][toRow].range + spaces[toCol][toRow].range;
						spaces[toCol+i][toRow] = {allegiance: null, type: null, range: null};
						drawSpace(toCol+i, toRow);
					}
				}
			} else if (lastClicked.row+1 < toRow) {
				for (var i=1; i<=(toRow - lastClicked.row); i++) {
					if (spaces[toCol][toRow-i] !== undefined && spaces[toCol][toRow-i].type == 'bonus') {
						spaces[toCol][toRow].range = (9 < spaces[toCol][toRow-i].range + spaces[toCol][toRow].range) ? 9 : spaces[toCol][toRow-i].range + spaces[toCol][toRow].range;
						spaces[toCol][toRow-i] = {allegiance: null, type: null, range: null};
						drawSpace(toCol, toRow-i);
					}
				}
			} else if (toRow < lastClicked.row-1) {
				for (var i=1; i<=(lastClicked.row - toRow); i++) {
					if (spaces[toCol][toRow+i] !== undefined && spaces[toCol][toRow+i].type == 'bonus') {
						spaces[toCol][toRow].range = (9 < spaces[toCol][toRow+i].range + spaces[toCol][toRow].range) ? 9 : spaces[toCol][toRow+i].range + spaces[toCol][toRow].range;
						spaces[toCol][toRow+i] = {allegiance: null, type: null, range: null};
						drawSpace(toCol, toRow+i);
					}
				}
			}
			break;
		case 'diagog':
			if (lastClicked.col+1 < toCol && lastClicked.row+1 < toRow) {
				for (var i=1; i<=(toCol - lastClicked.col); i++) {
					if (spaces[toCol-i][toRow-i] !== undefined && spaces[toCol-i][toRow-i].type == 'bonus') {
						spaces[toCol][toRow].range = (9 < spaces[toCol-i][toRow-i].range + spaces[toCol][toRow].range) ? 9 : spaces[toCol-i][toRow-i].range + spaces[toCol][toRow].range;
						spaces[toCol-i][toRow-i] = {allegiance: null, type: null, range: null};
						drawSpace(toCol-i, toRow-i);
					}
				}
			} else if (lastClicked.col+1 < toCol && toRow < lastClicked.row-1) {
				for (var i=1; i<=(toCol - lastClicked.col); i++) {
					if (spaces[toCol-i][toRow+i] !== undefined && spaces[toCol-i][toRow+i].type == 'bonus') {
						spaces[toCol][toRow].range = (9 < spaces[toCol-i][toRow+i].range + spaces[toCol][toRow].range) ? 9 : spaces[toCol-i][toRow+i].range + spaces[toCol][toRow].range;
						spaces[toCol-i][toRow+i] = {allegiance: null, type: null, range: null};
						drawSpace(toCol-i, toRow+i);
					}
				}
			} else if (toCol < lastClicked.col-1 && lastClicked.row+1 < toRow) {
				for (var i=1; i<=(lastClicked.col - toCol); i++) {
					if (spaces[toCol+i][toRow-i] !== undefined && spaces[toCol+i][toRow-i].type == 'bonus') {
						spaces[toCol][toRow].range = (9 < spaces[toCol+i][toRow-i].range + spaces[toCol][toRow].range) ? 9 : spaces[toCol+i][toRow-i].range + spaces[toCol][toRow].range;
						spaces[toCol+i][toRow-i] = {allegiance: null, type: null, range: null};
						drawSpace(toCol+i, toRow-i);
					}
				}
			} else if (toCol < lastClicked.col-1 && toRow < lastClicked.row-1) {
				for (var i=1; i<=(lastClicked.col - toCol); i++) {
					if (spaces[toCol+i][toRow+i] !== undefined && spaces[toCol+i][toRow+i].type == 'bonus') {
						spaces[toCol][toRow].range = (9 < spaces[toCol+i][toRow+i].range + spaces[toCol][toRow].range) ? 9 : spaces[toCol+i][toRow+i].range + spaces[toCol][toRow].range;
						spaces[toCol+i][toRow+i] = {allegiance: null, type: null, range: null};
						drawSpace(toCol+i, toRow+i);
					}
				}
			}
			break;
	}
}

function spawnBonus() {
	if (Math.random() < 0.3) {
		moveDests = [];
		splitDests = [];
		var occupied = [];
		for (var col=0; col<10; col++) {
			for (var row=0; row<10; row++) {
				if (spaces[col][row].type == 'paragog' || spaces[col][row].type == 'diagog') {
					setObstructors(col, row);
					occupied.push([col, row]);
				} else if (spaces[col][row].type == 'bonus') {
					occupied.push([col, row]);
				}
			}
		}
		var notTaken = [];
		for (var col=0; col<10; col++) {
			for (var row=0; row<10; row++) {
				if (!(izzin([col, row], occupied) || izzin([col, row], moveDests) || izzin([col, row], splitDests))) {
					notTaken.push([col, row]);
				}
			}
		}
		if (7 < notTaken.length) {
			//draw bonus 
			var randomIndex = Math.round(Math.random()*notTaken.length);
			var col = notTaken[randomIndex][0];
			var row = notTaken[randomIndex][1];
			spaces[col][row].type = 'bonus';
			spaces[col][row].range = Math.round(1+Math.random()*3);
			drawSpace(col, row);
			
			/*
			//draw animated flash
			function bonusFlash(i, col, row, c) {
				c.clearRect(col*50, row*50, 50, 50);
				c.fillRect(col+(i*10), row+(i*10), 50-(i*10), 50-(i*10));
				i++;
				if (i < 5) bonusFlash(function(){bonusFlash(i, col, row, c)}, 100);
			}
			var i = 0;
			var c = document.getElementById('shader').getContext('2d');
			c.fillStyle = 'white';
			bonusFlash(i, col, row, c);
			*/
			
		}
	}
	moveDests = [];
	splitDests = [];
}

function drawSpace(col, row) {
	var c = document.getElementById('pieces').getContext('2d');
	var hue = (spaces[col][row].allegiance == 'protag') ? protagHue : antagHue;
	var color1 = 'hsl(' + hue + ', 70%, 40%)';
	var color2 = 'hsl(' + hue + ', 70%, 60%)';
	c.lineCap = 'square';
	c.lineWidth = 2;
	c.strokeStyle = color2;
	c.save();
	c.translate(col*50, row*50);
	c.clearRect(0, 0, 50, 50);
	switch (spaces[col][row].type) {
		case 'paragog':
			c.fillStyle = color1;
			c.beginPath();
			c.moveTo(20, 10);
			c.lineTo(30, 10);
			c.lineTo(40, 20);
			c.lineTo(40, 30);
			c.lineTo(30, 40);
			c.lineTo(20, 40);
			c.lineTo(10, 30);
			c.lineTo(10, 20);
			c.closePath();
			c.fill();
			c.fillStyle = color2;
			c.fillRect(20, 5, 10, 10);
			c.fillRect(35, 20, 10, 10);
			c.fillRect(20, 35, 10, 10);
			c.fillRect(5, 20, 10, 10);
			drawRange(col, row, c, spaces[col][row].range);
			break;
		case 'diagog':
			c.fillStyle = color1;
			c.beginPath();
			c.moveTo(15, 10);
			c.lineTo(25, 15);
			c.lineTo(35, 10);
			c.lineTo(40, 15);
			c.lineTo(35, 25);
			c.lineTo(40, 35);
			c.lineTo(35, 40);
			c.lineTo(25, 35);
			c.lineTo(15, 40);
			c.lineTo(10, 35);
			c.lineTo(15, 25);
			c.lineTo(10, 15);
			c.closePath();
			c.fill();
			c.fillStyle = color2;
			c.fillRect(5, 5, 10, 10);
			c.fillRect(35, 5, 10, 10);
			c.fillRect(5, 35, 10, 10);
			c.fillRect(35, 35, 10, 10);
			drawRange(col, row, c, spaces[col][row].range);
			break;
		case 'bonus':
			c.translate(25, 25);
			c.rotate(Math.PI/4)
			c.fillStyle = 'black';
			c.fillRect(-10, -10, 8, 8);
			c.fillStyle = 'white';
			c.fillRect(-8, -8, 4, 4);
			var r = spaces[col][row].range;
			if (1 < r) {
				c.fillStyle = 'black';
				c.fillRect(2, -10, 8, 8);
				c.fillStyle = 'white';
				c.fillRect(4, -8, 4, 4);
				if (2 < r) {
					c.fillStyle = 'black';
					c.fillRect(2, 2, 8, 8);
					c.fillStyle = 'white';
					c.fillRect(4, 4, 4, 4);
					if (3 < r) {
						c.fillStyle = 'black';
						c.fillRect(-10, 2, 8, 8);
						c.fillStyle = 'white';
						c.fillRect(-8, 4, 4, 4);
					}
				}
			}
			break;
	}
	c.restore();
}

function previewSpace(x, y, allegiance, type, range) {
	var c = document.getElementById('shader').getContext('2d');
	var hue = (allegiance == 'protag') ? protagHue : antagHue;
	var color1 = 'hsl(' + hue + ', 70%, 60%)';
	var color2 = 'hsl(' + hue + ', 70%, 80%)';
	c.lineCap = 'square';
	c.lineWidth = 2;
	c.strokeStyle = color2;
	c.save();
	c.translate(x, y);
	c.clearRect(0, 0, 50, 50);
	switch (type) {
		case 'paragog':
			c.fillStyle = color1;
			c.beginPath();
			c.moveTo(20, 10);
			c.lineTo(30, 10);
			c.lineTo(40, 20);
			c.lineTo(40, 30);
			c.lineTo(30, 40);
			c.lineTo(20, 40);
			c.lineTo(10, 30);
			c.lineTo(10, 20);
			c.closePath();
			c.fill();
			c.fillStyle = color2;
			c.fillRect(20, 5, 10, 10);
			c.fillRect(35, 20, 10, 10);
			c.fillRect(20, 35, 10, 10);
			c.fillRect(5, 20, 10, 10);
			drawRange(x/50, y/50, c, range);
			break;
		case 'diagog':
			c.fillStyle = color1;
			c.beginPath();
			c.moveTo(15, 10);
			c.lineTo(25, 15);
			c.lineTo(35, 10);
			c.lineTo(40, 15);
			c.lineTo(35, 25);
			c.lineTo(40, 35);
			c.lineTo(35, 40);
			c.lineTo(25, 35);
			c.lineTo(15, 40);
			c.lineTo(10, 35);
			c.lineTo(15, 25);
			c.lineTo(10, 15);
			c.closePath();
			c.fill();
			c.fillStyle = color2;
			c.fillRect(5, 5, 10, 10);
			c.fillRect(35, 5, 10, 10);
			c.fillRect(5, 35, 10, 10);
			c.fillRect(35, 35, 10, 10);
			drawRange(x/50, y/50, c, range);
			break;
	}
	c.restore();
}

function drawRange(col, row, c, range) {
	if (range != null) {
		c.fillRect(24, 24, 2, 2);
		if (1 < range) {
			c.fillRect(20, 20, 2, 2);
			if (2 < range) {
				c.fillRect(24, 20, 2, 2);
				if (3 < range) {
					c.fillRect(28, 20, 2, 2);
					if (4 < range) {
						c.fillRect(28, 24, 2, 2);
						if (5 < range) {
							c.fillRect(28, 28, 2, 2);
							if (6 < range) {
								c.fillRect(24, 28, 2, 2);
								if (7 < range) {
									c.fillRect(20, 28, 2, 2);
									if (8 < range) {
										c.fillRect(20, 24, 2, 2);
									}
								}
							}
						}
					}
				}
			}
		}
	}
}

function drawOptions() {
	var c = document.getElementById('options').getContext('2d');
	if (turn == 'protag') {
		color1 = 'hsl(' + protagHue + ', 70%, 40%)';
		color2 = 'hsl(' + protagHue + ', 70%, 60%)';
	} else {
		color1 = 'hsl(' + antagHue + ', 70%, 40%)';
		color2 = 'hsl(' + antagHue + ', 70%, 60%)';
	}
	c.fillStyle = color1;
	c.fillRect(0, 0, 500, 50);
	c.fillStyle = color2;
	c.strokeStyle = color2;
	c.lineWidth = 2;
	if (lastClicked != undefined && spaces[lastClicked.col][lastClicked.row].allegiance == turn) {
		if (1 < spaces[lastClicked.col][lastClicked.row].range) {
			if (action == 'move') {
				 c.strokeRect(3, 3, 244, 44);
				 c.font = '18pt Consolas';
				 c.fillText('M O V E', 80, 33);
				 c.font = '14pt Consolas';
				 c.fillText('S P L I T', 330, 32);
			} else {
				 c.strokeRect(253, 3, 244, 44);
				 c.font = '18pt Consolas';
				 c.fillText('S P L I T', 320, 33);
				 c.font = '14pt Consolas';
				 c.fillText('M O V E', 90, 32);
			}
		} else if (1 == spaces[lastClicked.col][lastClicked.row].range) {
			 c.strokeRect(3, 3, 244, 44);
			 c.font = '18pt Consolas';
			 c.fillText('M O V E', 80, 33);
			 c.font = '14pt Consolas';
			 c.fillText('S P L I T', 330, 32);
			 c.beginPath();
			 c.moveTo(328, 26);
			 c.lineTo(422, 26);
			 c.closePath();
			 c.stroke();
		}
	}
}

function endTurn() {
	action = 'move';
	turn = (turn == 'protag') ? 'antag' : 'protag';
	lastClicked = undefined;
	document.getElementById('shader').getContext('2d').clearRect(0, 0, 500, 500);
	var c = document.getElementById('options').getContext('2d');
	c.fillStyle = (turn == 'protag') ? 'hsl(' + protagHue + ', 70%, 40%)' : 'hsl(' + antagHue + ', 70%, 40%)';
	c.fillRect(0, 0, 500, 50);
	spawnBonus()
}

function endGame(col, row) {
	var c = document.getElementById('shader').getContext('2d');
	c.fillStyle = (turn == 'protag') ? 'hsla(' + protagHue + ', 100%, 60%, 0.3)' : 'hsla(' + antagHue + ', 100%, 40%, 0.3)';
	function victory(i) {
		c.clearRect(0, 0, 500, 500);
		c.fillRect((col-i)*50, (row-i)*50, ((i*2)+1)*50, ((i*2)+1)*50);
		i++;
		if (i < 10) setTimeout(function(){victory(i)}, 250);
	}
	var i = 0;
	victory(i);
	gameOver = true;
}

function izzin(coordinate, outerArray) {
	for (var i=0; i<outerArray.length; i++) {
		if (outerArray[i][0] == coordinate[0] && outerArray[i][1] == coordinate[1]) return true;
	}
	return false;
}

}//init

/* BUGS

*/




























