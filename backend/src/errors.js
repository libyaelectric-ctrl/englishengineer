export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const toErrorResponse = (error) => {
  if (error instanceof ApiError || error.name === 'ApiError') {
    return {
      status: error.status,
      body: {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
    };
  }

  return {
    status: 500,
    body: {
      ok: false,
      error: {
        code: 'internal_error',
        message: 'The backend could not complete the request.',
      },
    },
  };
};
