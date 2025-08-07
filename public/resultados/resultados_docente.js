document.addEventListener("DOMContentLoaded", async () => {
  const nombre = localStorage.getItem("nombre_doc");
  const apellido = localStorage.getItem("apellido_doc");
  const labelUsuario = document.getElementById("nombreUsuario");
  if (nombre && apellido) {
    labelUsuario.textContent = `Docente ${nombre} ${apellido}`;
  }
  const lista = document.getElementById("listaEstudiantes");
  const modal = document.getElementById("modalIntentos");
  const cerrar = document.getElementById("cerrarModal");
  const nombreEstudiante = document.getElementById("nombreEstudiante");
  const detalleIntentos = document.getElementById("detalleIntentos");

  cerrar.addEventListener("click", () => modal.classList.add("hidden"));

  const res = await fetch("/respuesta/docente/estudiante");
  const estudiantes = await res.json();

  estudiantes.forEach(est => {
    const div = document.createElement("div");
    div.className = "estudiante";
    div.innerHTML = `
      <span>${est.nombre}</span>
      <button onclick="verIntentos('${est._id}')">Ver</button>
    `;
    lista.appendChild(div);
  });

  window.verIntentos = async function (id) {
    detalleIntentos.innerHTML = "";
    nombreEstudiante.textContent = "";

    try {
      const res = await fetch(`/respuesta/${id}`);
      if (!res.ok) {
        throw new Error(`Error al obtener intentos (status ${res.status})`);
      }

      const result = await res.json();

      const { estudiante, intentos } = result.data;
      nombreEstudiante.textContent = estudiante;

      if (!Array.isArray(intentos) || intentos.length === 0) {
        detalleIntentos.innerHTML = "<p>No hay intentos registrados para este estudiante.</p>";
      } else {
        intentos.forEach((intento, i) => {
          const div = document.createElement("div");
          div.className = "intento";
          div.innerHTML = `<strong>${i + 1}. ${new Date(intento.fecha).toLocaleString()}</strong>`;

          intento.preguntasRespondidas.forEach(p => {
            const pDiv = document.createElement("div");
            pDiv.className = "pregunta pregunta-box";
            pDiv.innerHTML = `<p>${p.enunciado}</p>`;

            p.opciones.forEach((op, idx) => {
              const span = document.createElement("div");
              span.className = "opcion";
              span.textContent = `${idx + 1}. ${op}`;

              // Mostrar ✓ si es la correcta
              if (idx === p.correcta) {
                const label = document.createElement("small");
                label.textContent = "✓ Respuesta correcta";
                label.style.color = "lime";
                label.style.display = "block";
                label.style.marginLeft = "20px";
                label.style.fontWeight = "bold";
                span.appendChild(label);
                span.classList.add("correcta");
              }

              // Mostrar ✗ si fue seleccionada y es incorrecta
              if (idx === p.seleccionada && idx !== p.correcta) {
                const label = document.createElement("small");
                label.textContent = "✗ Respuesta incorrecta";
                label.style.color = "red";
                label.style.display = "block";
                label.style.marginLeft = "20px";
                label.style.fontWeight = "bold";
                span.appendChild(label);
                span.classList.add("incorrecta");
              }

              pDiv.appendChild(span);
            });

            div.appendChild(pDiv);
          });

          detalleIntentos.appendChild(div);
        });
      }

      modal.classList.remove("hidden");
    } catch (err) {
      console.error("Error al mostrar intentos:", err);
      detalleIntentos.innerHTML = `<p>Error al cargar los intentos: ${err.message}</p>`;
      modal.classList.remove("hidden");
    }
  };

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
