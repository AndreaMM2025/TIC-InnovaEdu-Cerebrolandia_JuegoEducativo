const model = require('./model');

function getPreguntas() {
  return model.find();
}

function getPreguntaById(id) {
  return model.findById(id);
}

async function getPreguntasPorCategoria(categoria) {
  return await model.aggregate([
    { $match: { categoria } },
    { $sample: { size: 10 } }
  ]);
}

function addPregunta(pregunta) {
  return new model(pregunta).save();
}

function updatePregunta(id, data) {
  return model.findByIdAndUpdate(id, data, { new: true });
}

function deletePregunta(id) {
  return model.findByIdAndDelete(id);
}

module.exports = {
  getPreguntas,
  getPreguntaById,
  getPreguntasPorCategoria,
  addPregunta,
  updatePregunta,
  deletePregunta,
};
