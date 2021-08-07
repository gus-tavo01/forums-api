class BaseRepository {
  constructor(model, mapper) {
    this.model = model;
    this.mapper = mapper;
  }

  add = async (entity) => {
    const newEntity = await new this.model(entity).save();
    return this.mapper(newEntity);
  };

  findById = async (id) => {
    const entity = await this.model.findById(id);
    return this.mapper(entity);
  };

  modify = async (id, patch) => {
    const entity = await this.model.findByIdAndUpdate(id, patch);
    return this.mapper(entity);
  };

  remove = async (id) => {
    const entity = await this.model.findByIdAndDelete(id);
    return this.mapper(entity);
  };
}

module.exports = BaseRepository;
