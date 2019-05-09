class JsonApiError extends Error {
  constructor(error) {
    const errorMessage = `${error.title} ${error.detail}`;
    super(errorMessage);

    this.title = error.title;
    this.detail = error.detail;
    this.status = error.status;
    this.code = error.code;

    if (error.source) {
      this.source = error.source;
    }
    if (error.meta) {
      this.meta = error.meta;
    }

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      status: this.status,
      code: this.code,
      title: this.title,
      detail: this.detail,
      ...(this.source ? { source: this.source } : {}),
      ...(this.meta ? { source: this.meta } : {}),
    };
  }
}

export default JsonApiError;
