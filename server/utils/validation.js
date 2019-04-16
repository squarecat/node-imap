import Joi from 'joi';

export const schema = s => {
  return Joi.object().keys(s);
};

export default (type, val) => {
  const { error, value } = Joi.validate(val, schema(type));
  if (error) {
    const message = error.details[0].context.label;
    return {
      hasError: true,
      name: error.name,
      message: message || error.message,
      receivedValues: val
    };
  }
  return { hasError: false, value };
};
