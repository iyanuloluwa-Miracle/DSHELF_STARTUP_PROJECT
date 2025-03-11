const Book = require("../models/Book");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");

const uploadBookService = async (userId, bookData) => {
  try {
    // 1. Extract and validate book data
    const {
      name,
      authorName,
      price,
      location,
      condition,
      category,
      format,
      description,
      contactLink,
      defects,
      pdfUrl,
      mainImageUrl,
      additionalImages,
    } = bookData;

    // 2. Validate additional images
    if (!additionalImages || additionalImages.length < 1) {
      throw new Error("At least 1 additional image is required");
    }

    // 3. Create new book instance
    const book = new Book({
      userId,
      name,
      authorName,
      price: Number(price),
      location,
      condition,
      category,
      format,
      description,
      contactLink,
      defects: defects || "",
      pdfUrl: pdfUrl || null,
      mainImageUrl: mainImageUrl || null,
      additionalImages: additionalImages || [],
      isSold: false,
    });

    // 4. Validate the book instance
    await book.validate();

    // 5. Save the book
    await book.save();

    return book;
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      throw new Error(`Validation error: ${messages.join(", ")}`);
    }

    throw error;
  }
};

const getBooksService = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    condition,
    format,
    isSold, // Add this parameter
  } = queryParams;

  const skip = (page - 1) * limit;
  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
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

  // Add isSold filter
  if (isSold !== undefined) {
    query.isSold = isSold === "true";
  }

  const books = await Book.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "firstName lastName email");

  const total = await Book.countDocuments(query);

  return {
    books,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const getBookService = async (bookId) => {
  const book = await Book.findById(bookId).populate(
    "userId",
    "firstName lastName email"
  );
  if (!book) {
    throw new Error("Book not found");
  }
  return book;
};

const getCategoriesService = async () => {
  const categories = Book.schema.path("category").enumValues;
  return categories;
};
const deleteBookService = async (bookId) => {
  const book = await Book.findByIdAndDelete(bookId);
  if (!book) {
    throw new Error("Book not found");
  }

  // Function to extract public_id from Cloudinary URL
  const extractPublicId = (url) => {
    if (!url) return null;
    const parts = url.split("/");
    const filenameWithExtension = parts.pop(); // Get the last part (filename.extension)
    const filename = filenameWithExtension.split(".")[0]; // Remove file extension
    const folder = parts.pop(); // Get the folder name (e.g., 'images')
    return `${folder}/${filename}`; // Construct public_id as "folder/filename"
  };

  // Extract and delete the main image
  const mainImagePublicId = extractPublicId(book.mainImageUrl);
  if (mainImagePublicId) {
    await deleteFromCloudinary(mainImagePublicId);
  }

  // Extract and delete each additional image
  for (const imageUrl of book.additionalImages) {
    const publicId = extractPublicId(imageUrl);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }
  }

  // Extract and delete the PDF file if it exists
  const pdfPublicId = extractPublicId(book.pdfUrl);
  if (pdfPublicId) {
    await deleteFromCloudinary(pdfPublicId);
  }

  return book;
};

const updateBookSoldStatusService = async (bookId, userId) => {
  const book = await Book.findOne({ _id: bookId, userId });
  if (!book) {
    throw new Error("Book not found or you are not authorized");
  }
  book.isSold = true;
  await book.save();
  return book;
};

const getUserBooksService = async (userId, queryParams) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    condition,
    format,
    isSold,
  } = queryParams;

  const skip = (page - 1) * limit;
  const query = { userId }; // Base query with userId

  // Add search conditions
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { authorName: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Add filters
  if (category) {
    query.category = category;
  }

  if (condition) {
    query.condition = condition;
  }

  if (format) {
    query.format = format;
  }

  if (isSold !== undefined) {
    query.isSold = isSold === "true";
  }

  const books = await Book.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "firstName lastName email");

  const total = await Book.countDocuments(query);

  return {
    books,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    filters: {
      search,
      category,
      condition,
      format,
      isSold,
    },
  };
};
module.exports = {
  updateBookSoldStatusService,
  uploadBookService,
  getBooksService,
  getBookService,
  getCategoriesService,
  deleteBookService,
  getUserBooksService,
};
