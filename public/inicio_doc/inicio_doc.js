document.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem('nombre_doc');
  const apellido = localStorage.getItem('apellido_doc');
  const labelUsuario = document.getElementById('nombreUsuario');

  if (nombre && apellido) {
    labelUsuario.textContent = `Docente ${nombre} ${apellido}`;
  }

  const cerrarSesionBtn = document.getElementById('cerrarSesion');
  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener('click', async () => {
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
  }

  const btnJugar = document.getElementById('jugarBtn');
  const cuadroCentral = document.querySelector('.cuadro-central');
  const panelBotones = document.getElementById('panelBotones');

  if (btnJugar && cuadroCentral && panelBotones) {
    btnJugar.addEventListener('click', () => {
      cuadroCentral.style.transition = "opacity 0.5s ease";
      cuadroCentral.style.opacity = 0;

      setTimeout(() => {
        cuadroCentral.classList.add("hidden");
        panelBotones.classList.remove("hidden");
      }, 500);
    });
  }
});

function mostrarModal(mensaje) {
  const modal = document.getElementById("modal");
  const modalMsg = document.getElementById("modal-message");

  if (!modal || !modalMsg) return;

  modalMsg.textContent = mensaje;
  modal.classList.remove("hidden");

  setTimeout(() => {
    modal.classList.add("hidden");
  }, 3000);
}

