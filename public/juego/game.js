import { createAnimations } from "./animations.js";

let modalActivo = false;

let totalPreguntas = 0;
let respuestasJugador = [];

// --- SALTO robusto ---
let jumpQueued = false;       // cola para pulsos cortos (joystick)
let lastJumpAt = 0;           // timestamp del último salto
const JUMP_COOLDOWN = 220;    // ms mínimos entre saltos

/* ------------------------- Carga de preguntas ------------------------- */
async function cargarPreguntas() {
  try {
    const res = await fetch("/pregunta");
    const preguntas = await res.json();
    console.log("Preguntas cargadas:", preguntas);
    totalPreguntas = preguntas.data.length;
    return Phaser.Utils.Array.Shuffle(preguntas.data.reverse());
  } catch (err) {
    console.error("Error al cargar preguntas:", err);
    return [];
  }
}

/* --------------------------- Boot del documento --------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  const nombre = localStorage.getItem("nombre");
  const apellido = localStorage.getItem("apellido");
  const labelUsuario = document.getElementById("nombreUsuario");

  if (nombre && apellido) {
    labelUsuario.textContent = `Estudiante ${nombre} ${apellido}`;
  }

  document.getElementById("cerrarSesion")?.addEventListener("click", async () => {
    try {
      const response = await fetch("/logout", { method: "GET", credentials: "include" });
      if (response.ok) {
        mostrarModal("Sesión cerrada");
        setTimeout(() => (window.location.href = "/"), 2000);
      } else {
        mostrarModal("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      mostrarModal("Error al cerrar sesión");
    }
  });

  ensureGameOverModal();
  ensurePreguntaModal();

  const preguntas = await cargarPreguntas();
  window.preguntasDisponibles = preguntas;
});

/* ----------------------------- Modales UI ----------------------------- */
function mostrarModal(mensaje) {
  const modal = document.getElementById("modal");
  const modalMsg = document.getElementById("modal-message");
  modalMsg.textContent = mensaje;
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.add("hidden"), 3000);
}

function ensureGameOverModal() {
  let modal = document.getElementById("gameOverModal");
  if (modal) return;
  modal = document.createElement("div");
  modal.id = "gameOverModal";
  modal.className = "modal hidden";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>¡Game Over!</h2>
      <p> Has perdido, intentalo nuevamente!!!</p>
      <button id="btnReiniciar" class="btn-cerrar">Reiniciar</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function ensurePreguntaModal() {
  let modal = document.getElementById("modalPregunta");
  if (modal) return;
  modal = document.createElement("div");
  modal.id = "modalPregunta";
  modal.className = "modal hidden";
  modal.innerHTML = `
    <div class="modal-content">
      <h2 id="enunciado">Pregunta</h2>
      <div id="opciones" class="opciones-container"></div>
    </div>
  `;
  document.body.appendChild(modal);
}

/* ------------ Interacción: mostrar pregunta y continuar ------------ */
window.mostrarPregunta = function (pipe, escena) {
  modalActivo = true;

  const modal = document.getElementById("modalPregunta");
  const enunciado = document.getElementById("enunciado");
  const opcionesContainer = document.getElementById("opciones");

  enunciado.textContent = pipe.pregunta.enunciado;
  opcionesContainer.innerHTML = "";

  pipe.pregunta.opciones.forEach((opcion) => {
    const btn = document.createElement("button");
    btn.textContent = opcion;
    btn.classList.add("opcion");

    btn.onclick = () => {
      btn.blur();
      const modalRespuesta = document.getElementById("modalRespuesta");
      const mensajeRespuesta = document.getElementById("mensajeRespuesta");

      const opcionCorrecta = pipe.pregunta.opciones[pipe.pregunta.correcta];

      if (opcion === opcionCorrecta) {
        mensajeRespuesta.textContent = "¡Correcto!";
        mensajeRespuesta.style.color = "green";
        score += 100;
        escena.sound.play("coin");
        updateHUD(escena);
      } else {
        mensajeRespuesta.textContent = "Incorrecto";
        mensajeRespuesta.style.color = "red";
      }

      respuestasJugador.push({
        preguntaId: pipe.pregunta._id,
        enunciado: pipe.pregunta.enunciado,
        opciones: pipe.pregunta.opciones,
        seleccionada: pipe.pregunta.opciones.indexOf(opcion),
        correcta: pipe.pregunta.correcta
      });

      pipe.respondida = true;

      modalRespuesta.classList.remove("hidden");
      setTimeout(() => {
        modalRespuesta.classList.add("hidden");
        cerrarModalYContinuar(escena);
      }, 1500);
    };
    opcionesContainer.appendChild(btn);
  });

  modal.classList.remove("hidden");
  escena.physics.world.pause();
  escena.input.keyboard.enabled = false;
};

function cerrarModalYContinuar(escena) {
  const modal = document.getElementById("modalPregunta");
  modal.classList.add("hidden");
  escena.physics.world.resume();

  const cursors = escena.cursors;
  if (cursors) {
    ["left", "right", "up", "down"].forEach((dir) => {
      if (cursors[dir]) {
        cursors[dir].isDown = false;
        cursors[dir].reset?.();
      }
    });
  }

  escena.input.keyboard.enabled = true;
  modalActivo = false;

  const tubos = escena.pipes.getChildren();
  const sinPreguntas = tubos.every((t) => t.respondida || !t.pregunta);
  if (sinPreguntas) mostrarModal("¡Ya respondiste todas las preguntas! continua a la meta");

  answered = escena.pipes.getChildren().filter((t) => t.respondida).length;
  updateHUD(escena);
}

/* ----------------------------- HUD estilo SMB ----------------------------- */
let HUD = { nameText: null, livesIcons: [], progressText: null, scoreText: null };
let lives = 3;
let answered = 0;
let totalQuestions = 0;
let score = 0;

function getStudentName() {
  const n = localStorage.getItem("nombre") || "";
  const a = localStorage.getItem("apellido") || "";
  const full = `${n} ${a}`.trim();
  return (full || "Estudiante").toUpperCase();
}

function buildHUD(scene) {
  HUD = { nameText: null, livesIcons: [], progressText: null };
  const useBitmap = scene.cache.bitmapFont.exists("retro");

  HUD.nameText = useBitmap
    ? scene.add.bitmapText(16, 8, "retro", getStudentName(), 16)
    : scene.add.text(16, 8, getStudentName(), { fontFamily: "monospace", fontSize: "14px", color: "#ffffff" });
  HUD.nameText.setScrollFactor(0).setDepth(1000);

  HUD.scoreText = useBitmap
    ? scene.add.bitmapText(scene.scale.width / 2 + 100, 8, "retro", "000000", 16)
    : scene.add.text(scene.scale.width / 2 + 100, 8, "000000", { fontFamily: "monospace", fontSize: "14px", color: "#ffffff" });
  HUD.scoreText.setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);

  HUD.progressText = useBitmap
    ? scene.add.bitmapText(scene.scale.width - 16, 8, "retro", "0/0", 16)
    : scene.add.text(scene.scale.width - 16, 8, "0/0", { fontFamily: "monospace", fontSize: "14px", color: "#ffffff" });
  HUD.progressText.setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

  console.log("[HUD] Construido. BitmapFont:", useBitmap);
}

async function registrarRespuestasFinales() {
  const payload = {
    estudianteId: localStorage.getItem("id"),
    respuestas: respuestasJugador
  };

  try {
    await fetch('/respuesta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("Error al enviar respuestas:", error);
  }

  respuestasJugador = [];
}

function updateHUD(scene) {
  const padded = String(score).padStart(6, "0");
  HUD.scoreText.setText(padded);
  HUD.progressText.setText(`${answered}/${totalQuestions}`);
}

/* ---------------------------- Config Phaser ---------------------------- */
const config = {
  type: Phaser.AUTO,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 640,
    height: 480,
  },
  backgroundColor: "#049cd8",
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: { preload, create, update },
};

new Phaser.Game(config);

/* ------------------------- Estado de entidades ------------------------- */
let goombas, koopas;
let playerEnemyColliders = [];

/* -------------------------------- Preload -------------------------------- */
function preload() {
  this.load.image("cloud1", "assets/scenery/overworld/cloud1.png");
  this.load.image("cloud2", "assets/scenery/overworld/cloud2.png");
  this.load.image("bush1", "assets/scenery/overworld/bush1.png");
  this.load.image("bush2", "assets/scenery/overworld/bush2.png");
  this.load.image("mountain1", "assets/scenery/overworld/mountain1.png");
  this.load.image("mountain2", "assets/scenery/overworld/mountain2.png");
  this.load.image("floorbricks", "assets/scenery/overworld/floorbricks.png");
  this.load.image("pipe2", "assets/scenery/pipe1.png");
  this.load.image("pipe1", "assets/scenery/pipe2.png");
  this.load.image("block", "assets/blocks/overworld/block.png");
  this.load.image("brick", "assets/blocks/overworld/brick-debris.png");
  this.load.image("flag", "assets/scenery/final-flag.png");
  this.load.image("flagpole", "assets/scenery/flag-mast.png");
  this.load.image("castle", "assets/scenery/castle.png");
  this.load.image("stone", "assets/blocks/overworld/immovableBlock.png");

  this.load.spritesheet("mario", "assets/entities/mario.png", {
    frameWidth: 18,
    frameHeight: 16,
  });
  this.load.spritesheet("mistery", "assets/blocks/overworld/misteryBlock.png", {
    frameWidth: 16,
    frameHeight: 16
  });
  this.load.spritesheet("goomba", "assets/entities/overworld/goomba.png", {
    frameWidth: 16,
    frameHeight: 16,
  });
  this.load.spritesheet("koopa", "assets/entities/koopa.png", {
    frameWidth: 16,
    frameHeight: 24,
  });

  this.load.audio("theme", "assets/sound/music/overworld/theme.mp3");
  this.load.audio("gameover", "assets/sound/music/gameover.mp3");
  this.load.audio("jump", "assets/sound/effects/jump.mp3");
  this.load.audio("coin", "assets/sound/effects/coin.mp3");

  this.load.bitmapFont('retro','/juego/assets/fonts/carrier_command.png','/juego/assets/fonts/carrier_command.xml');
}

/* -------------------------------- Create -------------------------------- */
function create() {
  const altura = this.scale.height;
  const worldWidth = 3000;
  const finalX = worldWidth - 150;
  const baseY = altura - 32;
  let metaAlcanzada = false;

  this.physics.world.setBounds(0, 0, worldWidth, altura);
  this.cameras.main.setBounds(0, 0, worldWidth, altura);
  this.cameras.main.setZoom(1);

  // Margen negro arriba para HUD
  this.cameras.main.preRenderCamera = (cam, ctx) => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.scale.width, 60);
    ctx.translate(0, 40);
  };

  // Piso
  this.floor = this.physics.add.staticGroup();
  for (let x = 0; x < worldWidth; x += 32) {
    if ((x >= 1100 && x < 1200) || (x >= 1600 && x < 1700)) continue;
    const tile = this.floor.create(x, altura - 16, "floorbricks").setOrigin(0, 0.5);
    tile.refreshBody();
  }

  // Decorado
  this.add.image(300, 150, "cloud1").setScale(0.6).setScrollFactor(0.6);
  this.add.image(800, 200, "cloud2").setScale(0.6).setScrollFactor(0.6);
  this.add.image(1400, 175, "cloud1").setScale(0.6).setScrollFactor(0.6);
  this.add.image(2000, 150, "cloud1").setScale(0.6).setScrollFactor(0.6);
  this.add.image(1000, 140, "cloud2").setScale(0.6).setScrollFactor(0.6);
  this.add.image(2400, 100, "cloud1").setScale(0.6).setScrollFactor(0.6);

  this.add.image(300, altura - 32, "mountain1").setOrigin(0, 1).setScrollFactor(0.5);
  this.add.image(700, altura - 32, "mountain2").setOrigin(0, 1).setScrollFactor(0.5);
  this.add.image(1000, altura - 32, "mountain1").setOrigin(0, 1).setScrollFactor(0.5);
  this.add.image(1250, altura - 32, "mountain2").setOrigin(0, 1).setScrollFactor(0.5);

  this.add.image(400, altura - 32, "bush1").setOrigin(0, 1).setScrollFactor(1).setScale(0.7);
  this.add.image(900, altura - 32, "bush2").setOrigin(0, 1).setScrollFactor(1).setScale(0.7);

  // Mario
  this.mario = this.physics.add.sprite(50, altura - 90, "mario").setOrigin(0, 1).setScale(2).setCollideWorldBounds(true);
  this.mario.isDead = false;
  this.cameras.main.startFollow(this.mario);

  // Música
  this.themeMusic = this.sound.add("theme", { loop: true, volume: 0.3 });
  this.themeMusic.play();

  createAnimations(this);
  this.physics.add.collider(this.mario, this.floor);

  // Grupos
  goombas = this.physics.add.group();
  koopas = this.physics.add.group();

  // Tuberías + preguntas
  this.pipes = this.physics.add.staticGroup();

  const groundTopY = altura - 32;
  const preguntas = (window.preguntasDisponibles || []).slice(0, 10);

  const tuberiasManual = [
    { x: 400, sprite: "pipe1" },
    { x: 600, sprite: "pipe2" },
    { x: 900, sprite: "pipe2" },
    { x: 1050, sprite: "pipe2" },
    { x: 1200, sprite: "pipe1" },
    { x: 1350, sprite: "pipe2" },
    { x: 1500, sprite: "pipe1" },
    { x: 1650, sprite: "pipe2" },
    { x: 1800, sprite: "pipe2" },
    { x: 1950, sprite: "pipe1" }
  ];

  tuberiasManual.forEach((config, index) => {
    const pipe = this.pipes.create(config.x, groundTopY, config.sprite)
      .setOrigin(0, 1)
      .setScale(1.5);
    pipe.refreshBody();

    pipe.pregunta = preguntas[index] || null;
    pipe.respondida = false;

    this.physics.add.overlap(
      this.mario,
      pipe,
      () => {
        const marioTouching = this.mario.body.touching.down && pipe.body.touching.up;
        if (modalActivo || pipe.respondida || !pipe.pregunta || !marioTouching) return;
        mostrarPregunta(pipe, this);
      },
      null,
      this
    );
  });

  // Bloques
  this.blocks = this.physics.add.staticGroup();
  const blockY = altura - 160;
  for (let x = 200; x <= 300; x += 32) {
    this.blocks.create(x, blockY, "block").setOrigin(0, 0).setScale(2).refreshBody();
  }
  const blockY2 = altura - 200;
  for (let x = 725; x <= 775; x += 32) {
    this.blocks.create(x, blockY2, "block").setOrigin(0, 0).setScale(2).refreshBody();
  }
  const blockF1 = altura - 63;
  for (let x = 2450; x <= 2650; x += 32) {
    this.blocks.create(x, blockF1, "stone").setOrigin(0, 0).setScale(2).refreshBody();
  }
  const blockF2 = altura - 95;
  for (let x = 2485; x <= 2635; x += 32) {
    this.blocks.create(x, blockF2, "stone").setOrigin(0, 0).setScale(2).refreshBody();
  }
  const blockF3 = altura - 127;
  for (let x = 2520; x <= 2600; x += 32) {
    this.blocks.create(x, blockF3, "stone").setOrigin(0, 0).setScale(2).refreshBody();
  }

  const misteryBlock = this.physics.add.sprite(900, blockY, "mistery").setOrigin(0, 0).setScale(2);
  misteryBlock.anims.play("mistery-anim", true);
  misteryBlock.body.setImmovable(true);
  misteryBlock.body.allowGravity = false;
  this.blocks.add(misteryBlock);

  this.physics.add.collider(this.mario, this.blocks);
  this.physics.add.collider(goombas, this.blocks);
  this.physics.add.collider(koopas, this.blocks);

  // Totales y HUD
  totalQuestions = this.pipes.getChildren().filter(p => p.pregunta !== null).length;
  buildHUD(this);
  answered = this.pipes.getChildren().filter((p) => p.respondida).length;
  updateHUD(this);

  // Colisiones
  this.physics.add.collider(this.mario, this.pipes);
  this.physics.add.collider(goombas, this.floor);
  this.physics.add.collider(koopas, this.floor);
  this.physics.add.collider(goombas, this.pipes);
  this.physics.add.collider(koopas, this.pipes);

  // Enemigos
  goombas.create(600, altura - 48, "goomba").setVelocityX(-40).setScale(2).setCollideWorldBounds(true)
    .setBounce(0.9).anims.play("goomba-walk");

  koopas.create(900, altura - 60, "koopa").setVelocityX(-40).setScale(2).setCollideWorldBounds(true)
    .setBounce(0.9).anims.play("koopa-walk");

  // Meta
  this.meta = this.physics.add.staticImage(finalX - 120, baseY, "flagpole")
    .setOrigin(0, 1).setScale(1.9).refreshBody();

  const verificarMeta = () => {
    if (modalActivo || metaAlcanzada) return;
    metaAlcanzada = true;
    modalActivo = true;

    this.mario.setVelocityX(-250);
    this.mario.x -= 20;

    const respondidas = this.pipes.getChildren().filter(p => p.respondida).length;

    if (respondidas < totalQuestions) {
      const modal = document.getElementById("modalPendiente");
      const mensaje = document.getElementById("mensajePendiente");
      mensaje.textContent = "¡Tienes preguntas pendientes por responder!";
      modal.classList.remove("hidden");

      this.physics.world.removeCollider(this.metaCollider);

      setTimeout(() => {
        modal.classList.add("hidden");
        modalActivo = false;
        metaAlcanzada = false;
        this.metaCollider = this.physics.add.overlap(this.mario, this.meta, verificarMeta, null, this);
      }, 3000);

    } else {
      const modal = document.getElementById("modalFelicidades");
      const mensaje = document.getElementById("mensajeFelicidades");
      const btnContinuar = document.getElementById("btnContinuar");

      mensaje.textContent = "¡Felicidades! Respondiste todas las preguntas.";
      modal.classList.remove("hidden");

      this.physics.world.removeCollider(this.metaCollider);

      btnContinuar.onclick = () => {
        registrarRespuestasFinales().then(() => {
          modal.classList.add("hidden");
          modalActivo = false;
          window.location.href = "/resultados_estudiantes";
        });
      };
    }
  };

  this.metaCollider = this.physics.add.overlap(this.mario, this.meta, verificarMeta, null, this);

  const col1 = this.physics.add.collider(this.mario, goombas, () => morir.call(this), null, this);
  const col2 = this.physics.add.collider(this.mario, koopas, () => morir.call(this), null, this);
  playerEnemyColliders = [col1, col2];

  // Extras visuales
  this.add.image(finalX - 120, baseY, "flagpole").setOrigin(0, 1).setScale(1.9).setScrollFactor(1);
  this.add.image(finalX - 135, baseY - 300, "flag").setOrigin(0, 0).setScale(1.8).setScrollFactor(1);
  this.add.image(finalX - 40, baseY, "castle").setOrigin(0, 1).setScale(2).setScrollFactor(1);

  // Controles
  this.cursors = this.input.keyboard.createCursorKeys();

  // Salto por pulso (incluye joystick) con cooldown
  this.input.keyboard.on('keydown-UP', (ev) => {
    if (ev.repeat) return;
    if (this.time.now - lastJumpAt < JUMP_COOLDOWN) return;
    jumpQueued = true;
  });

  // Mensaje de “Joystick conectado” (si Python manda F12)
  this.input.keyboard.on('keydown-F12', () => {
    mostrarModal("🎮 Joystick conectado");
  });

  // Asegurar foco del canvas
  if (this.game.canvas) {
    this.game.canvas.setAttribute("tabindex", "0");
    this.game.canvas.focus();
  }
  document.addEventListener("click", () => this.game.canvas && this.game.canvas.focus());

  // Game Over modal + reinicio
  this.gameOverModal = document.getElementById("gameOverModal");
  this.btnReiniciar = document.getElementById("btnReiniciar");

  this.btnReiniciarHandler = () => {
    this.gameOverModal.classList.add("hidden");
    this.sound.stopAll();
    this.scene.restart();
    this.input.keyboard.enabled = true;
    if (this.game.canvas) {
      this.game.canvas.setAttribute("tabindex", "0");
      this.game.canvas.focus();
    }
    setTimeout(() => this.game.canvas && this.game.canvas.focus(), 0);
  };

  this.btnReiniciar?.addEventListener("click", this.btnReiniciarHandler);
  this.events.once("shutdown", () => {
    this.btnReiniciar?.removeEventListener("click", this.btnReiniciarHandler);
  });
}

/* ---------------------------------- Morir ---------------------------------- */
function morir() {
  if (this.mario.isDead) return;
  this.mario.isDead = true;

  lives = Math.max(0, lives - 1);
  score = 0;
  updateHUD(this);

  playerEnemyColliders.forEach((c) => c?.destroy());
  this.input.keyboard.enabled = false;
  this.physics.world.pause();
  this.mario.setVelocity(0, 0);
  this.mario.anims.play("mario-dead");
  this.mario.setCollideWorldBounds(false);

  if (this.themeMusic?.isPlaying) this.themeMusic.stop();
  this.sound.play("gameover", { volume: 0.5 });

  this.tweens.add({ targets: this.mario, y: this.mario.y - 40, duration: 150, ease: "Quad.easeOut" });

  this.gameOverModal?.classList.remove("hidden");
}

/* --------------------------------- Update --------------------------------- */
function update() {
  if (!this.mario || !this.mario.body || this.mario.isDead) return;

  // Bloquear movimiento cuando el modal está activo
  if (modalActivo) {
    this.mario.setVelocityX(0);
    this.mario.anims.play("mario-idle");
    return;
  }

  const cursors = this.cursors;

  // Movimiento
  if (cursors.left.isDown) {
    this.mario.setVelocityX(-160);
    this.mario.anims.play("mario-walk", true);
    this.mario.flipX = true;
  } else if (cursors.right.isDown) {
    this.mario.setVelocityX(160);
    this.mario.anims.play("mario-walk", true);
    this.mario.flipX = false;
  } else {
    this.mario.setVelocityX(0);
    this.mario.anims.play("mario-idle");
  }

  // --- SALTO con detector de borde y cooldown (anti-doble) ---
  const justPressedUp = Phaser.Input.Keyboard.JustDown(cursors.up);
  const wantJump = justPressedUp || jumpQueued;

  if (
    wantJump &&
    this.mario.body.blocked.down &&
    (this.time.now - lastJumpAt > JUMP_COOLDOWN)
  ) {
    this.mario.setVelocityY(-300); // salto fijo (no “largo” por mantener tecla)
    this.mario.anims.play("mario-jump");
    this.sound.play("jump", { volume: 0.2 });
    lastJumpAt = this.time.now;  // inicia cooldown
    jumpQueued = false;          // consumir pulso
  } else {
    // Limpia la cola si ya tocó suelo y no está en cooldown
    if (this.mario.body.blocked.down && (this.time.now - lastJumpAt > JUMP_COOLDOWN)) {
      jumpQueued = false;
    }
  }

  if (this.mario.body.velocity.y > 0 && !this.mario.body.blocked.down) {
    this.mario.anims.play("mario-jump", true);
  }

  if (this.mario.y >= this.scale.height) {
    morir.call(this);
  }

  goombas.getChildren().forEach(goomba => {
    if (goomba.body.blocked.left) {
      goomba.setVelocityX(40);
      goomba.flipX = false;
    } else if (goomba.body.blocked.right) {
      goomba.setVelocityX(-40);
      goomba.flipX = true;
    }
  });

  koopas.getChildren().forEach(koopa => {
    if (koopa.body.blocked.left) {
      koopa.setVelocityX(40);
      koopa.flipX = true;
    } else if (koopa.body.blocked.right) {
      koopa.setVelocityX(-40);
      koopa.flipX = false;
    }
  });
}