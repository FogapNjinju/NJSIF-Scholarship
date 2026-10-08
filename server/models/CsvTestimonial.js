const { createCsvStore } = require("./csvStore");

const store = createCsvStore();

class Testimonial {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  static find() {
    return store.listTestimonials();
  }

  static async create(data) {
    return store.createTestimonial(data);
  }

  async save() {
    const saved = await store.createTestimonial(this);
    Object.assign(this, saved);
    return saved;
  }
}

module.exports = Testimonial;
