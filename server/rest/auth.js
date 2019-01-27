import logger from '../utils/logger';

export default (req, res, next) => {
  // do any checks you want to in here
  // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
  // you can do this however you want with whatever variables you set up
  if (req.isAuthenticated()) {
    return next();
  }

  // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
  logger.info('auth: user NOT authenticated');
  res.send(403);
};
