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

  if (btnJugar && cuadroCentral) {
    btnJugar.addEventListener('click', () => {
      cuadroCentral.style.opacity = 1;
      cuadroCentral.style.transition = "opacity 0.5s ease";
      cuadroCentral.style.opacity = 0;

      setTimeout(() => {
        cuadroCentral.classList.add("hidden");
      }, 500);
    });
  }
});

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

