import { Router } from 'express';
import * as postsController from '../controllers/postsController.js';
import * as commentsController from '../controllers/commentsController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { postRules, publishRules, commentRules, commentEditRules } from '../middleware/validate.js';

const postsRouter = Router();

// Readers see published posts; a signed-in author also sees drafts.
postsRouter.get('/', optionalAuth, postsController.list);
postsRouter.get('/:postId', optionalAuth, postsController.show);
postsRouter.post('/', requireAuth, postRules, postsController.create);
postsRouter.put('/:postId', requireAuth, postRules, postsController.update);
postsRouter.patch('/:postId/publish', requireAuth, publishRules, postsController.setPublished);
postsRouter.delete('/:postId', requireAuth, postsController.destroy);

// Anyone can read and leave comments on a published post; editing and
// deleting them is moderation, so it needs the author's token.
postsRouter.get('/:postId/comments', optionalAuth, commentsController.list);
postsRouter.post('/:postId/comments', optionalAuth, commentRules, commentsController.create);
postsRouter.put('/:postId/comments/:commentId', requireAuth, commentEditRules, commentsController.update);
postsRouter.delete('/:postId/comments/:commentId', requireAuth, commentsController.destroy);

export default postsRouter;
