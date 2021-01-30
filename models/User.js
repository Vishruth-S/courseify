const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')
const Course = require('./Course')

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
    },
    myCourses: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Course'
        }
    ]
})
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)