async function cambiarContraseña(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const nueva = document.getElementById('contrasena').value.trim();
  const confirmar = document.getElementById('confirm-password').value.trim();

  if (nueva !== confirmar) {
    mostrarModal("Las contraseñas no coinciden.");
    return false;
  }

  if (!validarContraseña(nueva)) {
    mostrarModal("**La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.**");
    return false;
  }

  const esDocente = window.location.pathname.includes("doc");
  const endpoint = esDocente ? "/docente" : "/estudiante";

  try {
    const respuesta = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email, contrasena: nueva }),
    });

    const resultado = await respuesta.json();

    if (respuesta.ok) {
      mostrarModal("Contraseña actualizada correctamente.");
      setTimeout(() => {
        const loginRuta = esDocente ? "/login-docente" : "/login";
        window.location.href = loginRuta;
      }, 3000);
    } else {
      mostrarModal(resultado.error || "Error al actualizar contraseña.");
    }
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    mostrarModal("Error interno del servidor.");
  }
}



document.addEventListener("DOMContentLoaded", () => {
  const toggleIcon = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("contrasena");

  toggleIcon.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";
    passwordInput.type = isVisible ? "password" : "text";
    toggleIcon.textContent = isVisible ? "👁️" : "🙈";
  });

  const toggleConfirm = document.getElementById("toggle-confirm-password");
  const confirmInput = document.getElementById("confirm-password");

  toggleConfirm.addEventListener("click", () => {
    const isVisible = confirmInput.type === "text";
    confirmInput.type = isVisible ? "password" : "text";
    toggleConfirm.textContent = isVisible ? "👁️" : "🙈";
  });
});



function mostrarModal(mensaje) {
  const modal = document.getElementById("modal");
  const modalMsg = document.getElementById("modal-message");
  const cerrarBtn = document.getElementById("cerrar-modal");

  modalMsg.textContent = mensaje;
  modal.classList.remove("hidden");

  const ocultar = () => {
    modal.classList.add("hidden");
    cerrarBtn.removeEventListener("click", ocultar);
  };

  cerrarBtn.addEventListener("click", ocultar);

  setTimeout(ocultar, 3000);
}

function validarContraseña(contrasena) {
  const longitudValida = contrasena.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneMinuscula = /[a-z]/.test(contrasena);
  const tieneNumero = /[0-9]/.test(contrasena);
  const tieneEspecial = /[!@#\$%\^\&*\)\(+=._\-]/.test(contrasena); 
  return longitudValida && tieneMayuscula && tieneMinuscula && tieneNumero && tieneEspecial;
}