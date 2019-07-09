const MongoClient = require('mongodb').MongoClient;

const client = new MongoClient(process.env.MONGO_URL, {
  useNewUrlParser: true
});

let connection = null;

module.exports.connect = function connect() {
  return new Promise((resolve, reject) => {
    client.connect(
      err => {
        if (err) {
          return reject(err);
        }
        connection = client.db(process.env.DB_NAME);
        return resolve(connection);
      },
      { useNewUrlParser: true }
    );
  });
};

module.exports.close = function close() {
  return connection.close();
};

module.exports.connection = function db() {
  return connection;
};

module.exports.isoDate = function isoDate(date) {
  // mongo has to take dates like this....
  if (date) {
    return new Date(new Date(date).toISOString());
  }
  return new Date(new Date().toISOString());
};
