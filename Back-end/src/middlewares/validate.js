import { ValidationError } from '../utils/errors.js';

/**
 * Reusable request validation middleware using Zod.
 * Can validate body, query, and params schemas simultaneously or individual schemas.
 * Replaces request targets with their parsed (and coerced/sanitized) data on success.
 *
 * @param {import('zod').ZodTypeAny | { body?: import('zod').ZodTypeAny, query?: import('zod').ZodTypeAny, params?: import('zod').ZodTypeAny }} schemas
 */
export const validate = (schemas) => {
  return (req, res, next) => {
    // If a Zod schema is passed directly without an object wrapper, validate req.body by default
    const targets =
      schemas && typeof schemas.safeParse === 'function' ? { body: schemas } : schemas;

    const validationErrors = {};

    for (const [target, schema] of Object.entries(targets)) {
      if (!schema || typeof schema.safeParse !== 'function') continue;

      const result = schema.safeParse(req[target]);

      if (!result.success) {
        validationErrors[target] = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
      } else {
        // Assign parsed and coerced data back to the request object
        req[target] = result.data;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return next(new ValidationError('Request validation failed', validationErrors));
    }

    next();
  };
};

export default validate;
