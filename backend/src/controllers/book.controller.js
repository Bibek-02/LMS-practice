import moongoose from 'mongoose';
import Book from '../models/bookModel.js';
import {ok, fail} from '../utils/apiResponse.js';

const isId = (id) => moongoose.Types.ObjectId.isValid(id);

/** POST /api/books */
export const createBook = async (req, res, next) => {
    try{
        const { title, author,isbn, publishedDate, availabile, added_on } = req.body;
        
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

/** GET /api/books */
export const getBooks = async (req, res, next) => {
    try{
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) ||10));
        const skip = (page -1) * limit;

        const q = req.querry.q?.trim();

        const filter = q ? {
            $or: [{title: new RegExp(q, "i")}, {author: new RegExp(q, "i")},
                {isbn: new RegExp(q, "i")}]} : {};

        const[items, total] = await Promise.all([
            (await Book.find(filter)).toSort({added_on: -1}).skip(skip).limit(limit).lean(),
            Book.countDocuments(filter)
        ]);
        return ok(res, {items, page, limit, total}, "Books fetched sucessfully");
    }catch(err){
        next(err);
    }
}