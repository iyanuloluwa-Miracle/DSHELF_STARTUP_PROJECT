const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Book/Article name is required'],
        trim: true
    },
    authorName: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true
    },
    price: {
        type: Number, // Changed from String to Number for better data handling
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    condition: {
        type: String,
        required: [true, 'Condition is required'],
        enum: {
            values: ['New', 'Pre owned'],
            message: '{VALUE} is not a valid condition'
        }
    },
    isSold: {
        type: Boolean,
        default: false,
        required: true
    },
    category: {
        type: String,
        enum: {
            values: [
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
                'Textbooks',
                'Faculty of Engineering',
                'Faculty of Science',
                'Faculty of Education',
                'Faculty of Arts',
                'Faculty of Law',
                'Faculty of Agriculture',
                'Faculty of Medicine',
                'Faculty of Pharmacy',
                'Faculty of Health Sciences',
                'Faculty of Technology',
                'Faculty of Communication',
                'Faculty of Sciences',
                'Faculty of Management Sciences',
                'Faculty of Social Sciences',
                'Faculty of Veterinary Medicine',
            


            ],
            message: '{VALUE} is not a valid category'
        },
        required: [true, 'Category is required']
    },
    format: {
        type: String,
        enum: {
            values: ['Hard Copy', 'E-book'],
            message: '{VALUE} is not a valid format'
        },
        required: [true, 'Format is required']
    },
    defects: {
        type: String,
        default: '',
        trim: true
    },
    contactLink: {
        type: String,
        required: [true, 'Contact link is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters long']
    },
    pdfUrl: {
        type: String,

    },
    mainImageUrl: {
        type: String,
    },
    additionalImages: [{
        type: String,
        validate: {
            validator: function(v) {
                return v && v.length >= 1; // Maximum 3 additional images
            },
            message: 'At least 1 additional image is required'
        }
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});

// Add indexes for better query performance
BookSchema.index({ name: 1 });
BookSchema.index({ category: 1 });
BookSchema.index({ format: 1 });
BookSchema.index({ userId: 1 });
BookSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Book', BookSchema);