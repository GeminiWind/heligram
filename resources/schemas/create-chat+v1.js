export default {
  $id: 'https://heligram.com/create-chat+v1.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Create Chat',
  description: '',
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['chat'],
    },
    attributes: {
      type: 'object',
      properties: {
        createdBy: {
          type: 'string',
          description: 'User email',
          format: 'email',
        },
        participants: {
          type: 'array',
          items: {
            type: 'string',
            description: 'Participants Email',
            format: 'email',
          },
        },
        required: ['createdBy', 'participants'],
      },
    },
    relationships: {
      type: 'object',
      properties: {
        messages: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['message'],
                  },
                  attributes: {
                    type: 'object',
                    properties: {
                      createdBy: {
                        type: 'string',
                        description: 'User email',
                        format: 'email',
                      },
                      message: {
                        type: 'string',
                        description: 'Message Content',
                      },
                    },
                    required: ['createdBy', 'message'],
                  },
                },
                required: ['type', 'attributes'],
              },
            },
          },
        },
      },
    },
  },
  required: ['type', 'attributes', 'relationships'],
};
