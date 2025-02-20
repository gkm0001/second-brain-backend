import { Router} from 'express'
const router = Router();
import * as brainController from '../controllers/brainController'

router.post('/share',brainController.share);

router.get('/:shareLink',brainController.shareLink);

export default router