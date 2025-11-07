import { Router } from "express";
import{
    createMember, getMembers
} from "../controllers/member.controller.js"

const router = Router();

    router.route("/")
        .post(createMember)
        .get(getMembers);

export default router;
