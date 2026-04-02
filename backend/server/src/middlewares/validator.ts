import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

function isZodError(error: unknown): error is { issues: { path: (string | number)[]; message: string }[] } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'issues' in error &&
    Array.isArray((error as any).issues)
  );
}

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req[source] = schema.parse(req[source]);
      next();
    } catch (error) {
      if (isZodError(error)) {
        const errors = error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }));
        res.status(400).json({ success: false, error: 'Validation failed', details: errors });
        return;
      }
      next(error);
    }
  };
}
