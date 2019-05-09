import Ajv from 'ajv';
import schemas from '../../resources/schemas';

const ajv = new Ajv({
  allErrors: true,
  jsonPointers: true,
});

ajv.addSchema(schemas);

export default ajv;
