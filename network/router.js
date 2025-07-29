const path = require('path');
const estudiante = require('../components/estudiante/interface');
const docente = require('../components/docente/interface');
const pregunta = require('../components/pregunta/interface');


function verificarSesion(req, res, next) {
  if (req.session && req.session.estudiante) {
    next();
  } else {
    res.redirect('/login');
  }
}

function verificarSesionDocente(req, res, next) {
  if (req.session && req.session.docente) {
    next();
  } else {
    res.redirect('/login-docente');
  }
}

const routes = (server) => {

  server.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  server.get('/', (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', 'home', 'index.html');
    res.sendFile(filePath);
  });

  server.get('/login', (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', 'login_est', 'login_est.html');
    res.sendFile(filePath);
  });

  server.get('/register', (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', 'register', 'register_estudiante.html');
    res.sendFile(filePath);
  });

  server.get('/login-docente', (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', 'login_doc', 'login_doc.html');
    res.sendFile(filePath);
  });

  server.get('/register-docente', (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', 'register_doc', 'register_doc.html');
    res.sendFile(filePath);
  });

  server.get('/recuperar', (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', 'recuperar', 'recuperar.html');
    res.sendFile(filePath);
  });

  server.get('/recuperar-docente', (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', 'recuperar', 'recuperar_doc.html');
  res.sendFile(filePath);
});

  server.get('/inicio', verificarSesion, (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', 'inicio', 'inicio.html');
    res.sendFile(filePath);
  });

  server.get('/inicio-docente', verificarSesionDocente, (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', 'inicio_doc', 'inicio_doc.html');
    res.sendFile(filePath);
  });

  server.get('/preguntas', verificarSesionDocente, (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', 'preguntas', 'pregunta.html');
    res.sendFile(filePath);
  });

  server.get('/resultados', verificarSesionDocente, (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', 'resultados', 'panel_pregunta.html');
    res.sendFile(filePath);
  });

  server.get('/lista', verificarSesionDocente, (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', 'lista', 'lista.html');
    res.sendFile(filePath);
  });
  
  server.use('/estudiante', estudiante);

  server.use('/docente', docente);

  server.use('/pregunta', pregunta);
  
  server.get('/docente/verificar-sesion', (req, res) => {
    if (req.session && req.session.docente) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  });

  server.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      res.redirect('/');
    });
  });
};

module.exports = routes;
