const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");

const passport = require("passport")
const flash = require('express-flash');
const session = require('express-session')
const methodOverride = require('method-override')
const { initialize, getUser } = require('../passport-config');

router.use(flash());
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))
router.use(passport.initialize())
router.use(passport.session());
router.use(methodOverride('_method'))

initialize(passport, 
    email => getUser().find(user => user.email === email),
    id => getUser().find(user => user.id === id)
);


router.get('/login', authController.checkNotAuthenticated, authController.auth_get_login);
router.get("/register", authController.checkNotAuthenticated, authController.auth_get_register);
router.post("/register", authController.checkNotAuthenticated, authController.auth_post_register)
router.delete('/logout', authController.auth_delete_logout)
router.post("/login", authController.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/admin/subscription',
    failureRedirect: '/login',
    failureFlash: true,
}))


module.exports = router;