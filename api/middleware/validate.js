import { body, validationResult } from 'express-validator';
import { HttpError } from '../lib/httpError.js';

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  next(new HttpError(400, 'Validation failed', errors.array().map(({ path, msg }) => ({ field: path, msg }))));
}

export const loginRules = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

// PUT replaces the whole post, so title and body are both required there too.
export const postRules = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1–200 characters'),
  body('body').trim().notEmpty().withMessage('Body is required'),
  body('published').optional().isBoolean().withMessage('Published must be true or false').toBoolean(),
  handleValidation,
];

export const publishRules = [
  body('published').isBoolean().withMessage('Published must be true or false').toBoolean(),
  handleValidation,
];

export const commentRules = [
  body('authorName').trim().isLength({ min: 1, max: 50 }).withMessage('Name must be 1–50 characters'),
  body('body').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be 1–2000 characters'),
  handleValidation,
];

export const commentEditRules = [
  body('body').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be 1–2000 characters'),
  handleValidation,
];
