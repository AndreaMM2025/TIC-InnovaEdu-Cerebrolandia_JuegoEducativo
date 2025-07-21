const mongoose = require('mongoose')
const Schema = mongoose.Schema

const req_string = {
    type: String,
    required: true,
}

const estudiante_schema = new Schema({
  cedula: { type: String, required: true, unique: true },
  nombre: String,
  apellido: String,
  email: { type: String, required: true, unique: true },
  contrasena: String,
});

const model = mongoose.model('estudiante', estudiante_schema)
module.exports = model