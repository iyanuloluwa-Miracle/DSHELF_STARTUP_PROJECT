const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadFields = upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 } // Allow up to 5 additional images
]);

module.exports = uploadFields;