var models = require('../models/models.js');

// Autoload - factoriza el código si la ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
      where: { id: Number(quizId) },
      include: [{ model: models.Comment }]})
   .then(function(quiz) {
      if (quiz) {
	req.quiz = quiz;
	next()
      } else {
	next(new Error('No existe quizId=' + quizId));
      }
    }
  ).catch(function(error) { next(error); });
};
  
// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( // crea objeto Quiz
    { pregunta: "Pregunta", respuesta: "Respuesta" }
  );
  
  res.render('quizes/new', { quiz: quiz, errors: [] });
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build(req.body.quiz);
  
  err = quiz.validate();
  if (err) {
    res.render('quizes/new', {quiz: quiz, errors: convertErrorsQuizInObjetErrors(err)});
  } else {
    quiz 
    .save({fields: ["pregunta", "respuesta", "tema"]}) 	// save: guarda en DB los campos pregunta y respuesta de quiz
    .then( function(){ res.redirect('/quizes')})	// res.redirect: Redirección HTTP a lista de preguntas
  }

};

// GET /quizes
exports.index = function(req, res) {  
  var conditions = {};
  if (req.query.search) {      
      conditions = searchConditions(req.query.search);
  }
  
  models.Quiz.findAll(conditions).then(
      function(quizes) {
	res.render('quizes/index.ejs', { quizes: quizes, errors: [] });
      }
  ).catch(function(error) { next(error);})
};

// http://docs.sequelizejs.com/en/latest/docs/querying/
function searchConditions(search) {
  conditions = {
    where: ["pregunta like ?", patternLike(keyWords(search))],
    order: [['pregunta', 'ASC']],
  };
  
  return conditions;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
function keyWords(search) {  
  var separator = ' ';
  var words = search.split(separator);  
    
  return words;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2Fjoin
function patternLike(words) {
  var separator = '%';
  var pattern = separator + words.join(separator) + separator;
  
  return pattern;
}



// GET /quizes/:id
exports.show = function(req, res) {    
  res.render('quizes/show', { quiz: req.quiz, errors: [] });
}; 


// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz; // autoload de instancia de quiz
  
  res.render('quizes/edit', { quiz: quiz, errors: [] });
};

exports.update = function(req, res) {
  req.quiz.pregunta = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;  
  req.quiz.tema = req.body.quiz.tema;

  err = req.quiz.validate();
  if (err) {
    res.render('quizes/edit', { quiz: req.quiz, errors: convertErrorsQuizInObjetErrors(err) });
  } else {
    req.quiz
    .save( {fields: ["pregunta", "respuesta", "tema"] })		// save: guarda campos pregunta y respuesta en DB
    .then( function(){ res.redirect('/quizes'); });	// Redirección HTTP a lista de preguntas (URL relativo)
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

  
// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    var resultado = 'Correcto';
  } 
  res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado, errors: [] });
};


// DELETE /quizes/:id
exports.destroy = function (req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){ next(error) });  
};