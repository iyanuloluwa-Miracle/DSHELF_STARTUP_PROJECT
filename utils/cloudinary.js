// utils/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (file, folder) => {
    return new Promise((resolve, reject) => {
        let uploadOptions = {
            folder,
            resource_type: folder === 'pdfs' ? 'raw' : 'image'
        };

        // Add specific options for PDFs
        if (folder === 'pdfs') {
            uploadOptions = {
                ...uploadOptions,
                format: 'pdf',
                flags: 'attachment',
                use_filename: true,
                unique_filename: true,
                type: 'upload'
            };
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    reject(new Error(`Failed to upload file to Cloudinary: ${error.message}`));
                } else {
                    // For PDFs, modify the URL to ensure proper viewing
                    if (folder === 'pdfs') {
                        result.secure_url = result.secure_url.replace('/upload/', '/upload/fl_attachment/');
                    }
                    console.log("Cloudinary Upload Success:", result.secure_url);
                    resolve(result);
                }
            }
        );
        uploadStream.end(file.buffer);
    });
};

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary
};