const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const flash = require('connect-flash');
const {ensureAuth} = require('../config/auth');

router.get('/login',(req, res)=>{
    res.render('login');
});

router.get('/register',(req, res)=> {
    res.render('register');
});

router.post('/register',(req, res, next)=>{
    const {name, email, password, password2} = req.body;
    let errors = [];
    if(!name || !email || !password || !password2){
        errors.push({msg:'Fields are empty'});
    }
    if(password !== password2){
        errors.push({msg:'Passwords are not match'});
    }
    if(password.length < 8){
        errors.push({msg:'Passwords should be at least 8 charactres'});
    }
    if(errors.length > 0){
        res.render('register',{errors, name, email, password, password2});
    }
    else {
        User.findOne({email: email})
        .then(user=>{
            if(user){
                errors.push({msg:'This email already exists'});
                res.render('register',{errors, name, email, password, password2});
            }
            else {
                const account = new User({name, email, password});
                bcrypt.genSalt(10,(err, salt)=>{
                    if(err) throw err;
                    bcrypt.hash(account.password, salt, (err, hash)=>{
                        if(err) throw err;
                        account.password = hash;
                        account.save()
                        .then(user =>{
                            req.flash('success_msg','You are now registered');
                            res.redirect('login');
                        })
                        .catch(err=>console.log(err));
                    })
                });
            }
        }).catch((err) => next(err));
    }
});

router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/index',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', ensureAuth,(req, res)=>{
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
})

module.exports = router;