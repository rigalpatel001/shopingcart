const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    slug: {
        type: String
    }
});

const Category = mongoose.model('Category',CategorySchema );

module.exports = Category; 