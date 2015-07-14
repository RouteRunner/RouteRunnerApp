if (!process.env.heroku) var config = require('./js/config.js');

module.exports = {

 client: 'postgresql',
 connection: {
 host     : process.env.dbHost     || config.dbHost,
 user     : process.env.dbUser     || config.dbUser,
 password : process.env.dbPassword || config.dbPassword,
 database : process.env.dbName     || config.dbName
},
 pool: {
   min: 2,
   max: 10
 },
 migrations: {
   tableName: 'knex_migrations'
 }

};




// // Update with your config settings.

// module.exports = {

//   client: 'postgresql',
//   connection: {
//     database: 'calendar',
//   },
//   pool: {
//     min: 2,
//     max: 10
//   },
//   migrations: {
//     tableName: 'knex_migrations'
//   }

// };
