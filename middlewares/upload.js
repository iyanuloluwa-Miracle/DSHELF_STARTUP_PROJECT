const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Check file types
        if (file.fieldname === 'pdf') {
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Only PDF files are allowed for E-books'));
            }
        } else if (file.fieldname === 'mainImage' || file.fieldname === 'additionalImages') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed'));
            }
        } else {
            cb(new Error(`Unexpected field: ${file.fieldname}`));
        }
    }
});

const uploadFields = upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 } // Allow up to 5 additional images
]);

// Error handling middleware for Multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 10MB'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: `Invalid field name: ${err.field}. Expected fields are: pdf, mainImage, additionalImages`
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    }
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

module.exports = { uploadFields, handleMulterError };