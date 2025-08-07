const storage = require('./storage');
const estudianteModel = require('../estudiante/model');

async function guardarRespuestasDelJuego(estudianteId, respuestas) {
  const estudiante = await estudianteModel.findById(estudianteId);
  if (!estudiante) {
    throw new Error('Estudiante no encontrado');
  }

  const preguntasRespondidas = respuestas.map(r => ({
    pregunta: r.preguntaId,
    enunciado: r.enunciado,
    opciones: r.opciones,
    seleccionada: r.seleccionada,
    correcta: r.correcta
  }));

  return storage.saveIntento({
    estudiante: estudiante._id,
    preguntasRespondidas
  });
}

async function obtenerRespuestasDeEstudiante(estudianteId) {
  const estudiante = await estudianteModel.findById(estudianteId);
  if (!estudiante) {
    throw new Error('Estudiante no encontrado');
  }

  
  const intentos = await storage.findByEstudiante(estudianteId);
    return {
    estudiante: estudiante.nombre + " " + estudiante.apellido,
    intentos
  };
}


module.exports = {
  guardarRespuestasDelJuego,
  obtenerRespuestasDeEstudiante
};
