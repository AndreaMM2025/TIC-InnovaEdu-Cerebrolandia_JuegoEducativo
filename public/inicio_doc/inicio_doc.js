document.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem('nombre');
  const apellido = localStorage.getItem('apellido');
  const labelUsuario = document.getElementById('nombreUsuario');

  if (nombre && apellido) {
    labelUsuario.textContent = `Docente ${nombre} ${apellido}`;
  }

  document.getElementById('cerrarSesion').addEventListener('click', async () => {
  try {
    const response = await fetch('/logout', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      localStorage.removeItem('nombre_doc');
      localStorage.removeItem('apellido_doc');

      mostrarModal('Sesión cerrada');
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } else {
      mostrarModal('Error al cerrar sesión');
    }
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    mostrarModal('Error al cerrar sesión');
  }
});

  document.getElementById('jugarBtn').addEventListener('click', () => {
    alert('Redirigiendo al panel docente...');
    window.location.href = "/dashboard-docente";
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