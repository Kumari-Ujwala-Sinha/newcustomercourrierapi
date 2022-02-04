require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const path = require('path')


const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles: true
}))

// Routes
app.use('/user', require('./routes/userRouter'))
app.use('/api', require('./routes/productRouter'))
app.use('/api', require('./routes/ratecalcRouter'))

app.use('/api', require('./routes/customerfeedRouter'))


// Connect to mongodb
const URI = process.env.MONGODB_URL
mongoose.connect(URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if(err) throw err;
    console.log("Connected to mongodb")
})


app.get('/', (req, res)=>{
    res.send('Server is ready and connected to db ')
})

const PORT = process.env.PORT || 7000
app.listen(PORT, () => {
    console.log('Server is running on port', PORT)
})