// const mysql = require('mysql');
// module.exports = mysql.createConnection({
//     host     : 'localhost',
//     user     : 'root',
//     password : 'defacto8*',
//     database : 'hamamtus'
// });

const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
require('dotenv').config();

mongoURI = process.env.mongoURI;


module.exports = (function () {
    mongoose.Promise = global.Promise;

    return {
        connect() {
            return mongoose.connect(mongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }).then(
                () => {
                    console.log('Successfully connected to mongodb');
                }
            ).catch(e => {
                console.error(e);
            });
        }
    };
})();



