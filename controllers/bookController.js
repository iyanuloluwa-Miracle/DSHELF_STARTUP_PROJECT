const { uploadBookService, getBooksService, getBookService, deleteBookService,getCategoriesService } = require('../services/bookService');
const { successResponse, errorResponse, HttpStatus } = require('../helpers/responses');

const uploadBook = async (req, res) => {
    try {
        const book = await uploadBookService(req.body, req.files, req.user.userId);
        return res.status(HttpStatus.CREATED).json({
            success: true,
            message: 'Book/Article uploaded successfully',
            data: { book }
        });
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
};

const getBooks = async (req, res) => {
    try {
        const result = await getBooksService(req.query);
        return res.status(HttpStatus.OK).json({
            success: true,
            message: 'Books fetched successfully',
            data: result
        });
    } catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};
const getBook = async (req, res) => {
    try {
        const book = await getBookService(req.params.id);
        return res.status(HttpStatus.OK).json({
            success: true,
            message: 'Book fetched successfully',
            data: { book }
        });
    } catch (error) {
        return res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            message: error.message
        });
    }
};


const getCategories = async (req, res) => {
    try {
        const categories = await getCategoriesService();
        return res.status(HttpStatus.OK).json({
            success: true,
            message: 'Categories fetched successfully',
            data: { categories }
        });
    } catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

const deleteBook = async (req, res) => {
    try {
        await deleteBookService(req.params.id);
        return res.status(HttpStatus.OK).json({
            success: true,
            message: 'Book deleted successfully'
        });
    } catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = {
    uploadBook,
    getBooks,
    getBook,
    getCategories,
    deleteBook,
};
