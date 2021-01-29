const express = require('express')
const passport = require('passport')
const router = express.Router()
const User = require('../models/User')
const Course = require('../models/Course')
const { isLoggedIn } = require('../middleware')

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', async (req, res, next) => {
    try {
        const { name, email, username, password } = req.body
        const user = new User({ name, email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err)
                return next(err)
            req.flash('success', "Welcome to ThisApp")
            res.redirect('/courses')
        })

    } catch (e) {
        req.flash('error', e.message)
        res.redirect('register')
    }
})

router.get('/login', (req, res) => {
    res.render('users/register')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back')
    const redirectUrl = req.session.returnTo || '/courses'
    delete req.session.returnTo
    res.redirect(redirectUrl)
})

router.get('/logout', (req, res) => {
    req.logOut()
    req.flash('success', "Logged out successfully")
    res.redirect('/courses')
})

router.get('/users/:id', async (req, res) => {
    const foundUser = await User.findById(req.params.id).populate({
        path: 'myCourses'
    })
    await Course.find().where('author').equals(foundUser._id).exec((err, courses) => {
        if (err) {
            req.flash('error', 'Something went wrong')
            return res.redirect('/courses')
        }
        res.render('users/show', { user: foundUser, courses: courses })
    })
    // let userCourses = [{}]
    // await foundUser.myCourses.forEach(async (courseId) => {
    //     let currentCourse = await Course.findById(courseId)
    //     console.log(currentCourse)
    //     await userCourses.push(currentCourse)
    // })
    // console.log(userCourses)



    // })
})

module.exports = router