import { Router} from 'express'
const router = Router();

import userAuth from '../middleware/userAuthMiddleware';
import { share } from '../controllers/brainController';


// router.post('/share',userAuth, brainController.share);

// router.get('/:shareLink',userAuth,brainController.shareLink);

router.post('/share',userAuth,share)

export default router