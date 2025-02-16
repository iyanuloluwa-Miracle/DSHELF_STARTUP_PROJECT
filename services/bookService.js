const Book = require('../models/Book');
const { uploadToCloudinary } = require('../utils/cloudinary');

const uploadBookService = async (bookData, files, userId) => {
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

    if (!files || !files.pdf || !files.mainImage) {
        throw new Error('PDF file and Main image are required');
    }

    // Upload files to Cloudinary
    const pdfResult = await uploadToCloudinary(files.pdf[0], 'pdfs');
    const mainImageResult = await uploadToCloudinary(files.mainImage[0], 'images');

    let additionalImageUrls = [];
    if (files.additionalImages) {
        for (const image of files.additionalImages) {
            const result = await uploadToCloudinary(image, 'images');
            additionalImageUrls.push(result.secure_url);
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
        pdfUrl: pdfResult.secure_url,
        mainImageUrl: mainImageResult.secure_url,
        additionalImages: additionalImageUrls,
        userId
    });

    await book.save();
    return book;
};

const getBooksService = async (queryParams) => {
    const { page = 1, limit = 10, search, category, condition, format } = queryParams;
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

module.exports = {
    uploadBookService,
    getBooksService,
    getBookService,
    getCategoriesService,
    deleteBookService,
};

