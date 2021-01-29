const mongoose = require('mongoose')
mongoose.models = {};
// mongoose.modelSchemas = {};
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Review', reviewSchema)