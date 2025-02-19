const Book = require('../models/Book');
const { uploadToCloudinary, deleteFromCloudinary} = require('../utils/cloudinary');

const uploadBookService = async (bookData, files, userId) => {
    console.log("Received files:", files);

    const {
        name,
        authorName,
        price,
        location,
        condition,
        category,
        format,
        defects,
        contactLink,
        description
    } = bookData;

    if (!name || !authorName || !price || !location || !condition || !category || !format || !contactLink || !description) {
        throw new Error('All required fields must be filled');
    }

    // Validate file uploads based on format
    if (format === 'E-book') {
        if (!files.pdf) {
            throw new Error('PDF file is required for E-books');
        }
        if (files.mainImage) {
            throw new Error('Main image should not be uploaded for E-books');
        }
    } else if (format === 'Hard Copy') {
        if (!files.mainImage) {
            throw new Error('Main image is required for Hard Copy books');
        }
        if (files.pdf) {
            throw new Error('PDF should not be uploaded for Hard Copy books');
        }
    }

    try {
        let pdfUrl = null;
        let mainImageUrl = null;
        let additionalImageUrls = [];

        // Upload PDF for E-books
        if (format === 'E-book' && files.pdf) {
            console.log("Uploading PDF file...");
            const pdfResult = await uploadToCloudinary(files.pdf[0], 'pdfs');
            pdfUrl = pdfResult.secure_url;
            console.log("PDF uploaded successfully:", pdfUrl);
        }

        // Upload main image for Hard Copy books
        if (format === 'Hard Copy' && files.mainImage) {
            console.log("Uploading main image...");
            const mainImageResult = await uploadToCloudinary(files.mainImage[0], 'images');
            mainImageUrl = mainImageResult.secure_url;
            console.log("Main image uploaded successfully:", mainImageUrl);
        }

        // Upload additional images (if any)
        if (files.additionalImages) {
            console.log("Uploading additional images...");
            for (const image of files.additionalImages) {
                const result = await uploadToCloudinary(image, 'images');
                additionalImageUrls.push(result.secure_url);
                console.log("Additional image uploaded:", result.secure_url);
            }
        }

        // Create new book/article
        const book = new Book({
            name,
            authorName,
            price,
            location,
            condition,
            category,
            format,
            defects: defects || '',
            contactLink,
            description,
            pdfUrl,
            mainImageUrl,
            additionalImages: additionalImageUrls,
            userId
        });

        await book.save();
        return book;
    } catch (error) {
        console.error("Error uploading files:", error);
        throw error;
    }
};

const getBooksService = async (queryParams) => {
    const { 
        page = 1, 
        limit = 10, 
        search, 
        category, 
        condition, 
        format,
        isSold  // Add this parameter
    } = queryParams;
    
    const skip = (page - 1) * limit;
    const query = {};

    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    if (category) {
        query.category = category;
    }

    if (condition) {
        query.condition = condition;
    }

    if (format) {
        query.format = format;
    }

    // Add isSold filter
    if (isSold !== undefined) {
        query.isSold = isSold === 'true';
    }

    const books = await Book.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email');

    const total = await Book.countDocuments(query);

    return {
        books,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};

const getBookService = async (bookId) => {
    const book = await Book.findById(bookId).populate('userId', 'firstName lastName email');
    if (!book) {
        throw new Error('Book not found');
    }
    return book;
};

const getCategoriesService = async () => {
    const categories = Book.schema.path('category').enumValues;
    return categories;
};

const deleteBookService = async (bookId) => {
    const book = await Book.findByIdAndDelete(bookId);
    if (!book) {
        throw new Error('Book not found');
    }

    // Delete associated files from Cloudinary
    await deleteFromCloudinary(book.pdfUrl);
    await deleteFromCloudinary(book.mainImageUrl);
    for (const imageUrl of book.additionalImages) {
        await deleteFromCloudinary(imageUrl);
    }

    return book;
};

const updateBookSoldStatusService = async (bookId, userId) => {
    const book = await Book.findOne({ _id: bookId, userId });
    if (!book) {
        throw new Error('Book not found or you are not authorized');
    }
    book.isSold = true;
    await book.save();
    return book;
};


const getUserBooksService = async (userId, queryParams) => {
    const { page = 1, limit = 10 } = queryParams;
    const skip = (page - 1) * limit;

    const books = await Book.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Book.countDocuments({ userId });

    return {
        books,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};

module.exports = {
    updateBookSoldStatusService,
    uploadBookService,
    getBooksService,
    getBookService,
    getCategoriesService,
    deleteBookService,
    getUserBooksService,
};

