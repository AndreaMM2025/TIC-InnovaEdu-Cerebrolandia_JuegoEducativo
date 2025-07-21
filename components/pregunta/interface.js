const express = require('express');
const router = express.Router();
const controller = require('./controller');
const response = require('../../network/response');

router.get('/', async (req, res) => {
  try {
    const data = await controller.getPreguntas();
    response.success(req, res, data, 200);
  } catch (err) {
    response.error(req, res, err.message, 500);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await controller.getPregunta(req.params.id);
    if (!data) return response.error(req, res, 'No encontrada', 404);
    response.success(req, res, data, 200);
  } catch (err) {
    response.error(req, res, err.message, 500);
  }
});

router.get('/categoria/:categoria', async (req, res) => {
  const categoria = req.params.categoria.toLowerCase();
  const categoriasValidas = ['ciencias', 'matematicas', 'lenguaje', 'historia'];

  if (!categoriasValidas.includes(categoria)) {
    return response.error(req, res, 'Categoría no válida', 400);
  }

  try {
    const preguntas = await controller.getPreguntasCategoria(categoria);
    response.success(req, res, preguntas, 200);
  } catch (err) {
    response.error(req, res, err.message, 500);
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await controller.addPregunta(req.body);
    response.success(req, res, data, 201);
  } catch (err) {
    response.error(req, res, err.message, 400);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await controller.updatePregunta(req.params.id, req.body);
    response.success(req, res, data, 200);
  } catch (err) {
    response.error(req, res, err.message, 400);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await controller.deletePregunta(req.params.id);
    response.success(req, res, data, 200);
  } catch (err) {
    response.error(req, res, err.message, 400);
  }
});

module.exports = router;
