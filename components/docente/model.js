const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const docente_schema = new Schema({
  cedula: { type: String, required: true, unique: true },
  nombre: String,
  apellido: String,
  email: { type: String, required: true, unique: true },
  contrasena: String,
});

const model = mongoose.model('docente', docente_schema);
module.exports = model;