const storage = require('./storage')

function get_Estudiante( filtroEstudiante ) {
    return new Promise((resolve, reject) => {
        resolve( storage.get( filtroEstudiante ) )
    })
}

async function add_Estudiante(estudiante) {
  const correoExistente = await storage.findByEmail(estudiante.email);
  if (correoExistente) {
    throw new Error(`El correo electrónico "${estudiante.email}" ya está registrado.`);
  }

  const cedulaExistente = await storage.findByCedula(estudiante.cedula);
  if (cedulaExistente) {
    throw new Error(`La cédula "${estudiante.cedula}" ya está registrada.`);
  }

  return await storage.add(estudiante);
}

async function update_Estudiante(estudiante) {
  try {
    const actualizado = await storage.update(estudiante);
    return actualizado;
  } catch (err) {
    throw err;
  }
}

function delete_Estudiante( estudiante ) {
    return new Promise((resolve, reject) => {
        storage.delete( estudiante )
        resolve( estudiante )
    })
}

async function login_Estudiante(email, contrasena) {
  const estudiante = await storage.findByEmail(email);

  if (!estudiante) {
    throw new Error('Correo no registrado');
  }

  if (estudiante.contrasena !== contrasena) {
    throw new Error('Contraseña incorrecta');
  }

  return {
    mensaje: 'Inicio de sesión exitoso',
    nombre: estudiante.nombre,
    apellido: estudiante.apellido,
    email: estudiante.email,
  };
}

module.exports = {
    get_Estudiante,
    add_Estudiante,
    update_Estudiante,
    delete_Estudiante,
    login_Estudiante,
}