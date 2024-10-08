// Carrera
let board;
let boardWidth = 750;
let boardHeight = 250;
let context;

// Jugador1
let dinoWidth = 88;
let dinoHeight = 94;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight;
let dinoImg;

let dino = {
    x: dinoX,
    y: dinoY,
    width: dinoWidth,
    height: dinoHeight,
    isJumping: false, // Control de salto
};

// Obstáculos
let cactusArray = [];

let cameraAsaltorWidth = 69;
let cameraStriderWidth = 102;
let cameraLegendaWidth = 55;

let cactusHeight = 70;
let cactusX = 700;
let cactusY = boardHeight - cactusHeight;

let cameraAsaltorImg;
let cameraStriderImg;
let cameraLegendaImg;

// Físicas
let physics = {
    velocityX: -8, // Movimiento del obstáculo
    velocityY: 0,  // Velocidad vertical del jugador
    gravity: 0.4   // Gravedad
};

let gameOver = false;
let score = 0;
let animationFrameId;
let cactusInterval;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d"); // Para dibujar en el canvas

    // Cargar imágenes
    dinoImg = new Image();
    dinoImg.src = "./img/Sigma.png";
    dinoImg.onload = function () {
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    };

    cameraAsaltorImg = new Image();
    cameraAsaltorImg.src = "./img/camera-asaltor.png";

    cameraStriderImg = new Image();
    cameraStriderImg.src = "./img/camera-strider.png";

    cameraLegendaImg = new Image();
    cameraLegendaImg.src = "./img/camera-legenda.png";

    // Iniciar el juego
    startGame();

    document.getElementById("restartButton").addEventListener("click", restartGame);
};

function startGame() {
    cactusArray = []; // Reiniciar el arreglo de cactus
    score = 0; // Reiniciar la puntuación
    resetGamePhysics(); // Reiniciar física del juego
    gameOver = false; // Reiniciar el estado del juego

    // Ocultar el botón de reinicio al comenzar el juego
    document.getElementById("restartButton").style.display = "none"; 

    animationFrameId = requestAnimationFrame(update);
    cactusInterval = setInterval(placeCactus, 1000); // Cada segundo se coloca un cactus
    document.addEventListener("keydown", moveDino);
}

function resetGamePhysics() {
    physics.velocityX = -8; // Reiniciar la velocidad del obstáculo
    physics.velocityY = 0;  // Reiniciar la velocidad vertical del jugador
    dino.isJumping = false; // Reiniciar el estado de salto
    dino.y = dinoY; // Asegurarse de que el dino comienza en la posición correcta
}

function update() {
    if (gameOver) {
        cancelAnimationFrame(animationFrameId); // Detener la animación si el juego ha terminado
        return;
    }

    animationFrameId = requestAnimationFrame(update);

    context.clearRect(0, 0, board.width, board.height); // Limpia el canvas

    // Físicas del jugador
    if (dino.isJumping) {
        physics.velocityY += physics.gravity; // Aplica gravedad cuando está en el aire
        dino.y += physics.velocityY; // Actualiza la posición vertical del dino

        // Si el dino cae por debajo de su posición inicial, reinicia el salto
        if (dino.y >= dinoY) {
            dino.y = dinoY; // Asegurarse de que el dino no sobrepase el suelo
            dino.isJumping = false; // El dino ha aterrizado
            physics.velocityY = 0; // Restablece la velocidad vertical
        }
    }

    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

    // Obstáculos
    for (let i = 0; i < cactusArray.length; i++) {
        let cactus = cactusArray[i];
        cactus.x += physics.velocityX;
        context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

        if (detectCollision(dino, cactus)) {
            gameOver = true;

            // Limpiar el canvas antes de dibujar la imagen de "muerto"
            context.clearRect(0, 0, board.width, board.height);

            dinoImg.src = "./img/muerto.png";
            dinoImg.onload = function () {
                // Dibujar solo la imagen de "muerto"
                context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
                // Mostrar el botón de reinicio
                document.getElementById("restartButton").style.display = "block";
            };

            return; // Salir del bucle para evitar seguir dibujando los obstáculos
        }
    }

    // Puntuación
    context.fillStyle = "black";
    context.font = "20px courier";
    score++;
    context.fillText(score, 5, 20);

    // Aumentar la velocidad cada 500 puntos
    if (score % 500 === 0 && score > 0) {
        physics.velocityX -= 2; // Aumenta la velocidad (disminuye la velocidad negativa)
    }
}

function moveDino(e) {
    if (gameOver) {
        return;
    }

    if ((e.code === "Space" || e.code === "ArrowUp") && !dino.isJumping) {
        // Saltar solo si no está saltando
        physics.velocityY = -10; // Velocidad de salto
        dino.isJumping = true; // Marcar que está saltando
    }
}

function placeCactus() {
    if (gameOver) {
        return;
    }

    // Colocar cactus
    let cactus = {
        img: null,
        x: cactusX,
        y: cactusY,
        width: null,
        height: cactusHeight
    };

    let placeCactusChance = Math.random(); // 0 - 0.9999...

    if (placeCactusChance > 0.90) { // 10% de posibilidad de cameraLegenda
        cactus.img = cameraLegendaImg;
        cactus.width = cameraLegendaWidth;
    } else if (placeCactusChance > 0.70) { // 20% de posibilidad de cameraStrider
        cactus.img = cameraStriderImg;
        cactus.width = cameraStriderWidth;
    } else { // 70% de posibilidad de cameraAsaltor
        cactus.img = cameraAsaltorImg;
        cactus.width = cameraAsaltorWidth;
    }

    if (cactus.img !== null) {
        cactusArray.push(cactus);
    }

    // Limitar el número de cactus activos
    if (cactusArray.length > 5) {
        cactusArray.shift(); // Eliminar el cactus más antiguo
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   // El borde izquierdo de 'a' no ha pasado el borde derecho de 'b'
        a.x + a.width > b.x &&      // El borde derecho de 'a' pasa el borde izquierdo de 'b'
        a.y < b.y + b.height &&     // El borde superior de 'a' no ha pasado el borde inferior de 'b'
        a.y + a.height > b.y;       // El borde inferior de 'a' pasa el borde superior de 'b'
}

function restartGame() {
    dinoImg.src = "./img/Sigma.png";
    dinoImg.onload = function () {
        // Dibujar solo la imagen de "Sigma"
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
        }
    // Limpiar el intervalo de cactus anterior para evitar duplicados
    clearInterval(cactusInterval);
    document.getElementById("restartButton").style.display = "none"; // Ocultar el botón
    resetGamePhysics(); // Asegurarse de que las físicas se reinicien
    startGame(); // Reiniciar el juego
}
