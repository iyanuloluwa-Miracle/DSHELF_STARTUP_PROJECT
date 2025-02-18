const Book = require('../models/Book');
const { uploadToCloudinary, deleteFromCloudinary} = require('../utils/cloudinary');

const uploadBookService = async (bookData, files, userId) => {
    console.log("Received files:", files); // Debugging line

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

    try {
        // Upload PDF file
        console.log("Uploading PDF file..."); // Debugging line
        const pdfResult = await uploadToCloudinary(files.pdf[0], 'pdfs');
        console.log("PDF uploaded successfully:", pdfResult.secure_url); // Debugging line

        // Upload main image
        console.log("Uploading main image..."); // Debugging line
        const mainImageResult = await uploadToCloudinary(files.mainImage[0], 'images');
        console.log("Main image uploaded successfully:", mainImageResult.secure_url); // Debugging line

        // Upload additional images (if any)
        let additionalImageUrls = [];
        if (files.additionalImages) {
            console.log("Uploading additional images..."); // Debugging line
            for (const image of files.additionalImages) {
                const result = await uploadToCloudinary(image, 'images');
                additionalImageUrls.push(result.secure_url);
                console.log("Additional image uploaded:", result.secure_url); // Debugging line
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
    } catch (error) {
        console.error("Error uploading files:", error); // Debugging line
        throw error;
    }
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

const updateBookSoldStatusService = async (bookId, userId) => {
    const book = await Book.findOne({ _id: bookId, userId });
    if (!book) {
        throw new Error('Book not found or you are not authorized');
    }
    book.isSold = true;
    await book.save();
    return book;
};

module.exports = {
    updateBookSoldStatusService,
    uploadBookService,
    getBooksService,
    getBookService,
    getCategoriesService,
    deleteBookService,
};

