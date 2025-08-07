const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const intentoSchema = new Schema({
  estudiante: { type: Schema.Types.ObjectId, ref: 'estudiante', required: true },
  preguntasRespondidas: [
    {
      pregunta: { type: Schema.Types.ObjectId, ref: 'pregunta' },
      enunciado: String,
      opciones: [String],
      seleccionada: Number,
      correcta: Number
    }
  ],
  fecha: { type: Date, default: Date.now }
});

const model = mongoose.model('intento', intentoSchema);
module.exports = model;

