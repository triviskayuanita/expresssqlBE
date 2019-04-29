const router = require('express').Router()
const bcrypt = require('bcryptjs')
const isEmail = require('validator/lib/isEmail')
const {sendVerify} = require('../emails/sendGrid')
const conn = require('../connection/connection')
const multer = require('multer')
const path = require('path') // menentukan file gambar
const fs = require('fs') // menghapus file gambar

const uploadDir = path.join(__dirname + '/../uploads')

const storagE = multer.diskStorage({
    // Destination
    destination : function(req, file, cb) {
        cb(null, uploadDir)
    },
    // Filename
    filename : function(req, file, cb) {
        cb(null, Date.now() + file.fieldname + path.extname(file.originalname))
    }
})

const upstore = multer({
    storage: storagE,
    limits: {
        fileSize: 10000000 // Byte
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){ // will be error if the extension name is not one of these
            return cb(new Error('Please upload image file (jpg, jpeg, or png)')) 
        }
        cb(undefined, true)
    }
})

// Post Avatar
router.post('/upstore', upstore.single('avatar'), (req, res) => {
    const sql = `SELECT * FROM users WHERE username = ?`
    const sql2 = `UPDATE users SET avatar = '${req.file.filename}'
                WHERE username = '${req.body.uname}'`
    const data = req.body.uname

    conn.query(sql, data, (err, result) => {
        if (err) return res.send(err)

        conn.query(sql2, (err , result) => {
            if (err) return res.send(err)

            res.send({filename: req.file.filename})
        })
    })
})

// DELETE AVATAR
router.post('/delete', (req,res) => {
    const {username} = req.body
    const sql = `SELECT * FROM users WHERE username = '${username}'`
    const sql2 = `UPDATE users SET avatar = NULL WHERE username = '${username}'`

    conn.query(sql, (err, result) => {
        if (err) return res.send(err)

        fs.unlink(`${uploadDir}/${result[0].avatar}`, (err) => {
            if (err) return res.send (err);

            conn.query(sql2, (err, result) => {
                if (err) return res.send(err)
            
            res.send('File deleted!')
            })
          })
    })
})

// SHOW AVATAR
router.get('/avatar', (req,res)=> {
    const sql = `SELECT * FROM users WHERE username = ?`
    const data = req.body.username

    conn.query(sql, data, (err,result) => {
        if (err) return res.send(err)

        res.send({user:result, photo:`http://localhost:2010/upstore/${result[0].avatar}`})
    })
})

router.get('/upstore/:photoid', (req, res) => {
    res.sendfile(`${uploadDir}/${req.params.photoid}`) 
})


// CREATE USERS
router.post('/users', async(req, res) => { 
    var sql = `INSERT INTO users SET ?;` // Tanda tanya akan digantikan oleh variable data
    var sql2 = `SELECT * FROM users;`
    var data = req.body // Object dari user {username, name, email, password}

     // validasi untuk email
     if(!isEmail(req.body.email)) return res.send("Email is not valid")
     // ubah password yang masuk dalam bentuk hash
     req.body.password = await bcrypt.hash(req.body.password, 8)


     conn.query(sql, data, (err, result) => {
        if(err) return res.send(err.sqlMessage) // Error pada post data

        sendVerify(req.body.username, req.body.name, req.body.email)

        conn.query(sql2, (err, result) => {
            if(err) return res.send(err) // Error pada select data

            res.send(result)
        })
    })
})

// LOGIN USERS
router.post('/users/login', (req, res) => {
    const {username, password} = req.body

    const sql = `SELECT * FROM users WHERE username = '${username}'`

    conn.query(sql, async (err, result) => {
        if(err) return res.send(err.message) // Error pada query SQL

        const user = result[0] // result berupa array of object

        if(!user) return res.send("User not found") // User tidak ditemukan

        if(!user.verified) return res.send("Please, verify your email") // Belum verifikasi email

        const hash = await bcrypt.compare(password, user.password) // true / false

        if(!hash) return res.send("Wrong password") // Password salah

        res.send(user) // Kirim object user
    })
})

// DELETE USER
router.delete('/users/delete', (req, res) => { 
    const sql = `DELETE FROM users WHERE username = ?`
    const data = req.body.username

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err)

        res.send(result)
    })
})

// UPDATE USER
router.patch('/users/:userid', (req, res) => { 
    const sql = `UPDATE users SET ? WHERE id = ?`
    const data = [req.body, req.params.userid]

    conn.query(sql, data, (err, result) => {
        if (err) return res.send(err.mess)

        res.send(result)
    })
})








// VERIFY USERS
router.get('/verify', (req, res) => {
    const username = req.query.username
    const sql = `UPDATE users SET verified = true WHERE username = '${username}'`
    const sql2 = `SELECT * FROM users WHERE username = '${username}'`

    conn.query(sql, (err, result) => {
        if(err) return res.send(err.sqlMessage)

        conn.query(sql2, (err, result) => {
            if(err) return res.send(err.sqlMessage)

            res.send('<h1>Verifikasi berhasil</h1>')
        })
    })
})

module.exports = router

