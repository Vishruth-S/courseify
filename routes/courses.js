const express = require('express')
const router = express.Router()
const { isLoggedIn, isAuthor } = require('../middleware')

const Course = require('../models/Course')


router.get('/', async (req, res) => {
    const courses = await Course.find({})
    res.render('courses/index', { courses })
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
    res.render('courses/show', { course })
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
    course.enrollers.push(req.user._id)
    await course.save()
    req.flash('success', 'Enrolled successfully')
    res.redirect(`/courses/${course._id}`)
})


module.exports = router