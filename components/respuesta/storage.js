const mongoose = require('mongoose');
const model = require('./model');
const ObjectId = mongoose.Types.ObjectId;

async function saveIntento(intento) {
  const nuevo = new model(intento);
  return await nuevo.save();
}

async function findByEstudiante(estudianteId) {
  if (!ObjectId.isValid(estudianteId)) {
    return [];
  }

  const filtrados = await model.find({ estudiante: new ObjectId(estudianteId) });
  filtrados.forEach(f => {
  });
  return filtrados.sort((a, b) => b.fecha - a.fecha);
}



module.exports = {
  saveIntento,
  findByEstudiante
};

