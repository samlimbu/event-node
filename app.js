const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const config = require('./config/database');
const categoryRouter = require('./routes/category');
const eventRouter = require('./routes/event');
const eventDetailRouter = require('./routes/event_detail');
const sseRouter = require('./routes/sse');
const userRouter = require('./routes/users');
const passport = require('passport');
require('./config/passport')(passport)


mongoose.connect(config.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

function connectStatus() {
  console.log(`Connected Sucessfully ${config.database}`);
}

mongoose.connection.on('connected', connectStatus);
mongoose.connection.on('error', (err) => {
  console.log(`Db error:${err}`);
})

const app = express(config.database);

// app.options('*', cors()) 
app.use(cors());
app.use(express.json({
  limit: '50mb'
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(session({
  secret: config.secret,
  resave: false,
  saveUninitialized: true
}))

//passoport middleware require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use('/sse', sseRouter);
app.use('/category', passport.authenticate('jwt', { session: false }),categoryRouter);
app.use('/event',passport.authenticate('jwt', { session: false }), eventRouter);
app.use('/user', userRouter);
app.use('/event_detail',passport.authenticate('jwt', { session: false }), eventDetailRouter);
app.get('/test', (req, res, next) => {
  res.json({ res: 'ok' });
});


const hostname = '127.0.0.1';
const port = process.env.PORT || 8000 || 4000 || 3000 || 8080;

app.listen(port, () => {
  console.log(`server started on port ${port} on hostname ${hostname}`)
});