document.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem('nombre_doc');
  const apellido = localStorage.getItem('apellido_doc');
  const labelUsuario = document.getElementById('nombreUsuario');
  const modal = document.getElementById('modalFormulario'); 
  const btnMostrar = document.getElementById('btnMostrarFormulario');
  const btnCerrarModal = document.getElementById('cerrarFormulario');
  const formPregunta = document.getElementById('formPregunta');
  const btnActualizar = document.getElementById('btnActualizarFormulario');
  const modalConfirmacion = document.getElementById('modalConfirmacion');
  const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
  const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');

  let idPreguntaAEliminar = null;

  btnActualizar.addEventListener('click', () => {
    cargarPreguntas();
  });
  if (nombre && apellido) {
    labelUsuario.textContent = `Docente ${nombre} ${apellido}`;
  }

  btnMostrar.addEventListener('click', () => {
    modal.classList.remove('oculto');
  });

  btnCerrarModal.addEventListener('click', () => {
    modal.classList.add('oculto');
    formPregunta.reset();
  });

  document.getElementById('cerrarSesion').addEventListener('click', async () => {
    try {
      const response = await fetch('/logout', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        localStorage.clear();
        alert('Sesión cerrada');
        window.location.href = "/";
      } else {
        alert('Error al cerrar sesión');
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  });

  formPregunta.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(formPregunta);
    const enunciado = data.get('enunciado');
    const categoria = data.get('categoria');
    const opciones = data.getAll('opciones[]');
    const correcta = data.get('correcta');

    if (!enunciado || !categoria || opciones.some(op => op.trim() === '') || correcta === null) {
      alert("Completa todos los campos correctamente.");
      return;
    }

    const nuevaPregunta = { enunciado, categoria, opciones, correcta: Number(correcta) };

    try {
      const res = await fetch("http://localhost:3000/pregunta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaPregunta)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al guardar");
      modal.classList.add("oculto");
      formPregunta.reset();
      cargarPreguntas();
    } catch (error) {
      alert("Error: " + error.message);
    }
  });

  cargarPreguntas();
});

async function cargarPreguntas() {
  const contenedor = document.getElementById('listaPreguntas');
  contenedor.innerHTML = "";

  try {
    const res = await fetch("http://localhost:3000/pregunta");
    const resultado = await res.json();

    if (resultado.error) {
      throw new Error(resultado.error);
    }

    const preguntas = resultado.data;

    if (!preguntas || preguntas.length === 0) {
      contenedor.innerHTML = "<p>No hay preguntas registradas.</p>";
      return;
    }

    preguntas.forEach((pregunta, index) => {
      const div = document.createElement("div");
      div.className = "pregunta-item";
      div.innerHTML = `
        <span>${index + 1}. ${pregunta.enunciado}</span>
        <div class="acciones">
          <button class="ver" data-id="${pregunta._id}">Ver</button>
          <button class="modificar" data-id="${pregunta._id}">Modificar</button>
          <button class="eliminar" data-id="${pregunta._id}">Eliminar</button>
        </div>
      `;
      contenedor.appendChild(div);
    });
    document.querySelectorAll('.eliminar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        idPreguntaAEliminar = e.target.dataset.id;
        modalConfirmacion.classList.remove('oculto');
      });
    });
  } catch (error) {
    console.error("Error al cargar preguntas:", error);
    contenedor.innerHTML = "<p>Error al cargar preguntas.</p>";
  }
};

btnConfirmarEliminar.addEventListener('click', async () => {
  if (!idPreguntaAEliminar) return;

  try {
    const res = await fetch(`http://localhost:3000/pregunta/${idPreguntaAEliminar}`, {
      method: 'DELETE',
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Error al eliminar");

    modalConfirmacion.classList.add('oculto');
    idPreguntaAEliminar = null;
    cargarPreguntas();
  } catch (error) {
    alert("Error: " + error.message);
  }
});

btnCancelarEliminar.addEventListener('click', () => {
  idPreguntaAEliminar = null;
  modalConfirmacion.classList.add('oculto');
});

