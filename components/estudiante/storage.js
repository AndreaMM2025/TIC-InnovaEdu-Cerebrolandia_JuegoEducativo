const model = require('./model')

function get_Estudiante( filtroEstudiante ) {
    let filtro = {}
    if (filtroEstudiante) {
        filtro = { cedula: filtroEstudiante }
    }
    const objeto = model.find( filtro )
    return objeto
}

async function findByCedula(cedula) {
  return await model.findOne({ cedula });
}


async function add_Estudiante(estudiante) {
  const existenteEmail = await model.findOne({ email: estudiante.email });
  if (existenteEmail) {
    throw new Error('El correo electrónico ya está registrado.');
  }

  const existenteCedula = await model.findOne({ cedula: estudiante.cedula });
  if (existenteCedula) {
    throw new Error('La cédula ya está registrada.');
  }

  const nuevo = new model(estudiante);
  return await nuevo.save();
}

async function update_Estudiante(estudiante) {
  try {
    const { email, contrasena } = estudiante;

    if (!email || !contrasena) {
      throw new Error("Email y nueva contraseña son obligatorios.");
    }

    const usuario = await model.findOne({ email });

    if (!usuario) {
      return null;
    }

    usuario.contrasena = contrasena;

    const actualizado = await usuario.save();
    return actualizado;
  } catch (err) {
    console.error("Error en storage.update_Estudiante:", err);
    throw err;
  }
}

async function delete_Estudiante(cedula) {
    return await model.deleteOne({ cedula: cedula });
}

async function findByEmail(email) {
  return await model.findOne({ email });
}

module.exports = {
    add: add_Estudiante,
    get: get_Estudiante,
    update: update_Estudiante,
    delete: delete_Estudiante,
    findByEmail,
    findByCedula,
}