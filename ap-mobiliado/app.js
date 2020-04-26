const express = require('express')
const session = require('express-session')
const handlebars = require('express-handlebars')
const bodyparser = require('body-parser')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const path = require('path')
const passport = require('passport')
const fs = require('fs')
require("./config/auth")(passport)

const admin = require('./routes/admin')
const app = express()

global.header = null;

//Configurations
//Session
app.use(session({
    secret: "apmobiliado",
    cookie: {maxAge: 60000},
    rolling: true,
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

//Middleware
app.use((req, res, next) => {
    if(global.header == null){
        global.header = 'img/header';
        if(fs.existsSync('./public/' + header + '.png')){
            global.header = global.header+'.png';
        }else if(fs.existsSync('./public/' + global.header + '.jpg')){
            global.header = global.header+'.jpg';
        }else if(fs.existsSync('./public/' + global.header + '.jpeg')){
            global.header = global.header+'.jpeg';
        }else{
            global.header = null;
        }
    }
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next()
})

//BodyParser
app.use(bodyparser.urlencoded({extended: true}))
app.use(bodyparser.json())

//Handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

//Mongoose
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/apmobiliado', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => {
    console.log("Conectado ao MongoDB.")
}).catch(err => {
    console.log(`Erro ao se conectar ao MongoDB: ${err}` )
})

//Public
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.get('/', (req, res) => {
    res.render('index', {title: "Apartamento mobiliado", showCarrousel: true, header: global.header})
})

app.get('/agenda', (req, res) => {
    res.render('agenda', {showCarrousel: false, header: global.header})
})

app.get('/musica', (req, res) => {
    res.render('musicas', {showCarrousel: false, header: global.header})
})

app.get('/videos', (req, res) => {
    res.render('videos', {showCarrousel: false, header: global.header})
})

app.get('/sobre', (req, res) => {
    res.render('sobre', {showCarrousel: false, header: global.header})
})

app.get('/contato', (req, res) => {
    res.render('contato', {showCarrousel: false, header: global.header})
})

app.use('/admin', admin)

const PORT = 8080
const HOST = 'dev.teste'
app.listen(PORT, HOST, () => {
    console.log(`Servidor iniciado na url http://${HOST}:${PORT}`)
})