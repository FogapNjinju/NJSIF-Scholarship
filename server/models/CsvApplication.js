const { createCsvStore } = require("./csvStore");

const store = createCsvStore();

class ApplicationQuery {
  constructor(promise, filter = {}) {
    this.promise = promise;
    this.filter = filter;
    this.sortOptions = {};
  }

  sort(options) {
    this.sortOptions = typeof options === "object" ? options : {};
    return this;
  }

  then(resolve, reject) {
    this.promise
      .then((records) => {
        const entries = [...records];
        if (this.sortOptions.createdAt === -1) {
          entries.sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));
        } else if (this.sortOptions.createdAt === 1) {
          entries.sort((left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0));
        }
        resolve(entries);
      })
      .catch(reject);
    return this;
  }
}

class Application {
  constructor(data = {}) {
    Object.assign(this, data);
    this.documents = data.documents || {};
    this.history = data.history || [];
  }

  async save() {
    const saved = await store.createApplication(this);
    Object.assign(this, saved);
    return saved;
  }

  static find(query) {
    const ids = query?._id?.$in || [];
    const promise = store.listApplications().then((records) =>
      ids.length > 0 ? records.filter((record) => ids.includes(record._id)) : records
    );
    return new ApplicationQuery(promise);
  }

  static findById(id) {
    return store.getApplicationById(id);
  }

  static async findByIdAndUpdate(id, updatePayload, options = {}) {
    const normalized = updatePayload && typeof updatePayload === "object" && !Array.isArray(updatePayload)
      ? updatePayload
      : { $set: updatePayload || {} };

    return store.updateApplication(id, normalized, options);
  }

  static async findByIdAndDelete(id) {
    return store.deleteApplication(id);
  }
}

module.exports = Application;
