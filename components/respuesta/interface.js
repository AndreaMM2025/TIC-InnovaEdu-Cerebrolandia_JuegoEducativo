const express = require('express');
const router = express.Router();
const controller = require('./controller');
const response = require('../../network/response');
const estudianteModel = require('../estudiante/model');


router.post("/", async (req, res) => {
  const { estudianteId, respuestas } = req.body;

  if (!estudianteId || !Array.isArray(respuestas)) {
    return response.error(req, res, "Datos incompletos o inválidos", 400);
  }

  try {
    const resultado = await controller.guardarRespuestasDelJuego(estudianteId, respuestas);
    response.success(req, res, resultado, 201);
  } catch (err) {
    response.error(req, res, err.message, 500);
  }
});

router.get('/:estudianteId', async (req, res) => {
  try {
    const data = await controller.obtenerRespuestasDeEstudiante(req.params.estudianteId);
    response.success(req, res, data, 200);
  } catch (err) {
    response.error(req, res, err.message, 500);
  }
});

const verificarSesionDocente = (req, res, next) => {
  if (req.session && req.session.docente) {
    next();
  } else {
    return res.status(401).json({ error: 'No autorizado' });
  }
};

router.get('/docente/estudiante', verificarSesionDocente, async (req, res) => {
  try {
    const estudiantes = await estudianteModel.find();
    const data = await Promise.all(estudiantes.map(e => ({
      _id: e._id,
      nombre: `${e.nombre} ${e.apellido}`
    })));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
