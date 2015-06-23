var models = require('../models/models.js');

// GET /quizes/:quizId/comments/new
exports.new = function(req, res) {
  res.render('comments/new.ejs', {quizId: req.params.quizId, errors: []});
};

// POST /quizes/:quizId/comments
exports.create = function(req, res) {
  var comment = models.Comment.build(
    { texto: req.body.comment.texto,
      QuizId: req.params.quizId
      });    
  
  err = comment.validate();
  if (err) {
    res.render('comments/new.ejs', {comment: comment, quizId: req.params.quizId, errors: convertErrorsQuizInObjetErrors(err)});
  } else {
    comment	
    .save()								// save: guarda en DB campo texto de comment
    .then( function(){ res.redirect('/quizes/'+ req.params.quizId)})	// res.redirect: Redirección a la lista de preguntas
  }
};

function convertErrorsQuizInObjetErrors(errors) {
  // Debido a que la versión 1.7 de sequelizejs
  // no tiene implementadas las promesas en la función
  // validate, debemos convertir la lista de errores
  // devuelta en un objeto de errores
  
  var errores = []
  for (F in errors) {
      errores.push({message: errors[F]});
  }
  
  return errores;
}; 