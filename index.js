const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/User')

const userRoutes = require('./routes/users')
const postRoutes = require('./routes/courses')
const reviewsRoutes = require('./routes/reviews')

const MongoDBStore = require('connect-mongo')(session)

require('dotenv').config()
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/devcraft"
// const dbUrl = "mongodb://localhost:27017/devcraft"
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error"))
db.once("open", () => {
    console.log("Database connected")
})

const PORT = process.env.PORT || 5000
const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

const secret = process.env.SECRET || 'thisisasecret'

const store = new MongoDBStore({
    url: dbUrl,
    secret: secret,
    touchAfter: 24 * 3600
})

store.on('error', function (e) {
    console.log("Session store error", e)
})


const sessionConfig = {
    store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user
    next()
})

app.use('/', userRoutes)
app.use('/courses/', postRoutes)
app.use('/courses/:id/reviews/', reviewsRoutes)

app.get('/', (req, res) => {
    res.redirect('/courses')
})


app.all('*', (req, res, next) => {
    req.flash('error', 'something went wrong')
    res.redirect('/courses/')
})

// app.get('/makepost', async (req, res) => {
//     const newPost = new Course({ title: "Test Course", description: "Test content ok" })
//     await newPost.save()
//     res.send(newPost)
// })

app.listen(PORT, () => {
    console.log(`Sever running on http://localhost:${PORT}`)
})