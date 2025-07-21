const bd = require('mongoose')

bd.Promise = global.Promise

async function connection(uri) {
    await bd.connect(uri, {
        // useNewUrlParser:true,
        // useUnifiedTopology:true,
        dbName:'Game'
    })
    .then((data) => {
        console.log('[db] - Conexión exitosa.')
    })
    .catch((error) => {
        console.log('[error log] - ' + error)
    })
}

module.exports = connection