const game = {
	board: document.querySelector("#game-board"),
	gameOverScreen: document.querySelector("#game-over"),
	restartButton: document.querySelector("#restart-button"),
	scoreDisplay: document.querySelector("#score"),
	GRID_SIZE: 20,
	GAME_SPEED: 180,
	minSpeed: 80,
	speedStep: 10,
	pointsToIncrease: 5,
	cells: [],
	gameLoop: null,
	food: null,
	score: 0,
	gameWithWalls: true,

	snake: {
		body: [
			{ x: 10, y: 10 },
			{ x: 9, y: 10 },
			{ x: 8, y: 10 },
		],
		nextDirection: "right",
		canChangeDirection: true,
	},

	createCells() {
		this.board.innerHTML = "";
		this.cells = [];
		for (let i = 0; i < this.GRID_SIZE; i++) {
			for (let j = 0; j < this.GRID_SIZE; j++) {
				this.cells.push(document.createElement("div"));
				this.cells[i * this.GRID_SIZE + j].classList.add("cell");
				this.board.appendChild(this.cells[i * this.GRID_SIZE + j]);
			}
		}
	},

	cleanCells() {
		this.cells.forEach((cell) => {
			cell.classList.remove("snake-body", "snake-head", "food");
		});
	},

	renderSnake() {
		for (let i = 1; i < this.snake.body.length; i++) {
			this.cells[
				this.snake.body[i].y * this.GRID_SIZE + this.snake.body[i].x
			].classList.add("snake-body");
		}

		this.cells[
			this.snake.body[0].y * this.GRID_SIZE + this.snake.body[0].x
		].classList.add("snake-head");
	},

	moveSnake() {
		const head = { ...this.snake.body[0] };

		switch (this.snake.nextDirection) {
			case "up":
				head.y--;
				break;
			case "down":
				head.y++;
				break;
			case "left":
				head.x--;
				break;
			case "right":
				head.x++;
				break;
		}

		if (this.gameWithWalls) {
			if (
				head.x < 0 ||
				head.x >= this.GRID_SIZE ||
				head.y < 0 ||
				head.y >= this.GRID_SIZE
			) {
				this.gameOver();
				return;
			}
		} else {
			if (head.x < 0) head.x = this.GRID_SIZE - 1;
			if (head.x >= this.GRID_SIZE) head.x = 0;
			if (head.y < 0) head.y = this.GRID_SIZE - 1;
			if (head.y >= this.GRID_SIZE) head.y = 0;
		}

		this.snake.body.unshift(head);
		this.snake.body.pop();
	},

	snakeGrow() {
		const tail = { ...this.snake.body[this.snake.body.length - 1] };
		this.snake.body.push(tail);
	},

	generateFood() {
		let validPosition = false;

		while (!validPosition) {
			this.food = {
				x: Math.floor(Math.random() * this.GRID_SIZE),
				y: Math.floor(Math.random() * this.GRID_SIZE),
			};

			validPosition = !this.snake.body.some((segment) => {
				return segment.x === this.food.x && segment.y === this.food.y;
			});
		}
	},

	renderFood() {
		this.cells[this.food.y * this.GRID_SIZE + this.food.x].classList.add(
			"food",
		);
	},

	render() {
		this.cleanCells();
		this.renderSnake();
		this.renderFood();
	},

	handleFood() {
		const head = this.snake.body[0];
		if (head.x === this.food.x && head.y === this.food.y) {
			this.vibrate(100);
			this.generateFood();
			this.snakeGrow();
			this.increaseScore();
			return true;
		}
		return false;
	},

	checkWallsCollision() {
		const head = this.snake.body[0];
		if (
			head.x < 0 ||
			head.x >= this.GRID_SIZE ||
			head.y < 0 ||
			head.y >= this.GRID_SIZE
		) {
			return true;
		}
		return false;
	},

	checkSelfCollision() {
		const head = this.snake.body[0];
		if (
			this.snake.body.some(
				(segment, index) =>
					index > 0 && segment.x === head.x && segment.y === head.y,
			)
		) {
			return true;
		}
		return false;
	},

	update() {
		this.cleanCells();
		this.moveSnake();
		this.snake.canChangeDirection = true;
		if (
			(this.gameWithWalls && this.checkWallsCollision()) ||
			this.checkSelfCollision()
		) {
			this.gameOver();
			return;
		}
		this.handleFood();
		this.render();
	},

	increaseScore() {
		this.score++;
		this.scoreDisplay.textContent = "Pontos: " + this.score;
		this.updateDifficulty();
	},

	updateDifficulty() {
		const level = Math.floor(this.score / this.pointsToIncrease);

		this.GAME_SPEED = Math.max(this.minSpeed, 200 - level * this.speedStep);
		this.restartLoop();
	},

	toggleGameMode() {
		this.gameWithWalls = !this.gameWithWalls;
		clearInterval(this.gameLoop);

		if (this.gameWithWalls) {
			this.board.style.border = "10px solid #38bdf8";
		} else {
			this.board.style.border = "none";
		}

		setTimeout(() => {
			this.resetGame();
		}, 200);
	},

	startLoop() {
		if (this.gameLoop) {
			clearInterval(this.gameLoop);
		}
		this.gameLoop = setInterval(() => {
			this.update();
		}, this.GAME_SPEED);
	},

	restartLoop() {
		clearInterval(this.gameLoop);

		this.startLoop();
	},

	gameOver() {
		clearInterval(this.gameLoop);
		this.GAME_SPEED = 180;
		this.gameOverScreen.style.display = "flex";
		this.vibrate([500, 100, 500]);
	},

	vibrate(pattern) {
		if ("vibrate" in navigator) {
			navigator.vibrate(pattern);
		}
	},

	setDirection(dir, opposite) {
		if (this.snake.nextDirection === opposite) return;
		this.snake.nextDirection = dir;
		this.snake.canChangeDirection = false;
	},

	resetGame() {
		this.snake.body = [
			{ x: 10, y: 10 },
			{ x: 9, y: 10 },
			{ x: 8, y: 10 },
		];
		this.GAME_SPEED = 180;
		this.snake.direction = "right";
		this.snake.nextDirection = "right";
		this.snake.canChangeDirection = true;
		this.generateFood();
		this.score = 0;
		this.scoreDisplay.textContent = "Pontos: 0";
		this.render();

		this.startLoop();
	},

	init(withWalls) {
		document.querySelector(".game-header").style.display = "flex";
		document.querySelector(".start-screen").style.display = "none";
		this.gameWithWalls = withWalls;
		this.board.style.display = "grid";
		if (this.gameWithWalls) {
			this.board.style.border = "10px solid #38bdf8";
		}
		this.createCells();
		this.generateFood();
		this.render();

		this.startLoop();
	},
};

document.addEventListener("keyup", (e) => {
	if (!game.snake.canChangeDirection) return;
	if (e.key === "ArrowUp" && game.snake.nextDirection !== "down") {
		game.setDirection("up", "down");
	}
	if (e.key === "ArrowDown" && game.snake.nextDirection !== "up") {
		game.setDirection("down", "up");
	}
	if (e.key === "ArrowLeft" && game.snake.nextDirection !== "right") {
		game.setDirection("left", "right");
	}
	if (e.key === "ArrowRight" && game.snake.nextDirection !== "left") {
		game.setDirection("right", "left");
	}
});

game.restartButton.addEventListener("click", () => {
	game.gameOverScreen.style.display = "none";
	game.resetGame();
});

document.querySelector("#change-mode").addEventListener("click", () => {
	game.toggleGameMode();
});

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", (e) => {
	touchStartX = e.touches[0].clientX;
	touchStartY = e.touches[0].clientY;
});

document.addEventListener("touchend", (e) => {
	const touch = e.changedTouches[0];

	const diffX = touch.clientX - touchStartX;
	const diffY = touch.clientY - touchStartY;

	if (Math.abs(diffX) < 50 && Math.abs(diffY) < 50) return;

	if (Math.abs(diffX) > Math.abs(diffY)) {
		if (diffX > 0 && game.snake.nextDirection !== "left") {
			game.setDirection("right", "left");
		} else if (diffX < 0 && game.snake.nextDirection !== "right") {
			game.setDirection("left", "right");
		}
	} else {
		if (diffY > 0 && game.snake.nextDirection !== "up") {
			game.setDirection("down", "up");
		} else if (diffY < 0 && game.snake.nextDirection !== "down") {
			game.setDirection("up", "down");
		}
	}
});
