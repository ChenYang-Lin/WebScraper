const bcrypt = require('bcrypt')
const Admin = require("../models/admin"); 
let { setUser } = require("../passport-config.js");

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/admin/subscription')
    }
    next();
}


const auth_get_login = (req, res) => {
    res.render("login.ejs");
}

const auth_get_register = (req, res) => {
    res.render("register.ejs")
}

const auth_post_register = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        let user = new Admin({
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword,
        });
        await user.save()
        .then((result) => {
          users = result;
          // console.log(result);
        })
        .catch((err) => {
          console.log(err);
        })
        await Admin.find().then((result) => {
          setUser(result);
        })
        res.redirect('/login');
    } catch {
        res.redirect('/register')
    }
    // console.log(users);
}

const auth_delete_logout = (req, res) => {
    req.logout();
    res.redirect('/login');
}

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated,
    auth_get_login,
    auth_get_register,
    auth_post_register,
    auth_delete_logout,
}