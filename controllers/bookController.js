const { uploadBookService, getBooksService, getBookService, deleteBookService,getCategoriesService, updateBookSoldStatusService,getUserBooksService } = require('../services/bookService');
const { successResponse, errorResponse, HttpStatus } = require('../helpers/responses');
const { uploadToCloudinary, deleteFromCloudinary} = require('../utils/cloudinary');
const uploadBook = async (req, res) => {
    let uploadedFiles = [];

    try {
        // 1. Validate request
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "No files were uploaded."
            });
        }

        // 2. Validate additional images
        if (!req.files.additionalImages || req.files.additionalImages.length < 1) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "At least 1 additional image is required"
            });
        }

        // 3. Validate required fields
        const requiredFields = ['name', 'authorName', 'price', 'location', 'condition', 'category', 'format', 'description', 'contactLink'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // 4. Process file uploads
        let pdfUrl = null;
        let mainImageUrl = null;
        let additionalImageUrls = [];

        // Handle PDF upload
        if (req.files.pdf) {
            const pdfResult = await uploadToCloudinary(req.files.pdf[0], 'pdfs');
            pdfUrl = pdfResult.secure_url;
            uploadedFiles.push(pdfUrl);
        }

        // Handle main image upload
        if (req.files.mainImage) {
            const mainImageResult = await uploadToCloudinary(req.files.mainImage[0], 'images');
            mainImageUrl = mainImageResult.secure_url;
            uploadedFiles.push(mainImageUrl);
        }

        // Handle additional images
        if (req.files.additionalImages) {
            const uploadPromises = req.files.additionalImages.map(file => 
                uploadToCloudinary(file, 'images')
            );
            const results = await Promise.all(uploadPromises);
            additionalImageUrls = results.map(result => result.secure_url);
            uploadedFiles = uploadedFiles.concat(additionalImageUrls);
        }

        // 5. Validate file combinations based on format
        if (req.body.format === 'E-book' && !pdfUrl) {
            throw new Error("PDF file is required for E-book format");
        }

        if (req.body.format === 'Hard Copy' && !mainImageUrl) {
            throw new Error("Main image is required for Hard Copy format");
        }

        if (pdfUrl && mainImageUrl) {
            throw new Error("Cannot upload both PDF and images. Choose either E-book or Hard Copy format.");
        }

        // 6. Create book with uploaded files
        const bookData = {
            ...req.body,
            pdfUrl,
            mainImageUrl,
            additionalImages: additionalImageUrls
        };

        const book = await uploadBookService(req.user.userId, bookData);

        return res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Book uploaded successfully",
            data: book
        });

    } catch (error) {
        // Clean up uploaded files if there's an error
        try {
            await Promise.all(uploadedFiles.map(file => deleteFromCloudinary(file)));
        } catch (cleanupError) {
            console.error('Error during file cleanup:', cleanupError);
        }
        console.error('Error in uploadBook controller:', {
            error: error,
            stack: error.stack,
            location: 'controllers/bookController.js:uploadBook',
            timestamp: new Date().toISOString()
        });
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
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
        console.error('Error in getBooks controller:', {
            error: error,
            stack: error.stack,
            location: 'controllers/bookController.js:getBooks',
            timestamp: new Date().toISOString()
        });
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
        console.error('Error in getBook controller:', {
            error: error,
            stack: error.stack,
            location: 'controllers/bookController.js:getBook',
            timestamp: new Date().toISOString()
        });
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
        console.error('Error in getCategories controller:', {
            error: error,
            stack: error.stack,
            location: 'controllers/bookController.js:getCategories',
            timestamp: new Date().toISOString()
        });
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
        console.error('Error in deleteBook controller:', {
            error: error,
            stack: error.stack,
            location: 'controllers/bookController.js:deleteBook',
            timestamp: new Date().toISOString()
        });
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

const updateBookSoldStatus = async (req, res) => {
    try {
        const book = await updateBookSoldStatusService(req.params.id, req.user.userId);
        return res.status(HttpStatus.OK).json({
            success: true,
            message: 'Book marked as sold successfully',
            data: { book }
        });
    } catch (error) {
        console.error('Error in updateBookSoldStatus controller:', {
            error: error,
            stack: error.stack,
            location: 'controllers/bookController.js:updateBookSoldStatus',
            timestamp: new Date().toISOString()
        });
        return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
};

const getUserBooks = async (req, res) => {
    try {
        const result = await getUserBooksService(req.user.userId, req.query);
        return res.status(HttpStatus.OK).json({
            success: true,
            message: 'User books fetched successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in getUserBooks controller:', {
            error: error,
            stack: error.stack,
            location: 'controllers/bookController.js:getUserBooks',
            timestamp: new Date().toISOString()
        });
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = {
    getUserBooks,
    updateBookSoldStatus,
    uploadBook,
    getBooks,
    getBook,
    getCategories,
    deleteBook,
};
