module.exports = (req) => {
    const db = require('../../database')
    cookie = req.signedCookies.login_info.split(":")
    return new Promise((resolve,reject) => { 
        db.query("SELECT * FROM admin WHERE username = ? AND password = ?", [cookie[0],cookie[1]], (err,result) => {
            if(result.length > 0) {
                resolve(result)
            } else {
                reject(err)
            }
        })
    })
}