const express = require('express')
const userRouter = require('./routers/userRouter')
const taskRouter = require('./routers/taskRouter')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
app.get('/', (req,res) => {
    res.send('<h1>API running on port ${port}</h1>')
})


app.listen(port, () => {
    console.log("Running at ", port);
    
})