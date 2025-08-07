document.addEventListener("DOMContentLoaded", async () => {
  const nombre = localStorage.getItem("nombre");
  const apellido = localStorage.getItem("apellido");
  const estudianteId = localStorage.getItem("id");
  const labelUsuario = document.getElementById("nombreUsuario");
  const contenedor = document.getElementById("contenedor-resultados");
  const modal = document.getElementById("modalIntento");
  const cerrarModal = document.getElementById("cerrarModalIntento");
  const detalle = document.getElementById("detalleIntento");

  if (nombre && apellido) {
    labelUsuario.textContent = `Estudiante ${nombre} ${apellido}`;
  }

  if (!estudianteId) {
    contenedor.innerHTML = "<p>Error: No se encontró el ID del estudiante.</p>";
    return;
  }

  try {
    const res = await fetch(`/respuesta/${estudianteId}`);
    const resultado = await res.json();
    const data = resultado.data;

    if (!data || !data.intentos || data.intentos.length === 0) {
      contenedor.innerHTML = "<p>No hay resultados para mostrar.</p>";
      return;
    }

    data.intentos.forEach((intento, index) => {
      const div = document.createElement("div");
      div.className = "info-partida";

      const fecha = new Date(intento.fecha).toLocaleString();
      const total = intento.preguntasRespondidas.length;
      const correctas = intento.preguntasRespondidas.filter(p => p.correcta === p.seleccionada).length;

      div.innerHTML = `
        <div class="fila">
          <span class="dato">${index + 1}. ${fecha}</span>
          <span class="dato">${correctas}/${total}</span>
          <button class="btn-ver" data-index="${index}">Ver</button>
        </div>
      `;

      contenedor.appendChild(div);
    });

    contenedor.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-ver")) {
        const idx = parseInt(e.target.getAttribute("data-index"));
        const intento = data.intentos[idx];

        detalle.innerHTML = "";

        intento.preguntasRespondidas.forEach((preg, i) => {
          const opcionesHtml = (preg.opciones || []).map((opt, j) => {
            const clase =
              j === preg.correcta ? "correcta" : j === preg.seleccionada ? "seleccionada" : "";
            return `<li class="${clase}">${opt}</li>`;
          }).join("");

          detalle.innerHTML += `
            <div class="pregunta">
              <h3>${i + 1}. ${preg.enunciado}</h3>
              <ul>${opcionesHtml}</ul>
              <p>Respuesta: <strong class="${preg.correcta === preg.seleccionada ? "bien" : "mal"}">
                ${preg.correcta === preg.seleccionada ? "Correcta" : "Incorrecta"}
              </strong></p>
            </div>
          `;
        });

        modal.classList.remove("hidden");
      }
    });

    cerrarModal.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

  } catch (err) {
    console.error("Error al obtener resultados:", err);
    contenedor.innerHTML = "<p>Error al cargar resultados.</p>";
  }

  document.getElementById('cerrarSesion').addEventListener('click', async () => {
    try {
      const response = await fetch('/logout', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        mostrarModal("Sesión cerrada");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        mostrarModal("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      mostrarModal("Error al cerrar sesión");
    }
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