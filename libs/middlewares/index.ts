

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details: any;

    constructor(message: string, statusCode: number, isOperational = true, details: any = null) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message="invalid req data", details: any = null) {
        super(message, 400, true, details);
    }
}

export class AuthenticationError extends AppError {
    constructor(message="unauthorized", details: any = null) {
        super(message, 401, true, details);
    }
}

export class ForbiddenError extends AppError {
    constructor(message="forbidden", details: any = null) {
        super(message, 403, true, details);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string, details: any = null) {
        super(message, 404, true, details);
    }
}

export class ConflictError extends AppError {
    constructor(message="conflict", details: any = null) {
        super(message, 409, true, details);
    }
}

export class DatabaseError extends AppError {
    constructor(message="database error", details: any = null) {
        super(message, 500, true, details);
    }
}

export class RateLimitError extends AppError {
    constructor(message="rate limit exceeded", details: any = null) {
        super(message, 429, true, details);
    }
}

export class InternalServerError extends AppError {
    constructor(message="internal server error", details: any = null) {
        super(message, 500, false, details);
    }
}

