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
    alert('¡Vamos a jugar!');
    window.location.href = "/juego";
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