const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const preguntaSchema = new Schema({
  enunciado: { type: String, required: true },
  opciones: { 
    type: [String], 
    required: true, 
    validate: [arr => arr.length === 4, 'Debe haber exactamente 4 opciones'] 
  },
  correcta: { type: Number, required: true, min: 0, max: 3 },
  categoria: {
    type: String,
    required: true,
    enum: ['ciencias', 'matematicas', 'lenguaje', 'historia']
  }
});

const model = mongoose.model('pregunta', preguntaSchema);

module.exports = model