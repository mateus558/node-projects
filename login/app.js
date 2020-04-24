const express = require('express')
const session = require('express-session')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const path = require('path');
const flash = require('connect-flash')
const admin = require('./routes/admin')

const app = express()

//Configurations
//Session configuration
app.use(session({
    secret: '123456',
    resave: true,
    saveUninitialized: true
}))
app.use(flash())
//Midleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg   = req.flash("error_msg")
    next();
})
//Sets our app to use handlebars engine
app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

//configure bodyparser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
//Set up default mongoose connection
var mongoDB = 'mongodb://localhost/bagama';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Serves to use static files
app.use(express.static(path.join(__dirname, 'public')))
//Routes
app.use('/admin', admin)

app.get('/', (req, res) => {
    res.render('index', {title: "Home"})
})

app.get('/requestaccess', (req, res) => {
    res.render('requestAccess', {title: "Request Access"})
})

app.get('/dashboard', (req, res) => {
    res.render('user/index', {dashboard_title: "User Dashboard", title: "User Dashboard", layout: 'dashboard'})
})

//Other
const PORT = 8080
const HOSTNAME = 'dev.teste'
app.listen(PORT, HOSTNAME, () => {
    console.log(`Server started at http://${HOSTNAME}:${PORT}`)
});