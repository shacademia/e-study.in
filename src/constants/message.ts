export const MESSAGES = {
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
    INVALID_INPUT: 'The input provided is invalid. Please check and try again.',
    FORBIDDEN: 'You do not have permission to access this resource.',
    SUCCESS: 'The operation was successful.',
    CREATED: 'The resource was created successfully.',
    UPDATED: 'The resource was updated successfully.',
    DELETED: 'The resource was deleted successfully.',
    LOGIN_SUCCESS: 'Login successful',
    LOGIN_FAILED: 'Invalid email or password',
} as const;

export type Message = (typeof MESSAGES)[keyof typeof MESSAGES];