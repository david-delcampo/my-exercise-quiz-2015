var express = require('express');
var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');

var router = express.Router();

/* GET home page. */
router.get('/', sessionController.autoLogout, function(req, res) {
  res.render('index', { title: 'Quiz', errors: [] });
});

//  Autoload de comando
router.param('quizId', quizController.load);		//Autoload :quizId
router.param('commentId', commentController.load);	//Autoload :commentId

// Definición de rutas de sesion
router.get( '/login',				sessionController.new);
router.post('/login',				sessionController.create);
router.get( '/logout',				sessionController.destroy);

// Definición de rutas de /quizes
router.get( '/quizes',				sessionController.autoLogout,quizController.index);
router.get( '/quizes/:quizId(\\d+)',		sessionController.autoLogout,quizController.show);
router.get( '/quizes/:quizId(\\d+)/answer',	sessionController.autoLogout,quizController.answer);
router.get( '/quizes/new',			sessionController.autoLogout,sessionController.loginRequired, quizController.new);
router.post('/quizes/create', 			sessionController.autoLogout,sessionController.loginRequired, quizController.create);
router.get( '/quizes/:quizId(\\d+)/edit',	sessionController.autoLogout,sessionController.loginRequired, quizController.edit);
router.put( '/quizes/:quizId(\\d+)',		sessionController.autoLogout,sessionController.loginRequired, quizController.update);
router.delete('/quizes/:quizId(\\d+)',		sessionController.autoLogout,sessionController.loginRequired, quizController.destroy);

// Definición de rutas de /comments
router.get( '/quizes/:quizId(\\d+)/comments/new',			sessionController.autoLogout,commentController.new);
router.post('/quizes/:quizId(\\d+)/comments',				sessionController.autoLogout,commentController.create);	
router.get( '/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish', 	sessionController.autoLogout,sessionController.loginRequired, commentController.publish);

/* GET author page. */
router.get('/author', sessionController.autoLogout, function(req, res) {
  res.render('author', { errors: [] });
});

module.exports = router;
