const express = require('express')
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
const crypto = require('crypto')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('admin/login', {layout: 'main'})
})

router.post('/login', (req, res) => {
    User.findOne({username: req.body.username}).lean().then((user) => {
        if(user == null){
            req.flash("error_msg", "Wrong username or password.");
            res.redirect('/admin')
        }else{
            if(user.password == req.body.password){
                req.flash("success_msg", "Login succesful!");
                switch(user.permission_level){
                    case 0:
                       res.redirect('/admin/dashboard')
                       break;
                    case 1:
                        res.redirect('/dashboard')
                        break;
                }
            }else{
                req.flash("error_msg", "Wrong username or password.");
                res.redirect('/admin')
            }
        }
    }).catch(err => {
        req.flash("error_msg", "There was an internal error");
        res.redirect('/admin/login')
    })
})

router.get('/dashboard', (req, res) => {
    res.render('admin/index', {dashboard_title: "Admin Dashboard", title:"Administration dashboard", layout: 'dashboard'})
})

module.exports = router