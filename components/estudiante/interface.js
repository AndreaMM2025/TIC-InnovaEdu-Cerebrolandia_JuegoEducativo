const express = require('express')
const response = require('../../network/response')
const controller = require('./controller')

const route = express.Router()

route.get('/', function(req, res) {
    const filtro_estudiante = req.query.cedula || null
    controller.get_Estudiante( filtro_estudiante )
        .then( (data) => response.success(req, res, data, 200) )
        .catch( (error) => response.error(req, res, error, 500) )
})

route.post('/login', async (req, res) => {
  const { email, contrasena } = req.body;
  try {
    const estudiante = await controller.login_Estudiante(email, contrasena);
    req.session.estudiante = {
      email: estudiante.email,
      nombre: estudiante.nombre,
      cedula: estudiante.cedula
    };
    response.success(req, res, estudiante, 200);

  } catch (error) {
    response.error(req, res, error.message, 401);
  }
});

route.post('/register', function(req, res) {
  controller.add_Estudiante(req.body)
    .then((data) => response.success(req, res, data, 201))
    .catch((error) => response.error(req, res, error.message, 400));
});


route.put('/', async function (req, res) {
  try {
    const resultado = await controller.update_Estudiante(req.body);

    if (resultado) {
      response.success(req, res, resultado, 200);
    } else {
      response.error(req, res, 'Estudiante no encontrado', 404);
    }
  } catch (error) {
    console.error("Error final en route.put:", error);
    response.error(req, res, error.message || 'Error interno', 500);
  }
});



route.delete('/', function(req, res) {
    controller.delete_Estudiante( req.body ) 
        .then( (data) => response.success(req, res, data, 200) )
        .catch( (error) => response.error(req, res, error, 500) )
})

module.exports = route