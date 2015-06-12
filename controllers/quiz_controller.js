var models = require('../models/models.js');

// Autoload - factoriza el código si la ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.find(quizId).then(
    function(quiz) {
      if (quiz) {
	req.quiz = quiz;
	next()
      } else {
	next(new Error('No existe quizId=' + quizId));
      }
    }
  ).catch(function(error) { next(error); });
};
  

// GET /quizes
exports.index = function(req, res) {
  models.Quiz.findAll().then(
      function(quizes) {
	res.render('quizes/index.ejs', { quizes: quizes });
      }
  ).catch(function(error) { next(error);})
};


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



// GET /quizes/question
exports.show = function(req, res) {    
  res.render('quizes/show', { quiz: req.quiz });
}; 
  
// GET /quizes/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    var resultado = 'Correcto';
  } 
  res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado});

  
};