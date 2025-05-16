// routes/bookRoutes.js
const router = require('express').Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { uploadFields, handleMulterError } = require('../middlewares/upload');
const {
    uploadBook,
    getBooks,
    getBook,
    getCategories,
    deleteBook,
    updateBookSoldStatus,
    getUserBooks
} = require('../controllers/bookController');

// Routes
router.post('/books/upload', authenticate, uploadFields, handleMulterError, uploadBook);
router.get('/books', getBooks);
router.get('/user/books', authenticate, getUserBooks);
router.get('/books/:id', getBook);
router.get('/categories', getCategories);
router.delete('/books/:id', authenticate, deleteBook);
router.patch('/books/:id/sold', authenticate, updateBookSoldStatus);

module.exports = router;