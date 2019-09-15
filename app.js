const express = require('express')
const app = express()
const port = 3000

var bodyParser = require('body-parser')
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

var jwt = require('jsonwebtoken')
const privateKey = 'dauhuthom'
let token = ''

var userInfo = null
var mysql = require('mysql')
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dauhuthom'
})
connection.connect()

var md5 = require('md5')

const checkToken = (req, res, next) => {
  token = req.headers['access-token'];
  if (token) {
      jwt.verify(token, privateKey, (err, decoded) => {
        if (err) throw err
        req.userInfo = decoded
        next()
      })
  } else {
    return res.status(403).send({
      message: 'Token field!'
    });
  }
}

// -------------------body-------------------

app.get('/profile', checkToken, (req, res) => {
  return res.status(200).send(req.userInfo)
})
app.post('/login', (req, res) => {
  if (req.body.phone === '' || req.body.password === '') {
    return res.status(403).send('Login empty!')
  }
  
  let query = "SELECT * FROM users WHERE phone = '" + req.body.phone + "' AND password = '" + md5(req.body.password) + "'"
  connection.query(query, (err, rows, fields) => {
    if (err) throw err
    if (rows.length === 0) {
      return res.status(403).send('Login field!')
    }

    let data = JSON.parse(JSON.stringify(rows))
    let token = jwt.sign(data[0], privateKey)
    return res.status(200).send(token)
  })
})
app.post('/register', (req, res) => {
  if (req.body.phone === '' || req.body.password === '') {
    return res.status(403).send('Login empty!')
  }
  
  let query = "SELECT * FROM users WHERE phone = '" + req.body.phone + "'"
  connection.query(query, (err, rows, fields) => {
    if (err) throw err
    if (rows.length > 0) {
      return res.status(403).send('Phone is exists!')
    }

    let queryInser = "INSERT INTO users SET ?"
    let data = {
      phone: req.body.phone,
      password: md5(req.body.password),
      created_at: fullDateSql()
    }
    connection.query(queryInser, data, (err, rows, fields) => {
      if (err) throw err
      return res.status(200).send('Register success!')
    })
  })
})


app.get('/category-expend', checkToken, (req, res) => {
  let query = "SELECT * FROM category_expends"
  connection.query(query, (err, rows, fields) => {
    if (err) throw err
    let data = JSON.parse(JSON.stringify(rows))
    return res.status(200).send(data)
  })
})
app.post('/category-expend', checkToken, (req, res) => {
  if (req.body.name === '') {
    return res.status(403).send('Name empty!')
  }
  
  let queryInser = "INSERT INTO category_expends SET ?"
  let data = req.body
  data.user_id = req.userInfo.id
  data.created_at = fullDateSql()
  connection.query(queryInser, data, (err, rows, fields) => {
    if (err) throw err
    return res.status(200).send('Insert Category Expend success!')
  })
})
app.patch('/category-expend/:id', checkToken, (req, res) => {
  if (req.body.name === '') {
    return res.status(403).send('Name empty!')
  }
  
  let queryInser = "UPDATE category_expends SET name = ?, default_price = ?, user_id = ?, updated_at = ? WHERE id = ?"
  let data = req.body
  data.user_id = req.userInfo.id
  data.updated_at = fullDateSql()
  data.id = req.params.id
  connection.query(queryInser, Object.values(data), (err, rows, fields) => {
    if (err) throw err
    return res.status(200).send('Update Category Expend success!')
  })
})
app.delete('/category-expend/:id', checkToken, (req, res) => {
  let query = "DELETE FROM category_expends WHERE id = " + req.params.id
  connection.query(query, (err, rows, fields) => {
    if (err) throw err
    let data = JSON.parse(JSON.stringify(rows))
    return res.status(200).send('Delete Category Expend success!')
  })
})


app.get('/expend', checkToken, (req, res) => {
  let query = "SELECT * FROM expends"
  connection.query(query, (err, rows, fields) => {
    if (err) throw err
    let data = JSON.parse(JSON.stringify(rows))
    return res.status(200).send(data)
  })
})
app.post('/expend', checkToken, (req, res) => {
  if (req.body.amount === '') {
    return res.status(403).send('Amount empty!')
  }
  
  let queryInser = "INSERT INTO expends SET ?"
  let data = req.body
  data.user_id = req.userInfo.id
  data.created_at = fullDateSql()
  connection.query(queryInser, data, (err, rows, fields) => {
    if (err) throw err
    return res.status(200).send('Insert Expend success!')
  })
})
app.patch('/expend/:id', checkToken, (req, res) => {
  if (req.body.amount === '') {
    return res.status(403).send('Amount empty!')
  }
  
  let queryInser = "UPDATE expends SET amount = ?, category_expend_id = ?, user_id = ?, updated_at = ? WHERE id = ?"
  let data = req.body
  data.user_id = req.userInfo.id
  data.updated_at = fullDateSql()
  data.id = req.params.id
  connection.query(queryInser, Object.values(data), (err, rows, fields) => {
    if (err) throw err
    return res.status(200).send('Update Expend success!')
  })
})
app.delete('/expend/:id', checkToken, (req, res) => {
  let query = "DELETE FROM expends WHERE id = " + req.params.id
  connection.query(query, (err, rows, fields) => {
    if (err) throw err
    let data = JSON.parse(JSON.stringify(rows))
    return res.status(200).send('Delete Expend success!')
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

function fullDateSql() {
  let d = new Date();
  let result = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
  return result
}