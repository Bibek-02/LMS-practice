import moongoose from 'mongoose';
import Book from '../models/bookModel.js';
import {ok, fail} from '../utils/apiResponse.js';

const isId = (id) => moongoose.Types.ObjectId.isValid(id);

/** POST /api/books */
export const createBook = async (req, res, next) => {
    try{
        const { title, author,isbn, publishedDate, availabile, added_on } = req.body ??{};
        
        //Basic Input Validation
        if(!title || !author){
            return fail(res, "title and author are required", 422, {fields: ["title", "author"]});
        }

        const book = await Book.create({
            title: title.trim(),
            author: author.trim(),
            isbn,
            publishedDate,
            availabile,
            added_on
        });
        return ok(res, book, "Book created successfully", 201);
    }
    catch(err){
        if (err.code === 11000) {
            err.status = 409;
            err.message = "A book with this unique field already exists."
        }
        next(err);
    }
}; 

//** GET /api/books */
export const getBooks = async (req, res, next) => {
  try {
    const url = new URL(req.originalUrl || req.url, `http://${req.headers.host}`);

    const q       = url.searchParams.get("q")?.trim() || "";
    const page    = parseInt(url.searchParams.get("page") || "1", 10);
    const limit   = parseInt(url.searchParams.get("limit") || "10", 10);
    const safePage  = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip    = (safePage - 1) * safeLimit;

    const filter = q
      ? {
          $or: [
            { title:  new RegExp(q, "i") },
            { author: new RegExp(q, "i") }
          ]
        }
      : {};

   
    const [items, total] = await Promise.all([
      Book.find(filter)
        .sort({ added_on: -1 }) 
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Book.countDocuments(filter)
    ]);

   
    return ok(res, { items, page: safePage, limit: safeLimit, total }, "Books fetched successfully");
  } catch (err) {
    next(err);
  }
};


/** GET /api/books/:id */
export const getBookById = async(req, res, next) => {
    try{
        const{id} = req.params;
        if(!isId(id)) return fail(res, "Invalid book id", 400);

        const book = await Book.findById(id).lean();
        if(!book) return fail (res, "book not found", 404);

        return ok(res, book, "Book fetched sucessfully");

    }catch(err){
        next(err);
    }
}

/** PUT /api/books/:id */
export const updateBook = async(req, res, next) => {
    try{    
        const {id} = req.params;
        if (!isId(id)) return fail(res, "Invalid book id", 400);

        const payload = {};

        [title, author, isbn, publishedDate, available, added_on].forEach((key) => {
            if (req.body[key] !== undefined) payload[key] = req.body[key];
        });

        if ("title" in payload && !payload.title?.trim()) return fail(res, "title must not be empty", 422);
        if ("author" in payload && !payload.author?.trim()) return fail (res, "author must not be empty", 422);

        const updated = await Book.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });

        if(!updated) return fail(res, "Book not found", 404);
        return ok(res, updated, "Book updated successfully");
    }catch(err){
        next(err);
    }
};

/** DELETE /api/books/:id */
export const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return fail(res, "Invalid book id", 400);

    const deleted = await Book.findByIdAndDelete(id);
    if (!deleted) return fail(res, "Book not found", 404);

    return ok(res, { id: deleted._id }, "Book deleted successfully");
  } catch (err) {
    next(err);
  }
};
