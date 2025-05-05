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
    getUserBooks
} = require('../controllers/bookController');

// Routes
router.post('/upload', authenticate, uploadFields, uploadBook);
router.get('/', getBooks);
router.get('/user', authenticate, getUserBooks);
router.get('/:id', getBook);
router.get('/categories', getCategories);
router.delete('/:id', authenticate, deleteBook);
router.patch('/:id/sold', authenticate, updateBookSoldStatus);

module.exports = router;