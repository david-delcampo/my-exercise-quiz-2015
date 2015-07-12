var models = require('../models/models.js');
var Q = require('q');

exports.show = function(req, res) {     
  // http://questions.baiduwiki.com/questions/31006589/waiting-for-promises-code-hangs
  // https://www.npmjs.com/package/q    
  Q.all(_computeStatistics())
	  .then(function(results) {
	      res.render('statistics/show', { statistics: results, errors: [] });
	  });
};

function _computeStatistics() {
    return [
	countNumberOfQuestion(),
	countNumberOfComments(),
	computeCommentsForQuestion(),
	countQuestionWithoutComments(),    
	countQuestionWithComments()
      ];
};

function countNumberOfQuestion() { 
  // http://docs.sequelizejs.com/en/latest/api/model/#countoptions-promiseinteger
  // https://github.com/djmarland/node-app/blob/2c2773c6b3e3fbfd6a0ef9ea3113f8173a7dad03/app/models/job.js 
 
  return models.Quiz.count().then(
      function(count) {   	  
	  return { msg: "Número de preguntas", result: count };
      });  
};

function countNumberOfComments() {
  return models.Comment.count().then(
      function(count) {   	  
	  return { msg: "Número de comentarios totales", result: count };
      });    
};

function computeCommentsForQuestion() {
  var questions = countNumberOfQuestion();
  var comments = countNumberOfComments();     

  return Q.spread([questions,comments], function(compute_questions, compute_comments) {
	  var average = 0;   
	  var num_questions = compute_questions.result;
	  var num_comments = compute_comments.result;	  
	  
	  if(num_questions) {       
	    average = num_comments / num_questions;
	  }	  
	  
	  return { msg: "Número medio de comentarios por pregunta", result: average};
      });  
};

function countQuestionWithoutComments() {
  //ToDo: probar que realmente está calculando bien  
  return models.Quiz.count({
	distinct: 'Id',
	where: { "Comments.Id": null } ,
	include: [{ model: models.Comment }]
    }).then(
      function(count) {   	  
	  return { msg: "Número de preguntas sin comentarios", result: count };
      });  
};

function countQuestionWithComments() {
  //ToDo: probar que realmente está calculando bien. Genere count(*) 
  //	... no sobre el campo QuizId  
  //  Leo que tiene problemas con SQLite ?? 
  //  También, que en algunas versiones de sequelizejs, no estaba implementado
  return models.Comment.count({ distinct: 'QuizId' }).then(
      function(count) {   	  
	  return { msg: "Número de preguntas con comentarios", result: count };
      });   
};