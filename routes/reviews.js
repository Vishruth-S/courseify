const express = require('express')
const router = express.Router({ mergeParams: true })
const { isLoggedIn, isCommentAuthor } = require('../middleware')

const Course = require('../models/Course')
const Review = require('../models/Review')

router.post('/', isLoggedIn, async (req, res) => {
    const course = await Course.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id
    course.reviews.push(review)
    await review.save()
    await course.save()
    req.flash('success', 'Review posted successfully')
    res.redirect(`/courses/${course._id}#reviews`)
})

router.delete('/:reviewId', isLoggedIn, isCommentAuthor, async (req, res) => {
    const { id, reviewId } = req.params
    await Course.findByIdAndUpdate(id, { $pull: { review: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Review was deleted successfully')
    res.redirect(`/courses/${id}`)
})

module.exports = router
