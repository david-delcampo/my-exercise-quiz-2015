// MW de autorización de accesos HTTP restringidos
exports.loginRequired = function(req, res, next) {
  if(req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// MW de caducidad de sesión (AutoLogout)
exports.autoLogout = function(req, res, next) {
  if (req.session.user) {
    if (isExpiredSession(req)) {
      deleteSession(req);
    } else{
      // Guardamos el momento de esta última petición
      req.session.user.lastAccess = now();      
    }
  }  
  next();
}; 

function isExpiredSession(req) {  
  var TWO_MINUTES = 120 * 1000;  	// caducidad de la sesion inactiva, dos minutos en milisegundos      
  
  ExpiredSession = false;
  if (now() - req.session.user.lastAccess >= TWO_MINUTES) { 
    ExpiredSession = true;  
  }
  
  return ExpiredSession;
};

function now() {
  return new Date().getTime();		// fecha y hora en el momento actual, en milisegundos (timestamp)
};  
  

// Get /login   -- Formulario de login
exports.new = function(req, res) {
  var errors = req.session.errors || {};
  req.session.errors = {};
  
  res.render('sessions/new', { errors: errors });
};

// POST /login   -- Crear la sesión
exports.create = function(req, res) {
  var login    = req.body.login;
  var password = req.body.password;
  
  var userController = require('./user_controller');
  userController.autenticar(login, password, function(error, user) {
	if (error) {  // si hay error retornamos mensajes de error de sesión
	    req.session.errors = [{"message": 'Se ha producida un error: ' + error}];
	    res.redirect("/login");
	    return;
	}
	
	// Crear req.session.user y guardar campos id y username
	// La sesión se define por la existencia de: req.session.user
	req.session.user = { id:user.id, username: user.username };
	
	// redirección a path anterior a login
	res.redirect(req.session.redir.toString());
  });
};

// DELETE /logout	-- Destruir sesión
exports.destroy = function(req, res) {
  deleteSession(req)
  // redirección a path anterior a login
  res.redirect(req.session.redir.toString());
};

function deleteSession(req) {
  delete req.session.user;
}