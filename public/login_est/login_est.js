document.addEventListener("DOMContentLoaded", () => {
  const toggleIcon = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("contrasena");

  toggleIcon.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";
    passwordInput.type = isVisible ? "password" : "text";
    toggleIcon.textContent = isVisible ? "👁️" : "🙈";
  });
});

async function iniciarSesion(event) {
  event.preventDefault();

  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value;

  try {
    const respuesta = await fetch('/estudiante/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: correo, contrasena }),
    });

    const resultado = await respuesta.json().catch(() => ({}));

    if (respuesta.ok) {
      const { nombre, apellido } = resultado.data;

      localStorage.setItem('nombre', nombre);
      localStorage.setItem('apellido', apellido);

      console.log("Resultado recibido:", resultado);
      mostrarModal(`Hola ${nombre} ${apellido}`);
      
      setTimeout(() => {
        window.location.href = '/inicio';
      }, 3000);
    } else {
      mostrarModal("El correo electrónico o contraseña son incorrectos, compruébalos");
    }
  } catch (error) {
    console.error("Error en la petición:", error);
    mostrarModal("Ocurrió un error de conexión. Inténtalo más tarde.");
  }
}


function mostrarModal(mensaje) {
  const modal = document.getElementById("modal");
  const modalMsg = document.getElementById("modal-message");
  const cerrarBtn = document.getElementById("cerrar-modal");

  if (!modal || !modalMsg || !cerrarBtn) return;

  modalMsg.textContent = mensaje;
  modal.classList.remove("hidden");

  const ocultar = () => {
    modal.classList.add("hidden");
    cerrarBtn.removeEventListener("click", ocultar);
  };

  cerrarBtn.addEventListener("click", ocultar);
  setTimeout(ocultar, 3000);
}

