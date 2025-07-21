const model = require('../docente/model');

function get_Docente(filtroDocente) {
  let filtro = {};
  if (filtroDocente) {
    filtro = { cedula: filtroDocente };
  }
  return model.find(filtro);
}

async function findByCedula(cedula) {
  return await model.findOne({ cedula });
}

async function findByEmail(email) {
  return await model.findOne({ email });
}

async function add_Docente(docente) {
  const existenteEmail = await model.findOne({ email: docente.email });
  if (existenteEmail) throw new Error('El correo electrónico ya está registrado.');

  const existenteCedula = await model.findOne({ cedula: docente.cedula });
  if (existenteCedula) throw new Error('La cédula ya está registrada.');

  const nuevo = new model(docente);
  return await nuevo.save();
}

async function update_Docente(docente) {
  const usuario = await model.findOne({ email: docente.email });
  if (!usuario) return null;
  usuario.contrasena = docente.contrasena;
  return await usuario.save();
}

async function delete_Docente(docente) {
  return await model.deleteOne({ cedula: docente.cedula });
}

module.exports = {
  add: add_Docente,
  get: get_Docente,
  update: update_Docente,
  delete: delete_Docente,
  findByEmail,
  findByCedula,
};