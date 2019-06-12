export default {
  $id: 'https://heligram.com/create-user+v1.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Create User',
  description: 'A user is to present a person consuming our app',
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['users'],
        },
        attributes: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'User email',
              format: 'email',
            },
            password: {
              type: 'string',
              description: 'User password',
              minLength: 6,
            },
          },
          required: ['email', 'password'],
        },
      },
      required: ['type', 'attributes'],
    },
  },
  required: ['data'],
};
