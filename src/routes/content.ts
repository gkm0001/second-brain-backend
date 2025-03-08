import { Router } from "express";
const router = Router();
import * as contentController from '../controllers/contentController'
import userAuth from "../middleware/userAuthMiddleware";

router.post('/uploadcontent',userAuth,contentController.uploadContent)

router.get('/allcontent',userAuth, contentController.getContent);

router.delete('/delete',userAuth , contentController.deleteContent);

export default router