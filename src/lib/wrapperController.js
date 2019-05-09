import JsonApiError from './jsonApiError';

const wrapperController = (req, res) => async (fn) => {
  const defaultHeader = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const result = await fn(req);

    if (result) {
      res.json(
        result.body,
        {
          ...defaultHeader,
          ...(result.headers ? result.headers : {}),
        },
        result.statusCode,
      );
    }
  } catch (error) {
    if (error instanceof JsonApiError) {
      const e = error.toJSON();

      res.json(
        {
          errors: [e],
        },
        defaultHeader,
        e.status,
      );
    }
  }
};

export default wrapperController;
