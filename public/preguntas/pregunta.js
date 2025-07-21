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

  document.getElementById('preguntaForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const enunciado = document.getElementById('enunciado').value.trim();
    const categoria = document.getElementById('categoria').value;
    const opcionesInputs = document.querySelectorAll('#opcionesContainer .opcion input[type="text"]');
    const correctasRadios = document.querySelectorAll('input[name="correcta"]');

    const opciones = Array.from(opcionesInputs).map(input => input.value.trim());
    const correcta = Array.from(correctasRadios).find(r => r.checked)?.value;

    if (opciones.some(op => op === '') || correcta === undefined || !enunciado || !categoria) {
      document.getElementById('mensaje').textContent = 'Completa todos los campos correctamente.';
      return;
    }

    const nuevaPregunta = {
      enunciado,
      opciones,
      correcta: Number(correcta),
      categoria
    };

    try {
      const res = await fetch('http://localhost:3000/preguntas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaPregunta)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al guardar la pregunta');
      }

      document.getElementById('mensaje').textContent = 'Pregunta guardada correctamente.';
      document.getElementById('preguntaForm').reset();
    } catch (err) {
      document.getElementById('mensaje').textContent = `Error: ${err.message}`;
    }
  });
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

