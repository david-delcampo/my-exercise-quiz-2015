var models = require('../models/models.js');
var Q = require('q');

// Módulo creado en formato clouse y exportación de un objeto creado
// http://howtonode.org/why-use-closure

function build_statistics() {
    var self = this;
  
    self.statistic_countNumberOfQuestion = function() { 
      // http://docs.sequelizejs.com/en/latest/api/model/#countoptions-promiseinteger
      // https://github.com/djmarland/node-app/blob/2c2773c6b3e3fbfd6a0ef9ea3113f8173a7dad03/app/models/job.js 
    
      return models.Quiz.count().then(
	  function(count) {   	  
	      return { msg: "Número de preguntas", result: count };
	  });  
    };  
    
    self.statistic_countNumberOfComments = function() {
      return models.Comment.count().then(
	  function(count) {   	  
	      return { msg: "Número de comentarios totales", result: count };
	  });    
    };
    
   self.statistic_computeCommentsForQuestion = function() {
     var questions = statistic_countNumberOfQuestion();
     var comments = statistic_countNumberOfComments();     

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
   
   // Reimplementar: 
   //	statistic_countQuestionWithoutComments
   //	statistic_countQuestionWithComments 
   // http://docs.sequelizejs.com/en/1.7.0/docs/models/#data-retrieval-finders
   
  
   // da problemas en Heroku, no parece terminar 
   self.statistic_countQuestionWithoutComments = function() {
     //ToDo: probar que realmente está calculando bien  
     return models.Quiz.count({	    
	    distinct: 'Id',
	    where: { id: [1,2] } ,
	    include: [{ model: models.Comment }]
	}).then(
	  function(count) {   	  
	      return { msg: "Número de preguntas sin comentarios", result: count };
	  });  
   };    
    
    // da problemas en Heroku, no parece terminar
    // le da problema el distinct
    self.statistic_countQuestionWithComments = function() {
      //ToDo: probar que realmente está calculando bien. Genere count(*) 
      //	... no sobre el campo QuizId  
      //  Leo que tiene problemas con SQLite ?? 
      //  También, que en algunas versiones de sequelizejs, no estaba implementado
      //return models.Comment.count({ distinct: 'QuizId' }).then(
      return models.Comment.count().then(
	  function(count) {   	  
	      return { msg: "Número de preguntas con comentarios", result: count };
	  });   
    }; 
    
    
    self.show = function(req, res) {     
      // http://questions.baiduwiki.com/questions/31006589/waiting-for-promises-code-hangs
      // https://www.npmjs.com/package/q    
      Q.all(_computeStatistics())
	  .then(function(results) {
	      res.render('statistics/show', { statistics: results, errors: [] });
	  });   
    };
	  
    
    function _computeStatistics() { 
	// Con la lista de métodos dedicados a
	// la creación de estadísticas, la obtenemos,
	// de _obtainStatisticsMehotd(), procedemos
	// a la ejecución de cada método, cada elemento
	// del array devuelto por la función indicada,
	// para la realización del computo, calculo,
	// de cada estadística. El resultado del calculo,
	// una promise, es añadido a un array de resultados,
	// el cual es devuelto para su posterior render.
      
	var statisticsMethod = _obtainStatisticsMehotd();
	var calculedStatistics = []
	
	statisticsMethod.forEach(function(statistic_method) {
	    // ejecutamos el método de calculo de la estadística
	    calculedStatistics.push( self[statistic_method]() );
	});
	
	return calculedStatistics;
    };
    
    function _obtainStatisticsMehotd() {
	// buscamos, entre los métodos del objeto (self)
	// los que son dedicados a la creación
	// de estadísticas. 
	// Se devuelve un array con los nombres
	// de los métodos encontrados
	var statisticsMethod = []; 
      
	for(var item in self) {
	  if(_isStatisticsMethod(item)) {
	    statisticsMethod.push(item);
	  }
	}      
	
	return statisticsMethod;
    }
    
    function _isStatisticsMethod(name_method) {
	// Consideramos estadística, cualquier
	// método cuyo nombre comience por statistic_
	// de esta forma, para crear una nueva
	// estadística, solo debemos crear un
	// nuevo método que la implemente y cuyo
	// nombre comience por dijo prefijo.
	// cumplimos así el principio SOLID abierto/cerrado?
      
	var isStatisticsMethod = false;
	var keyWord = 'statistic_';
	if(name_method.substring(0, keyWord.length) === keyWord) {
	    isStatisticsMethod = true;
	}
	
	return isStatisticsMethod;
    }
      
    return {
	show: self.show
    };
} 

// exportamos el controlador generado a través del objeto build_statistics
module.exports = build_statistics();