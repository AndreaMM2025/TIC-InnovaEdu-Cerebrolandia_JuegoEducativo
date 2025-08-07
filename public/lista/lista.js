document.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem('nombre_doc');
  const apellido = localStorage.getItem('apellido_doc');
  const labelUsuario = document.getElementById('nombreUsuario');

  const path = window.location.pathname.replace("/", "");
  const botones = document.querySelectorAll(".nav-links button");

  botones.forEach(btn => {
    if (btn.dataset.page === path) {
      btn.classList.add("activo");
      btn.disabled = true;
    }
  });

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

  cargarEstudiantes();
  const btnActualizar = document.getElementById('btnActualizar');
  if (btnActualizar) {
    btnActualizar.addEventListener('click', cargarEstudiantes);
  }
});

async function cargarEstudiantes() {
  const contenedor = document.getElementById('listaEstudiantes');
  contenedor.innerHTML = "";

  try {
    const res = await fetch("http://localhost:3000/estudiante");
    const resultado = await res.json();

    if (resultado.error) {
      throw new Error(resultado.error);
    }

    const estudiantes = resultado.data;

    if (!estudiantes || estudiantes.length === 0) {
      contenedor.innerHTML = "<p>No hay estudiantes registrados.</p>";
      return;
    }

    estudiantes.forEach((estudiante, index) => {
      const div = document.createElement("div");
      div.className = "estudiante-item";
      div.innerHTML = `
        <span>${index + 1}. ${estudiante.nombre} ${estudiante.apellido}</span>
        <span>${estudiante.email}</span>
        <div>
          <button class="ver-btn">Ver</button>
          <button class="eliminar-btn" data-id="${estudiante.id}">Eliminar</button>
        </div>
      `;

      contenedor.appendChild(div);
      div.querySelector('.ver-btn').addEventListener('click', () => {
        mostrarModalEstudiante(estudiante);
      });

      div.querySelector('.eliminar-btn').addEventListener('click', () => {
        mostrarConfirmacion(`¿Deseas eliminar a ${estudiante.nombre} ${estudiante.apellido}?`, async () => {
          console.log(estudiante);
          
          try {
            const res = await fetch(`http://localhost:3000/estudiante/${estudiante.cedula}`, {
              method: 'DELETE',
            });

            if (res.ok) {
              mostrarModal("Estudiante eliminado");
              cargarEstudiantes(); 
            } else {
              mostrarModal("Error al eliminar");
            }
          } catch (error) {
            console.error("Error al eliminar estudiante:", error);
            mostrarModal("Error en la solicitud");
          }
        });
      });



    });
  } catch (error) {
    console.error("Error al cargar estudiantes:", error);
    contenedor.innerHTML = "<p>Error al cargar estudiantes.</p>";
  }
}

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


function mostrarModalEstudiante(estudiante) {
  const modalEst = document.getElementById("modal-estudiante");
  const cerrarBtn = document.getElementById("cerrar-modal-estudiante");

  document.getElementById("modal-cedula").textContent = estudiante.cedula;
  document.getElementById("modal-nombre").textContent = estudiante.nombre;
  document.getElementById("modal-apellido").textContent = estudiante.apellido;
  document.getElementById("modal-email").textContent = estudiante.email;

  modalEst.classList.remove("hidden");

  const ocultar = () => {
    modalEst.classList.add("hidden");
    cerrarBtn.removeEventListener("click", ocultar);
  };

  cerrarBtn.addEventListener("click", ocultar);
}

function mostrarConfirmacion(mensaje, onConfirmar) {
  const modal = document.getElementById('modalConfirmar');
  const mensajeTexto = document.getElementById('mensajeConfirmar');
  const btnConfirmar = document.getElementById('btnConfirmar');
  const btnCancelar = document.getElementById('btnCancelar');

  mensajeTexto.textContent = mensaje;
  modal.classList.remove('oculto');

  const nuevoBtn = btnConfirmar.cloneNode(true);
  btnConfirmar.parentNode.replaceChild(nuevoBtn, btnConfirmar);

  nuevoBtn.addEventListener('click', () => {
    modal.classList.add('oculto');
    onConfirmar();
  });

  btnCancelar.onclick = () => {
    modal.classList.add('oculto');
  };
}

