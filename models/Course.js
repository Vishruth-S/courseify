const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./Review')
const User = require('./User')


const courseSchema = new Schema({
    title: String,
    image: String,
    description: String,
    tags: [
        { type: String }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    enrollers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
})

courseSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model("Course", courseSchema)