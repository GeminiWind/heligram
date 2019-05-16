export default {
  $id: 'https://heligram.com/forget-password+v1.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Forget Password',
  description: '',
  type: 'object',
  properties: {
    email: {
      type: 'string',
      description: 'User email',
      format: 'email',
    },
  },
  required: ['email'],
};
