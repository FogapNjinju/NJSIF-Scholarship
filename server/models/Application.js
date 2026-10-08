const { isMongoConfigured } = require("./database");

const ApplicationModel = isMongoConfigured
  ? require("./MongoApplication")
  : require("./CsvApplication");

module.exports = ApplicationModel;