const { isMongoConfigured } = require("./database");

const TestimonialModel = isMongoConfigured
  ? require("./MongoTestimonial")
  : require("./CsvTestimonial");

module.exports = TestimonialModel;
