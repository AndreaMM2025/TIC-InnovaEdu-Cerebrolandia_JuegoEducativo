const storage = require('../docente/storage');

function get_Docente(filtro) {
  return storage.get(filtro);
}

async function add_Docente(docente) {
  const correoExistente = await storage.findByEmail(docente.email);
  if (correoExistente) throw new Error(`El correo electrónico "${docente.email}" ya está registrado.`);

  const cedulaExistente = await storage.findByCedula(docente.cedula);
  if (cedulaExistente) throw new Error(`La cédula "${docente.cedula}" ya está registrada.`);

  return await storage.add(docente);
}

async function update_Docente(docente) {
  return await storage.update(docente);
}

function delete_Docente(docente) {
  return storage.delete(docente);
}

async function login_Docente(email, contrasena) {
  const docente = await storage.findByEmail(email);
  if (!docente) throw new Error('Correo no registrado');
  if (docente.contrasena !== contrasena) throw new Error('Contraseña incorrecta');

  return {
    mensaje: 'Inicio de sesión exitoso',
    nombre: docente.nombre,
    apellido: docente.apellido,
    email: docente.email,
  };
}

module.exports = {
  get_Docente,
  add_Docente,
  update_Docente,
  delete_Docente,
  login_Docente,
};