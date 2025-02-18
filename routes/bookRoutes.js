// routes/bookRoutes.js
const router = require('express').Router();
const { authenticate } = require('../middlewares/authMiddleware');
const uploadFields = require('../middlewares/upload');
const {
    uploadBook,
    getBooks,
    getBook,
    getCategories,
    deleteBook,
    updateBookSoldStatus,
} = require('../controllers/bookController');

// Routes
router.post('/books', authenticate, uploadFields, uploadBook);
router.get('/books', getBooks);
router.get('/books/:id', getBook);
router.get('/categories', getCategories);
router.delete('/books/:id', authenticate, deleteBook);
router.patch('/books/:id/sold', authenticate, updateBookSoldStatus);

module.exports = router;