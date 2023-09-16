const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const path = require('path'); 
require('dotenv').config({ path: path.join(__dirname, '.env') });
const cookieParser = require('cookie-parser')
const crypto = require('crypto')
//Settings
const app = express()
var moment = require('moment')
timeStamp = require('./routes/modules/timestamp')
var sha256 = x => crypto.createHmac('sha256', process.env.CRYPTO_SALT).update(x, 'utf8').digest('hex')

//Database
const db = require('./database');

app.use(express.static(path.join(__dirname, "/public")))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser('VKhR0PsqQ2sRmCyzSmhp2'))

app.use(session({
	secret: 'p1EHphJNT0CTyE4cEhjgO',
	resave: true,
	saveUninitialized: true
}))

app.listen(process.env.PORT ,() => {
    timeStamp("[+] TPS01 has been started at "+process.env.PORT)
})

app.get('/', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        res.render('home')
        res.end()
    } else {
        res.redirect('/login')
        res.end()
    }
})

app.get('/login', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        res.redirect('/')
        res.end()
    } else {
        res.render('login')
        console.log(sha256("testtpspassword"))
        res.end()
    }
})

app.post('/login', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        res.redirect('/')
        res.end()
    } else {
        var username = req.body.username
        var password = sha256(req.body.password)
        var remember = req.body.remember
        if(remember == 1) {
            var expires = 29.6 * 24 * 60 * 60 * 1000
        } else { 
            var expires = 24 * 60 * 60 * 1000
        }
        db.query(`SELECT * FROM admin WHERE username = ? AND password = ? LIMIT 1`, [username,password], (err,result) => {
            if(result.length > 0) {
                req.session.loggedin = true
                req.session.username = username
                res.cookie('login_info', username+":"+password, {signed: true, maxAge: expires})
                res.cookie('alert', 'loggedin')
                res.redirect('/')
                timeStamp('[+] Login Success for '+username)
                res.end()
            } else {
                res.cookie('alert', 'wrongpassword')
                res.redirect('/login')
                res.end()
            }
        })
    }
})

app.get('/logout', (req,res) => {
    if (req.session.loggedin) {
        timeStamp('[+] '+req.signedCookies.login_info+' has been logged out.')
        req.session.destroy()
        res.clearCookie('login_info')
        res.cookie('alert', 'loggedout')
        res.redirect('/login')
        res.end()
    } else {
        res.cookie('alert', 'loggedout')
        res.redirect('/login')
        res.end()
    }
})


app.get('/get/incomes/orders', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        db.query(`SELECT ic.order_id, ic.amounts, ic.time, p.product_price, sum((p.product_price * ic.amounts)) as total 
        FROM incomes as ic JOIN products as p ON ic.product_id = p.id GROUP BY order_id`, (err,orders) => {
            if(err) throw err;
            res.render('include/get_incomes_orders', {orders:orders})
            res.end()
        })
    } else {
        res.redirect('/login')
        res.end()
    }
})

app.get('/get/incomes/orders/pages/:n', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        db.query("SELECT id FROM incomes GROUP BY order_id", (err,result) => {
            var number_of_rows = result.length
            var perpage = 10
            var pages = Math.ceil(number_of_rows / perpage)
            if(req.params.n != undefined) {
                if(req.params.n == 1) {
                    start = 0
                } 
                if(req.params.n > 1) {
                    pages = req.params.n - 1
                    start = pages * perpage
                }
            }
            db.query(`SELECT ic.order_id, ic.amounts, ic.time, p.product_price, sum((p.product_price * ic.amounts)) as total 
            FROM incomes as ic JOIN products as p ON ic.product_id = p.id GROUP BY order_id ORDER BY ic.order_id DESC LIMIT ?,?`, [start,perpage], (err,orders) => {
                if(err) throw err;
                res.render('include/get_incomes_orders', {orders:orders})
                res.end()
            })
        })
    } else {
        res.redirect('/login')
        res.end()
    }
})

app.get('/get/incomes/ordering/:start/:end', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        start = req.params.start
        end = req.params.end
        db.query(`SELECT ic.order_id, ic.amounts, ic.time, p.product_price, sum((p.product_price * ic.amounts)) as total, a.username FROM incomes as ic JOIN products as p ON ic.product_id = p.id JOIN admin as a ON ic.admin_id = a.id WHERE ic.time between ? and ? GROUP BY ic.order_id`, [start,end], (err,orders) => {
            if(err) throw err;
            res.render('include/get_incomes_ordering', {orders:orders})
            res.end()
        })
    } else {
        res.redirect('/login')
        res.end()
    }
})

app.get('/get/outcomes/ordering/:start/:end', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        start = req.params.start
        end = req.params.end
        db.query(`SELECT oc.id, oc.title, oc.amounts, oc.admin_id, oc.time, a.username FROM outcomes as oc JOIN admin as a ON oc.admin_id = a.id WHERE time between ? and ? ORDER BY oc.id DESC`, [start,end], (err,orders) => {
            if(err) throw err;
            res.render('include/get_outcomes_ordering', {orders:orders})
            res.end()
        })
    } else {
        res.redirect('/login')
        res.end()
    }
})

app.get('/get/incomes', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        db.query(`SELECT ic.product_id, ic.amounts, p.product_name, p.product_price, ic.time, ic.order_id, (ic.amounts * p.product_price) as total FROM incomes as ic JOIN products as p ON ic.product_id = p.id ORDER BY ic.id DESC`, (err,incomes) => {
            res.render('include/get_incomes',{incomes:incomes})
            res.end()
        })
    } else {
        res.redirect('/login')
        res.end()
    }
})

app.get('/get/incomes/pages/:n', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        db.query("SELECT id FROM incomes", (err,result) => {
            var number_of_rows = result.length
            var perpage = 10
            var pages = Math.ceil(number_of_rows / perpage)
            if(req.params.n != undefined) {
                if(req.params.n == 1) {
                    start = 0
                } 
                if(req.params.n > 1) {
                    pages = req.params.n - 1
                    start = pages * perpage
                }
            }
            db.query(`SELECT ic.product_id, ic.amounts, p.product_name, p.product_price, ic.time, ic.order_id, (ic.amounts * p.product_price) as total, a.username FROM incomes as ic JOIN products as p ON ic.product_id = p.id JOIN admin as a ON a.id = ic.admin_id ORDER BY ic.id DESC LIMIT ?,?`, [start,perpage], (err,incomes) => {
                if(err) throw err;
                res.render('include/get_incomes',{incomes:incomes})
                res.end()
            })
        }) 
    } else {
        res.redirect('/login')
        res.end()
    }
})

app.get('/get/result/ordering/:start/:end', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        start = req.params.start
        end = req.params.end
        db.query(`SELECT ic.order_id, ic.amounts, ic.time, p.product_price, sum((p.product_price * ic.amounts)) as total FROM incomes as ic JOIN products as p ON ic.product_id = p.id WHERE ic.time between ? and ? GROUP BY ic.order_id`, [start,end], (err,incomes_orders) => {
            if(err) throw err;
            db.query(`SELECT id, title, amounts, time FROM outcomes WHERE time between ? and ? ORDER BY id DESC`, [start,end], (err,outcomes_orders) => {
                if(err) throw err;
                res.render('include/get_result_ordering', {incomes_orders:incomes_orders,outcomes_orders:outcomes_orders})
                res.end()
            })
        })
    } else {
        res.redirect('/login')
        res.end()
    }
})

app.get('/get/outcomes', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        db.query(`SELECT * FROM outcomes ORDER BY id DESC`, (err,outcomes) => {
            if(err) throw err;
            res.render('include/get_outcomes',{outcomes:outcomes})
            res.end()
        })
    } else {
        res.redirect('/login')
        res.end()
    }
})

app.get('/get/outcomes/pages/:n', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        db.query("SELECT id FROM outcomes", (err,result) => {
            var number_of_rows = result.length
            var perpage = 10
            var pages = Math.ceil(number_of_rows / perpage)
            if(req.params.n != undefined) {
                if(req.params.n == 1) {
                    start = 0
                } 
                if(req.params.n > 1) {
                    pages = req.params.n - 1
                    start = pages * perpage
                }
            }
            db.query(`SELECT oc.id, oc.title, oc.amounts, oc.time, oc.admin_id, a.username FROM outcomes as oc JOIN admin as a ON a.id = oc.admin_id ORDER BY id DESC LIMIT ?,?`, [start,perpage], (err,outcomes) => {
                if(err) throw err;
                res.render('include/get_outcomes',{outcomes:outcomes})
                res.end()
            })
        })
    } else {
        res.redirect('/login')
        res.end()
    }
})

app.get('/get/stocks', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        db.query(`SELECT s.id, s.product_id, s.amounts, p.product_name FROM stocks as s JOIN products as p ON p.id = s.product_id ORDER BY s.id DESC`, (err,stocks) => {
            if(err) throw err;
            res.render('include/get_stocks',{stocks:stocks})
            res.end()
        })
    } else {
        res.redirect('/login')
        res.end()
    }
})

app.post('/add/incomes', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        const get_admin_info = require('./routes/modules/get_admin_info')(req);
        get_admin_info.then((admin_info) => {
            const admin_id = admin_info[0].id
            var product_id = req.body.product_id
            var amounts = req.body.amounts
            if(amounts <= 0) {
                res.end()
            }
            var order_id = req.body.incomes_order_id
            time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

            db.query(`INSERT INTO incomes(product_id,amounts,order_id,time,admin_id) VALUES(?,?,?,?,?)`, [product_id,amounts,order_id,time,admin_id], (err,result) => {
                if(err) throw err;
                db.query(`SELECT amounts FROM stocks WHERE id = ?`, [product_id], (err,stock) => {
                    if(err) throw err;
                    current_amounts = parseInt(stock[0].amounts) - parseInt(amounts)
                    db.query(`UPDATE stocks SET amounts = ? WHERE product_id = ?`, [current_amounts,product_id], (err,result) => {
                        if(err) throw err;
                        res.send('OK')
                        res.end()
                    })
                })
            })
        })
    } else {
        res.redirect('/login')
        res.end()
    }
})

app.post('/add/outcomes', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        const get_admin_info = require('./routes/modules/get_admin_info')(req);
        get_admin_info.then((admin_info) => {
            const admin_id = admin_info[0].id
            var title = req.body.title
            var amounts = req.body.amounts
            if(amounts <= 0) {
                res.end()
            }
            time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

            db.query(`INSERT INTO outcomes(title,amounts,time,admin_id) VALUES(?,?,?,?)`, [title,amounts,time,admin_id], (err,result) => {
                if(err) throw err;
                res.send('OK')
                res.end()
            })
        })
    } else {
        res.redirect('/login')
        res.end()
    }
})

app.post('/restocks', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        const get_admin_info = require('./routes/modules/get_admin_info')(req);
        get_admin_info.then((admin_info) => {
            const admin_id = admin_info[0].id
            var product_id = req.body.product_id
            var amounts = req.body.amounts
            var totals = req.body.totals
            if(amounts <= 0 && totals <= 0) {
                res.end()
            }
            time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

            db.query(`INSERT INTO restocks(product_id,amounts,time,totals,admin_id) VALUES(?,?,?,?,?)`, [product_id,amounts,time,totals,admin_id], (err,result) => {
                if(err) throw err;
                db.query(`INSERT INTO outcomes(title,amounts,time,admin_id) VALUES(?,?,?,?)`, ['Restock',totals,time,admin_id], (err) => {
                    if(err) throw err;
                    db.query(`SELECT amounts FROM stocks WHERE product_id = ?`, [product_id], (err,stock) => {
                        if(err) throw err;
                        current_amounts = parseInt(stock[0].amounts) + parseInt(amounts)
                        db.query(`UPDATE stocks SET amounts = ? WHERE product_id = ?`, [current_amounts,product_id], (err,result) => {
                            if(err) throw err;
                            res.send('OK')
                            res.end()
                        })
                    })
                })
            })
        })
    } else {
        res.redirect('/login')
        res.end()
    }
})

app.get('/get/incomes/current_order_id', (req,res) => {
    const is_admin = require('./routes/modules/check_admin')(req,res)
    if (is_admin == true) {
        db.query('SELECT order_id FROM incomes ORDER BY order_id DESC LIMIT 1', (err,result) => {
            if(err) throw err;
            res.json({
                current_id: result[0].order_id
            })
            res.end()
        })
    }
})

app.get('/install', (req,res) => {
    let db = require('./database')
    const timeStamp = require('./routes/modules/timestamp')
    
    //SQL Check Install Commands
    admin_check = "SELECT * FROM admin"
    incomes_check = "SELECT * FROM incomes"
    outcomes_check = "SELECT * FROM outcomes"
    products_check = "SELECT * FROM products"
    stocks_check = "SELECT * FROM stocks"
    restocks_check = "SELECT * FROM restocks"

    //SQL Install Commands
    admin_install = `CREATE TABLE admin(id INT(11) AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(200) NOT NULL)`
    admin_user_install = `INSERT INTO admin(username,password) VALUES('admin','${sha256(process.env.MYSQL_PASSWORD)}')`
    incomes_install = `CREATE TABLE incomes(id INT(11) AUTO_INCREMENT PRIMARY KEY, product_id INT(11) NOT NULL, amounts INT(11) NOT NULL, order_id INT(11) NOT NULL, time DATETIME NOT NULL, admin_id INT(11) NOT NULL)`
    outcomes_install = `CREATE TABLE outcomes(id INT(11) AUTO_INCREMENT PRIMARY KEY,title VARCHAR(50) NOT NULL, amounts INT(12) NOT NULL, time DATETIME NOT NULL, admin_id INT(11) NOT NULL)`
    product_install = `CREATE TABLE products(id INT(11) AUTO_INCREMENT PRIMARY KEY,product_name VARCHAR(100) NOT NULL, product_price INT(12) NOT NULL DEFAULT 0)`
    restocks_instll = `CREATE TABLE restocks(id INT(11) AUTO_INCREMENT PRIMARY KEY, product_id INT(11) NOT NULL, amounts INT(12) NOT NULL DEFAULT 0, totals INT(12) NOT NULL DEFAULT 0, time DATETIME NOT NULL, admin_id INT(11) NOT NULL)`
    stocks_install = `CREATE TABLE stocks(id INT(11) AUTO_INCREMENT PRIMARY KEY, product_id INT(11) NOT NULL, amounts INT(12) NOT NULL DEFAULT 0)`

    let tables_status = {
        admin: false,
        income: false,
        outcomes: false,
        products: false,
        stocks: false,
        restocks: false
    }

    function promise_install(sql) {
        return new Promise((resolve,reject) => {
            db.query(sql, (err,result) => {
                if(err) {
                    reject(err)   
                } else {
                    resolve()
                }
            })
        })
    }

    function check_table(sql) {
        return new Promise((resolve) => {
            db.query(sql, (err,result) => {
                if(err && err.code == "ER_NO_SUCH_TABLE") {
                    resolve(false)
                } else {
                    resolve(true)
                }
            })
        })
    }

    async function install() {
        await promise_install(admin_install).catch(reject => {timeStamp(reject)})
        await promise_install(admin_user_install).catch(reject => {timeStamp(reject)})
        await promise_install(incomes_install).catch(reject => {timeStamp(reject)})
        await promise_install(outcomes_install).catch(reject => {timeStamp(reject)})
        await promise_install(product_install).catch(reject => {timeStamp(reject)})
        await promise_install(restocks_instll).catch(reject => {timeStamp(reject)})
        await promise_install(stocks_install).catch(reject => {timeStamp(reject)})
    }

    async function check_install() {
        await check_table(admin_check).then(resolve => {tables_status.admin = resolve})
        await check_table(incomes_check).then(resolve => {tables_status.incomes = resolve})
        await check_table(outcomes_check).then(resolve => {tables_status.outcomes = resolve})
        await check_table(products_check).then(resolve => {tables_status.products = resolve})
        await check_table(stocks_check).then(resolve => {tables_status.stocks = resolve})
        await check_table(restocks_check).then(resolve => {tables_status.restocks = resolve})
    }

    install().then(() => {
        res.send("Install Successfully.")
        res.end()
    })
})