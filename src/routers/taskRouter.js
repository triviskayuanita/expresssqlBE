const router = require('express').Router()
const conn = require('../connection/connection')

router.post('/tasks', (req, res) => { // CREATE TASK
    const sql = `INSERT INTO tasks SET ?`
    const data = req.body

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err)

        res.send(result)
    })
})

router.get('/owntasks/:userid', (req, res) => { // GET OWN TASKS BY USER ID
    const sql = `SELECT * FROM tasks WHERE user_id = ?`
    const data = req.params.userid

    conn.query(sql, data, (err, result) => {
        if (err) return res.send(err)

        res.send(result)
    })
})

router.patch('/tasks/:taskid', (req, res) => { // UPDATE TASK BY TASKID
    const sql = 'UPDATE tasks SET ? WHERE id = ?'
    const data = [req.body, req.params.taskid]

    conn.query(sql, data, (err, result) => {
        if (err) return res.send(err)

        res.send(result)
    })
})

router.delete('/tasks/:taskid', (req, res) => { // DELETE TASK BY ID
    const sql = `DELETE FROM tasks WHERE id = ?`
    const data = req.params.taskid

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err)

        res.send(result)
    })
})

module.exports = router