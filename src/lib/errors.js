import JsonApiError from './jsonApiError';

class InternalError extends JsonApiError {
  constructor(message) {
    let internalError = {
      title: 'InternalError',
      code: 'InternalError',
      status: 500,
      detail: 'InternalError',
    };
    if (typeof message === 'string') {
      internalError = {
        ...internalError,
        detail: message,
      };
    }
    if (typeof message === 'object') {
      internalError = {
        ...internalError,
        ...message,
      };
    }
    super(internalError);
  }
}

class NotFoundError extends JsonApiError {
  constructor(message) {
    let notFoundError = {
      title: 'NotFoundError',
      code: 'NotFoundError',
      status: 404,
      detail: 'NotFoundError',
    };
    if (typeof message === 'string') {
      notFoundError = {
        ...notFoundError,
        detail: message,
      };
    }
    if (typeof message === 'object') {
      notFoundError = {
        ...notFoundError,
        ...message,
      };
    }
    super(notFoundError);
  }
}

class BadRequestError extends JsonApiError {
  constructor(message) {
    let badRequestError = {
      title: 'BadRequestError',
      code: 'BadRequestError',
      status: 400,
      detail: 'BadRequestError',
    };
    if (typeof message === 'string') {
      badRequestError = {
        ...badRequestError,
        detail: message,
      };
    }
    if (typeof message === 'object') {
      badRequestError = {
        ...badRequestError,
        ...message,
      };
    }
    super(badRequestError);
  }
}

class MalformedError extends JsonApiError {
  constructor() {
    const malformedError = {
      title: 'MalformedError',
      code: 'MalformedError',
      status: 400,
      detail: 'Request body is malformed.',
    };
    super(malformedError);
  }
}

class TimeoutError extends JsonApiError {
  constructor() {
    const timeoutError = {
      title: 'TimeoutError',
      code: 'TimeoutError',
      status: 408,
      detail: 'Request Timeout.',
    };
    super(timeoutError);
  }
}

class UnauthorizedError extends JsonApiError {
  constructor() {
    const unauthorizedError = {
      title: 'UnauthorizedError',
      code: 'UnauthorizedError',
      status: 401,
      detail: 'Unauthorized Error.',
    };
    super(unauthorizedError);
  }
}

export {
  InternalError,
  NotFoundError,
  BadRequestError,
  MalformedError,
  TimeoutError,
  UnauthorizedError,
};
