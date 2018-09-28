const express = require('express');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const admin_pages = require('./routes/admin_pages');
const admin_categories = require('./routes/admin_categories');
const admin_products = require('./routes/admin_products');
const pages = require('./routes/pages');
const products = require('./routes/products');
const cart = require('./routes/cart');
const users = require('./routes/users');
const Category = require('./models/category');
const { Page } = require('./models/page');
const passport = require('passport');



// Intialize App
const app = express();

// setup View Engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Express fileupload Middleware

app.use(fileUpload());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// Get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});

//Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
//  cookie: { secure: true }
}));

 //Express Valdidator Middleware
  app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});


// Passport Middleware
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next) {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
 });

// Set Routes
app.use('/admin/pages',admin_pages);
app.use('/admin/categories',admin_categories);
app.use('/admin/products',admin_products);
app.use('/products',products);
app.use('/cart',cart);
app.use('/users',users);
app.use('/',pages);



app.locals.errors = null;

mongoose.connect('mongodb://localhost/shoppingcart')
.then(()=> console.log('conncted to Mongodb...'))
.catch(err => console.error('Could not conncet to mongodb....'));

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listing on Port ${port}`));