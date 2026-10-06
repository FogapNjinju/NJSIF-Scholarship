const { createCsvStore } = require("./csvStore");

const store = createCsvStore();

const normalizeQuery = (query = {}) => {
  if (!query || typeof query !== "object") return {};
  const ids = query._id && query._id.$in ? query._id.$in : [];
  return { ids };
};

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
          entries.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
        } else if (this.sortOptions.createdAt === 1) {
          entries.sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
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
    const { ids } = normalizeQuery(query);
    const promise = store.listApplications().then((records) => {
      if (ids.length > 0) {
        return records.filter((record) => ids.includes(record._id));
      }
      return records;
    });
    return new ApplicationQuery(promise);
  }

  static findById(id) {
    return store.getApplicationById(id);
  }

  static async findByIdAndUpdate(id, updatePayload) {
    return store.updateApplication(id, updatePayload);
  }

  static async findByIdAndDelete(id) {
    return store.deleteApplication(id);
  }
}

module.exports = Application;