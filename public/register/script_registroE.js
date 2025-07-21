async function guardar_datos(event) {
  event.preventDefault();

  const cedula = document.getElementById("cedula").value.trim();
  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const email = document.getElementById("correo_electronico").value.trim();
  const contrasena = document.getElementById("contraseña").value;
  const errorMsg = document.getElementById("error-msg");

  const cedulaValida = /^\d{10}$/.test(cedula);
  if (!cedulaValida) {
    errorMsg.textContent = "**La cédula debe contener exactamente 10 números.**";
    return;
  }

  if (!validarContraseña(contrasena)) {
    errorMsg.textContent = "**La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.**";

    return;
  }

  const dominiosValidos = ["gmail.com", "hotmail.com", "hotmail.es", "outlook.com", "yahoo.com"];
  const dominioCorreo = email.split("@")[1];

  if (!dominioCorreo || !dominiosValidos.includes(dominioCorreo.toLowerCase())) {
    errorMsg.textContent = "**El correo electrónico debe ser de un dominio válido como gmail.com, hotmail.com, etc.**";
    return;
  }

  const datos = {
    cedula,
    nombre,
    apellido,
    email,
    contrasena,
  };

  try {
    const response = await fetch('/estudiante/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });

    if (response.ok) {
      mostrarModal("Registro exitoso. Serás redirigido al login.");
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } else {
      const data = await response.json();
      mostrarModal(data.error || "Error al registrar estudiante.");
    }
  } catch (err) {
    errorMsg.textContent = "Error de conexión con el servidor.";
    console.error(err);
  }
}


function validarContraseña(contrasena) {
  const longitudValida = contrasena.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneMinuscula = /[a-z]/.test(contrasena);
  const tieneNumero = /[0-9]/.test(contrasena);
  const tieneEspecial = /[!@#\$%\^\&*\)\(+=._\-]/.test(contrasena); 
  return longitudValida && tieneMayuscula && tieneMinuscula && tieneNumero && tieneEspecial;
}



document.addEventListener("DOMContentLoaded", () => {
  const toggleIcon = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("contraseña");

  toggleIcon.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";
    passwordInput.type = isVisible ? "password" : "text";
    toggleIcon.textContent = isVisible ? "👁️" : "🙈";
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

