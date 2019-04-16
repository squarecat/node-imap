import Joi from 'joi';

export const paginationValidation = {
  skip: Joi.number(),
  limit: Joi.number(),
  page: Joi.number(),
  per_page: Joi.number(),
  sort_by: Joi.string(),
  direction: Joi.string()
};

const DEFAULTS = {
  page: 1,
  limit: 50,
  offset: 0,
  sortBy: 'meta.createdAt',
  direction: 'desc'
};

export default (req, res, next) => {
  const { query } = req;
  const options = getPaginationOptions(query);

  res.locals.isPaginated = true;
  res.locals.search = {
    ...res.locals.search,
    options
  };
  next();
};

function getPaginationOptions(query) {
  const { page, per_page: perPage, sort_by: sortBy, direction } = query;

  const parsed = {
    page: page ? parseInt(page, 10) : DEFAULTS.page,
    limit: perPage ? parseInt(perPage, 10) : DEFAULTS.limit,
    sortBy: sortBy || DEFAULTS.sortBy,
    direction: direction || DEFAULTS.direction
  };

  const offset = (parsed.page - 1) * parsed.limit;
  return {
    ...parsed,
    offset
  };
}
