document.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem("nombre_doc");
  const apellido = localStorage.getItem("apellido_doc");
  const labelUsuario = document.getElementById("nombreUsuario");
  if (nombre && apellido && labelUsuario) {
    labelUsuario.textContent = `Docente ${nombre} ${apellido}`;
  }

  const path = window.location.pathname.replace("/", "");
  const botones = document.querySelectorAll(".nav-links button");
  botones.forEach(btn => {
    if (btn.dataset.page === path) {
      btn.classList.add("activo");
      btn.disabled = true;
    }
  });

  const modal = document.getElementById("modal");
  const mensaje = document.getElementById("modal-message");
  const cerrarModal = document.getElementById("cerrar-modal");

  const mostrarModal = (texto) => {
    mensaje.textContent = texto;
    modal.classList.remove("hidden");
  };

  if (cerrarModal) {
    cerrarModal.onclick = () => modal.classList.add("hidden");
  }

  document.getElementById("btnMostrarFormulario")?.addEventListener("click", () => {
    document.getElementById("modalFormulario").classList.remove("oculto");
  });

  document.getElementById("cerrarFormulario")?.addEventListener("click", () => {
    document.getElementById("modalFormulario").classList.add("oculto");
    document.getElementById("formPregunta").reset();
  });

  document.getElementById("cerrarSesion")?.addEventListener("click", () => {
    localStorage.clear();
    const modalCerrar = document.getElementById("modalCerrarSesion");
    if (modalCerrar) {
      modalCerrar.classList.remove("oculto");
      setTimeout(() => {
        modalCerrar.classList.add("oculto");
        window.location.href = "/logout";
      }, 2000);
    } else {
      window.location.href = "/logout";
    }
  });

  async function cargarPreguntas() {
    const contenedor = document.getElementById("listaPreguntas");
    contenedor.innerHTML = "";
    try {
      const res = await fetch("/pregunta");
      const resultado = await res.json();
      const preguntas = Array.isArray(resultado) ? resultado : resultado.data;
      if (!Array.isArray(preguntas)) throw new Error("Respuesta no válida");

      preguntas.forEach((pregunta) => {
        const div = document.createElement("div");
        div.className = "pregunta-item";
        div.innerHTML = `
          <p>${pregunta.enunciado}</p>
          <div class="acciones">
            <button class="ver" onclick="verPregunta('${pregunta._id}')">Ver</button>
            <button class="modificar" onclick="editarPregunta('${pregunta._id}')">Modificar</button>
            <button class="eliminar" onclick="confirmarEliminacion('${pregunta._id}')">Eliminar</button>
          </div>
        `;
        contenedor.appendChild(div);
      });
    } catch (err) {
      console.error(err);
      mostrarModal("Error al cargar preguntas");
    }
  }

  window.verPregunta = async (id) => {
    try {
      const res = await fetch(`/pregunta/${id}`);
      const { data: pregunta } = await res.json();
      document.getElementById("visualizarEnunciado").value = pregunta.enunciado;
      const opcionesContainer = document.getElementById("visualizarOpcionesContainer");
      opcionesContainer.innerHTML = "";
      pregunta.opciones.forEach((op, i) => {
        const p = document.createElement("p");
        p.textContent = `${i + 1}. ${op}` + (i == pregunta.correcta ? " ✔" : "");
        opcionesContainer.appendChild(p);
      });
      document.getElementById("visualizarCategoria").value = pregunta.categoria;
      document.getElementById("modalVisualizarPregunta").classList.remove("oculto");
    } catch (err) {
      mostrarModal("Error al visualizar pregunta");
    }
  };

  document.getElementById("cerrarVisualizar")?.addEventListener("click", () => {
    document.getElementById("modalVisualizarPregunta").classList.add("oculto");
  });

  document.getElementById("formPregunta")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const pregunta = {
      enunciado: data.get("enunciado"),
      opciones: data.getAll("opciones[]"),
      correcta: parseInt(data.get("correcta")),
      categoria: data.get("categoria"),
    };

    try {
      const res = await fetch("/pregunta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pregunta),
      });
      if (!res.ok) throw new Error("Error al guardar");
      form.reset();
      document.getElementById("modalFormulario").classList.add("oculto");
      mostrarModal("Pregunta guardada correctamente");
      cargarPreguntas();
    } catch (err) {
      mostrarModal("Error al guardar pregunta");
    }
  });

  window.editarPregunta = async (id) => {
    try {
      const res = await fetch(`/pregunta/${id}`);
      const { data: pregunta } = await res.json();
      document.getElementById("modificarId").value = pregunta._id;
      document.getElementById("modificarEnunciado").value = pregunta.enunciado;

      const opcionesDiv = document.getElementById("modificarOpciones");
      opcionesDiv.innerHTML = "";
      pregunta.opciones.forEach((op, i) => {
        const div = document.createElement("div");
        div.className = "opcion-item";
        div.innerHTML = `
          <input type="text" name="opciones[]" value="${op}" required>
          <input type="radio" name="correcta" value="${i}" ${i == pregunta.correcta ? "checked" : ""}>
        `;
        opcionesDiv.appendChild(div);
      });

      document.getElementById("modificarCategoria").value = pregunta.categoria;
      document.getElementById("modalModificarPregunta").classList.remove("oculto");
    } catch (err) {
      mostrarModal("Error al cargar pregunta");
    }
  };

  document.getElementById("formModificarPregunta")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const id = data.get("id");
    const pregunta = {
      enunciado: data.get("enunciado"),
      opciones: data.getAll("opciones[]"),
      correcta: parseInt(data.get("correcta")),
      categoria: data.get("categoria"),
    };

    try {
      const res = await fetch(`/pregunta/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pregunta),
      });
      if (!res.ok) throw new Error("Error al modificar");
      form.reset();
      document.getElementById("modalModificarPregunta").classList.add("oculto");
      mostrarModal("Pregunta modificada correctamente");
      cargarPreguntas();
    } catch (err) {
      mostrarModal("Error al modificar pregunta");
    }
  });

  let idAEliminar = null;
  window.confirmarEliminacion = (id) => {
    idAEliminar = id;
    document.getElementById("modalConfirmacion").classList.remove("oculto");
  };

  document.getElementById("btnCancelarEliminar")?.addEventListener("click", () => {
    idAEliminar = null;
    document.getElementById("modalConfirmacion").classList.add("oculto");
  });

  document.getElementById("btnConfirmarEliminar")?.addEventListener("click", async () => {
    try {
      const res = await fetch(`/pregunta/${idAEliminar}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      mostrarModal("Pregunta eliminada");
      cargarPreguntas();
    } catch (err) {
      mostrarModal("Error al eliminar pregunta");
    } finally {
      document.getElementById("modalConfirmacion").classList.add("oculto");
    }
  });

  document.getElementById("btnActualizarFormulario")?.addEventListener("click", cargarPreguntas);

  cargarPreguntas();
});
