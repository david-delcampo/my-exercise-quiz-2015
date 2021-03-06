var path = require('path');
var Sequelize = require('sequelize'); // Cargar Modelo ORM


var DATABASE_URL = process.env.DATABASE_URL || 'sqlite://:@:/'

// Postgres 	DATABASE_URL = postgres://user:password@host:port/database
// SQLite	DATABASE_URL = sqlite://:@:/
var url = DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name 	= ( url[6] || null );
var user 	= ( url[2] || null );
var pwd 	= ( url[3] || null );
var protocol 	= ( url[1] || null );
var dialect 	= ( url[1] || null );
var port 	= ( url[5] || null );
var host 	= ( url[4] || null );
var storage	= process.env.DATABASE_STORAGE || 'quiz.sqlite';


// Usar BBDD SQLite:
var sequelize = new Sequelize(DB_name, user, pwd,
	{ dialect: 	protocol, 
	  protocol:	protocol,
	  port:		port,
	  host:		host,	  
	  storage: 	storage,	// solo SQLite (.env)
	  omitNull:	true		// solo Postgres	
	}  
);

// Importar la definición de la tabla Quiz en quiz.js
var quiz_path = path.join(__dirname, 'quiz');
var Quiz = sequelize.import(quiz_path);

// Importar la definición de la tabla Comment
var comment_path = path.join(__dirname, 'comment');
var Comment = sequelize.import(comment_path);

// Relación Quiz 1 - N Comment
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

exports.Quiz = Quiz 		// exportar definición de tabla Quiz
exports.Comment = Comment 	// exportar definición de tabla Comment

// sequelize.sync() crea estructura tabla de preguntas en DB
sequelize.sync().success(function() {
  // success(..) ejecuta el manejador una vez creada la tabla
  Quiz.count().success(function(count) {
      if(count === 0) {
	// la tabla se inicializa solo si está vacía
	Quiz.create({ pregunta: 'Capital de Italia',
		      respuesta: 'Roma',
		      tema: 'humanidades'
		    });
	Quiz.create({ pregunta: 'Capital de Portugal',
		      respuesta: 'Lisboa',
		      tema: 'ocio'
		    })	
	  .success(function(){console.log('Base de datos inicializada')});
      };
  });
});
