const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const multer = require('multer')
const path = require('path')
const {protectAdmin} = require('../helpers/protectAdmin')

require('../models/User')
const User = mongoose.model('users')
const router = express.Router()

const header_storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/')
    },
    filename: (req, file, cb) => {
        cb(null, 'header' + path.extname(file.originalname))
    }
})
const header_upload = multer({
    storage: header_storage,
    fileFilter: (req, file, cb) => {
        if(!file.mimetype.includes("jpeg") && !file.mimetype.includes("jpg") && !file.mimetype.includes("png")){
            console.log(file.mimetype)
            return cb(new Error("Apenas são permitidas imagens do tipo jpg ou png"), false);
        }else{
            cb(null, true);
        }
    }
})


router.get('/', (req, res) => {
    res.render('admin/login', {showCarousel: false, title: "Administration login", header: global.header})
})

router.post('/', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admin/dashboard',
        failureRedirect: '/admin',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash("success_msg", "Deslogado com sucesso!")
    res.redirect("/")
})

router.get('/dashboard', protectAdmin, (req, res) => {
    res.render('admin/index', {layout: 'dashboard', title: 'Dashboard'})
})

router.get('/users/create', protectAdmin, (req, res) => {
    res.render('admin/createUser', {layout: 'dashboard', title: 'Criar usuário'})
})

router.get('/users/remove', protectAdmin, (req, res) => {
    User.find().lean().then(users => {
        res.render('admin/removeUser', {layout: 'dashboard', title: 'Remover usuário', users: users})       
    }).catch(err => {
        res.flash('error_msg', "Não foi possível listar os usuários, tente novamente")
        res.redirect('/admin/dashboard')
    })
    
})

router.get('/edit/home', protectAdmin, (req, res) => {
    res.render('admin/editHome', {layout: 'dashboard', title: 'Editar página inicial'})
})

router.post('/edit/home/header_upload', protectAdmin, (req, res) => {
    header_upload.single('header_img')(req, res, err => {
        if(err){
            req.flash('error_msg', err.message)   
        }else{
            req.flash('success_msg', "Imagem do header recebida com sucesso!")
        }
        res.redirect('/admin/edit/home')
    })
    
})

router.post('/users/remove', protectAdmin, (req, res) => {
    User.remove({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Usuário removido com sucesso')
        res.redirect('/admin/users/remove')
    }).catch(error => {
        req.flash('error_msg', 'Houve um erro ao remover o usuário')
        res.redirect('/admin/users/remove')
    })
})

router.post('/users/create', protectAdmin, (req, res) => {
    var errors = []

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null){
        errors.push({text: "Nome inválido"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        errors.push({text: "E-mail inválido"})
    }
    if(!req.body.password || typeof req.body.password == undefined || req.body.password == null){
        errors.push({text: "Senha inválido"})
    }
    if(req.body.password.length < 4){
        errors.push({text: "Senha muito curta"})
    }
    if(req.body.password != req.body.password2){
        errors.push({text: "As senhas são diferentes, tente novamente"})
    }

    if(errors.length > 0){
        res.render("admin/createUser", {layout: 'dashboard', errors: errors, title: 'Criar usuário'})
    }else{
        User.findOne({email: req.body.email}).then(user => {
            if(user){
                req.flash('error_msg', 'Já existe um usuário com esse e-mail')
                res.redirect('/admin/users/create')
            }else{
                const newUser = {
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                }
                bcrypt.genSalt(10, (error, salt) => {
                    bcrypt.hash(newUser.password, salt, (error, hash) => {
                        if(error){
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                            res.redirect("/admin/dashboard")
                        }else{
                            newUser.password = hash
                            User.create(newUser).then(() => {
                                req.flash('success_msg', 'Usuário criado com sucesso')
                                res.redirect('/admin/dashboard')
                            }).catch(err => {
                                req.flash('error_msg', 'Erro ao salvar o usuário, tente novamente!')
                                res.redirect('/admin/users/create')
                            })
                        }
                    })
                })
            }
        }).catch(err => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/admin/dashboard')
        })
    }
})

module.exports = router