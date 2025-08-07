document.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem('nombre');
  const apellido = localStorage.getItem('apellido');
  const labelUsuario = document.getElementById('nombreUsuario');

  if (nombre && apellido) {
    labelUsuario.textContent = `Estudiante ${nombre} ${apellido}`;
  }

  document.getElementById('cerrarSesion').addEventListener('click', async () => {
  try {
    const response = await fetch('/logout', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
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
    window.location.href = "/juego";
  });
});


function mostrarModal(mensaje) {
  const modal = document.getElementById("modal");
  const modalMsg = document.getElementById("modal-message");

  modalMsg.textContent = mensaje;
  modal.classList.remove("hidden");

  setTimeout(() => {
    modal.classList.add("hidden");
  }, 3000);
}
