const storage = require('./storage');

function getPreguntas() {
  return storage.getPreguntas();
}

function getPregunta(id) {
  return storage.getPreguntaById(id);
}

async function getPreguntasCategoria(categoria) {
  return await storage.getPreguntasPorCategoria(categoria);
}

function addPregunta(pregunta) {
  return storage.addPregunta(pregunta);
}

function updatePregunta(id, data) {
  return storage.updatePregunta(id, data);
}

function deletePregunta(id) {
  return storage.deletePregunta(id);
}

module.exports = {
  getPreguntas,
  getPregunta,
  getPreguntasCategoria,
  addPregunta,
  updatePregunta,
  deletePregunta
};
