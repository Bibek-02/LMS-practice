import mongoose from 'mongoose';
import Member from '../models/memberModel.js';
import {ok, fail} from '../utils/apiResponse.js';

const isId = (id) => mongoose.Types.ObjectId.isValid(id);

/**POST /api/members */
export const createMember = async(req, res, next) => {
    try{
        const{name,email, address, password, member_since, expiry_date, active, notes} = req.body ??{};

        if (!name?.trim() || !email?.trim() || !password) {
            return fail(res, "name, email and password are required", 422, {fields: ["name", "email", "password"]});
        }
        // Uniqueness check
        const exists = await Member.findOne({email: email.trim().toLowerCase()}).lean()
        if(exists)
            return fail(res, "Email is already registered", 409, {fields: ["email"]});

        const member = await Member.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            address, 
            password,
            member_since,
            expiry_date,
            active, 
            notes
        });

        //Ensuring password never leaks
        const doc = member.toObject ? member.toObject() : member;
        const{ password: _pw, __v, _id, ...rest} = doc;
        const safe = { id: String(_id), ...rest};

        return ok(res, safe, "Member created succesfully", 201);
    }catch (err) {
        if(err?.code === 11000 && err?.keyPattern?.email) {
            err.status = 409;
            err.message = "Email already exists";
        }
        next(err);
    }
}

