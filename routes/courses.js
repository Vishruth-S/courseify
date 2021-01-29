const express = require('express')
const router = express.Router()
const { isLoggedIn, isAuthor } = require('../middleware')

const Course = require('../models/Course')
const User = require('../models/User')


router.get('/', async (req, res) => {
    var noMatch = ""
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const courses = await Course.find({ title: regex }).populate('author')
        if (courses.length == 0) {
            noMatch = "Sorry, no courses match your query"
        }
        res.render('courses/index', { courses: courses, noMatch: noMatch, search: req.query.search })
    } else {
        const courses = await Course.find({}).populate('author')
        res.render('courses/index', { courses: courses, noMatch: "noSearch" })
    }

})

router.get('/new', isLoggedIn, (req, res) => {
    res.render('courses/new')
})

router.post('/', isLoggedIn, async (req, res) => {
    const course = new Course(req.body.course)
    course.author = req.user._id
    await course.save()
    req.flash('success', 'Sucessfully made a new Course!')
    res.redirect(`/courses/${course._id}`)
})

router.get('/:id', async (req, res) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if (!course) {
        req.flash('error', 'Cannot find that Course')
        return res.redirect('/courses/')
    }
    const reviewsLen = course.reviews.length
    let sum = 0
    course.reviews.forEach(review => {
        sum += review.rating
    })
    const avgRating = reviewsLen > 0 ? Math.round(((sum / reviewsLen) + Number.EPSILON) * 100) / 100 : 0
    // console.log(avgRating)
    res.render('courses/show', { course, avgRating })
})

router.get('/:id/edit', isLoggedIn, isAuthor, async (req, res) => {
    const course = await Course.findById(req.params.id)
    if (!course) {
        req.flash('error', 'Cannot find that Course')
        return res.redirect('/courses/')
    }
    res.render('courses/edit', { course })
})

router.put('/:id', isLoggedIn, isAuthor, async (req, res) => {
    const { id } = req.params
    const course = await Course.findByIdAndUpdate(id, { ...req.body.course })
    req.flash('success', 'Sucessfully updated!')
    res.redirect(`/courses/${course._id}`)
})

router.delete('/:id', isLoggedIn, isAuthor, async (req, res) => {
    const { id } = req.params
    await Course.findByIdAndDelete(id)
    req.flash('success', 'Course was deleted successfully')
    res.redirect('/courses')
})

router.post('/:id/enroll/', isLoggedIn, async (req, res) => {
    const course = await Course.findById(req.params.id)
    const user = await User.findById(req.user._id)
    course.enrollers.push(req.user._id)
    user.myCourses.push(course)
    await user.save()
    await course.save()
    req.flash('success', 'Enrolled successfully')
    res.redirect(`/courses/${course._id}`)
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router