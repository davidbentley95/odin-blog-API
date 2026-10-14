import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { loginRules } from '../middleware/validate.js';

const authRouter = Router();

authRouter.post('/login', loginRules, authController.login);
authRouter.get('/me', requireAuth, authController.me);

export default authRouter;
