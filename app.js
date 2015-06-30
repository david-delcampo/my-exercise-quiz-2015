var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('Quiz 2015'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Helpers dínamicos:
app.use(function(req, res, next) {
  // guardar path en session.redir para después de login
  if (!req.path.match(/\/login|\/logout/)) {
    req.session.redir = req.path;
  }
  
  // Hacer visible req.session en las vistas
  res.locals.session = req.session;
  next();
});

// AutoLogout
app.use(function(req, res, next) {
  // En este momento, debe exister la variable session dentro de res
  // ahí guardaremos una nueva variable con el timestamp del acceso
  // con esa variable comprobaremos si debemos hacer el logout por sesion caducada   
    
  // fecha y hora en el momento actual, en milisegundos (timestamp)
  var now = new Date().getTime();
  // caducidad de la sesion inactiva, dos minutos en milisegundos
  var TWO_MINUTES = 120 * 1000;

  // hay sesion de usuario
  if (req.session.user) {    
    if (now - req.session.user.lastAccess >= TWO_MINUTES) {    
      delete req.session.user;
      
      // ¿Genera error? al hacer el redirect y luego pasar a otro MW ... 
      // ¿se genera un error por intentar modificar una cabecera ya enviada?
      //    Sí, el redirect y la posterior cadena de MW generaban error.
      //	Analizando la situación, es más correcto sin ello,
      //	será loginRequired el encargado 
      //	de pedir login, de nuevo, si es necesario en la url solicitada
      //res.redirect('/login');	// ¿o simplemente pierde las opciones?
    } else {    
      // Guardamos el momento de esta última petición
      req.session.user.lastAccess = now;    
    }
  }  
  
  next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
	errors: []
    });
});


module.exports = app;
