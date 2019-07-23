import logger from '../utils/logger';
import { paginationValidation } from './pagination-options';
import validate from '../utils/validation';

export const validateQuery = (type, mappings = {}) => (req, res, next) => {
  if (res.locals.err) return next();
  const { query } = req;
  let validationType = type;
  if (res.locals.isPaginated) {
    validationType = {
      ...validationType,
      ...paginationValidation
    };
  }
  const { hasError, value, ...error } = validate(validationType, query);

  if (hasError) {
    logger.error('validation-middleware: query validation error');
    logger.error(error);
    res.locals.err = error;
    return res.status(400).send(error);
  }

  res.locals.search = {
    ...res.locals.search,
    params: mapResponse(mappings, value)
  };
  return next();
};

export const validateBody = (type, { mappings = {}, passthrough = false }) => (
  req,
  res,
  next
) => {
  if (res.locals.err) return next();
  const { body } = req;
  const { hasError, value, ...error } = validate(type, body);
  if (hasError) {
    logger.error('validation-middleware: body validation error');
    logger.error(error.message);
    res.locals.err = error;
    res.locals.body = mapResponse(mappings, body);
    if (passthrough) {
      return next();
    }
    return res.status(400).send(error);
  }
  res.locals.body = mapResponse(mappings, value);
  return next();
};

function mapResponse(mappings, value) {
  return Object.keys(value).reduce((out, k) => {
    if (mappings[k]) {
      return {
        ...out,
        [mappings[k]]: value[k]
      };
    }
    return {
      ...out,
      [k]: value[k]
    };
  }, {});
}

function mapError({ message }) {}
