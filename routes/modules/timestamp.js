module.exports = (message,ip) => {
    var moment = require('moment')
    time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    console.log('[ ' + time + ' ] ->', message)
}