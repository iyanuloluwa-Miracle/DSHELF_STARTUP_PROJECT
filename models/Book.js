// models/Book.js
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Book/Article name is required']
    },
    authorName: {
        type: String,
        required: [true, 'Author name is required']
    },
    price: {
        type: String,
        required: [true, 'Price is required']
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    condition: {
        type: String,
        required: [true, 'Condition is required'],
        enum: ['New', 'Pre owned']
    },
    isSold: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        enum: [
            'Arts & Photography',
            'Children\'s Books',
            'Comics & Graphic Novels',
            'Cooking & Food',
            'Fiction',
            'Hobbies & Crafts',
            'Past Questions',
            'Non-Fiction',
            'Poetry & Drama',
            'Reference',
            'Religion & Spirituality',
            'Sports & Outdoors',
            'Tech',
            'Textbooks'
        ],
        required: [true, 'Category is required']
    },
    format: {
        type: String,
        enum: ['Hard Copy', 'E-book'],
        required: [true, 'Format is required']
    },
    defects: {
        type: String,
        default: ''
    },
    contactLink: {
        type: String,
        required: [true, 'Contact link is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    pdfUrl: {
        type: String,
        required: [true, 'PDF file is required']
    },
    mainImageUrl: {
        type: String,
        required: [true, 'Main image is required']
    },
    additionalImages: [{
        type: String
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Book', BookSchema);