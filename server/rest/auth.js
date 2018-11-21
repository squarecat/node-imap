export default (req, res, next) => {
  // do any checks you want to in here
  return next();
  // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
  // you can do this however you want with whatever variables you set up
  if (req.isAuthenticated()) {
    console.log('auth: user authenticated');
    return next();
  }

  // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
  console.log('auth: user NOT authenticated');
  res.send(403);
};
