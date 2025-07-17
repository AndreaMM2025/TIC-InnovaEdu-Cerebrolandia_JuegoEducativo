document.addEventListener("DOMContentLoaded", () => {
  const toggleIcon = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("contrasena");

  if (toggleIcon && passwordInput) {
    toggleIcon.addEventListener("click", () => {
      const isVisible = passwordInput.type === "text";
      passwordInput.type = isVisible ? "password" : "text";
      toggleIcon.textContent = isVisible ? "👁️" : "🙈";
    });
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", iniciarSesion);
  }
});

async function iniciarSesion(event) {
  event.preventDefault();

  const correo = document.getElementById("email").value.trim();
  const contrasena = document.getElementById("contrasena").value;

  try {
    const respuesta = await fetch('/docente/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: correo, contrasena }),
    });

    const resultado = await respuesta.json().catch(() => ({}));

    if (respuesta.ok) {
      const { nombre, apellido } = resultado.data;

      localStorage.setItem('nombre_doc', nombre);
      localStorage.setItem('apellido_doc', apellido);

      console.log("Resultado recibido:", resultado);
      mostrarModal(`Bienvenido/a, ${nombre} ${apellido}`);

      setTimeout(() => {
        window.location.href = '/inicio-docente';
      }, 3000);
    } else {
      mostrarModal("El correo electrónico o contraseña son incorrectos. Inténtalo de nuevo.");
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
