export default {
  $id: 'https://heligram.com/create-user+v1.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Create User',
  description: '',
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
};
