import { Router } from "express";
import{
    createMember, 
    getMembers, 
    getMemberBYId, 
    updateMember,
    deleteMember
} from "../controllers/member.controller.js"

const router = Router();

    router.route("/")
        .post(createMember)
        .get(getMembers);

    router.route("/:id")
        .get(getMemberBYId)
        .put(updateMember)
        .delete(deleteMember);

export default router;
