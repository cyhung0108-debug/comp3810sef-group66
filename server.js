require('dotenv').config();
const express        = require('express');
const mongoose       = require('mongoose');
const session        = require('cookie-session');
const methodOverride = require('method-override');
const multer         = require('multer');
const path           = require('path');
const app            = express();


mongoose.connect('mongodb+srv://candy-108:candy0108@cluster0.4h5wsd3.mongodb.net/Blog?retryWrites=true&w=majority')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.use(session({
  name: 'session',
  secret: process.env.SESSION_SECRET || 'keyboardcat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));


app.use((req, res, next) => {
  if (req.session.flash) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
  }
  next();
});


app.use((req, res, next) => {
  console.log('>>> Request:', req.method, req.url, 'body=', req.body);
  next();
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only can upload photos'));
  }
});


app.use(express.static(path.join(__dirname, 'public')));


app.use('/api', require('./routes/api'));
app.use('/', require('./routes/auth'));
app.use('/posts', upload.array('image', 5), require('./routes/posts'));
app.use('/comments', upload.single('image'), require('./routes/comments'));


app.get('/', (req, res) => res.redirect('/posts'));


app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString()
  });
});


app.use((req, res) => {
  res.status(404).render('404', { 
    title: 'Page Not Found',
    user: null 
  });
});


app.use((err, req, res, next) => {
  console.error('>>> Server error:', err.message);
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});


const PORT = process.env.PORT || 3000;


app.listen(PORT, '0.0.0.0', () => {
  console.log(Server running on http://0.0.0.0:${PORT});
});
