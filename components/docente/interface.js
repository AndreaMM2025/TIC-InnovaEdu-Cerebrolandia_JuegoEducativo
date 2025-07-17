const express = require('express');
const response = require('../../network/response');
const controller = require('../docente/controller');
const route = express.Router();

route.get('/', function (req, res) {
  const filtro = req.query.cedula || null;
  controller.get_Docente(filtro)
    .then((data) => response.success(req, res, data, 200))
    .catch((err) => response.error(req, res, err.message, 500));
});

route.post('/register', function (req, res) {
  controller.add_Docente(req.body)
    .then((data) => response.success(req, res, data, 201))
    .catch((err) => response.error(req, res, err.message, 400));
});

route.post('/login', async (req, res) => {
  const { email, contrasena } = req.body;
  try {
    const docente = await controller.login_Docente(email, contrasena);
    req.session.docente = {
      email: docente.email,
      nombre: docente.nombre,
      cedula: docente.cedula
    };
    response.success(req, res, docente, 200);
  } catch (error) {
    response.error(req, res, error.message, 401);
  }
});


route.put('/', async function (req, res) {
  try {
    const actualizado = await controller.update_Docente(req.body);
    if (actualizado) {
      response.success(req, res, actualizado, 200);
    } else {
      response.error(req, res, 'Docente no encontrado', 404);
    }
  } catch (err) {
    response.error(req, res, err.message || 'Error interno', 500);
  }
});

route.delete('/', function (req, res) {
  controller.delete_Docente(req.body)
    .then((data) => response.success(req, res, data, 200))
    .catch((err) => response.error(req, res, err.message, 500));
});

module.exports = route;