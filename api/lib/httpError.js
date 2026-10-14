export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Route ids arrive as strings; anything that isn't a positive integer is a 404
// rather than a Prisma validation error.
export function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, 'Not found');
  return id;
}
