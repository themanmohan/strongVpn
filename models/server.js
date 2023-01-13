const mongoose = require('mongoose');
const Joi = require("@hapi/joi");
const Joigoose = require("joigoose")(mongoose, { convert: false });

const schema = Joi.object().keys({
    country: Joi.string().required(),
    countryCode: Joi.string().required(),
    ipAddress: Joi.string().required(),
    caFile: Joi.string().required(),
    caFileName: Joi.string().required(),
    p_nsm: Joi.string().required(),
    u_nsm: Joi.string().required(),
    premium: Joi.boolean().allow(null).default(false),
    recommend: Joi.boolean().allow(null).default(false),
    state: Joi.string().required(),
    status: Joi.boolean().allow(null).default(false),
    createdAt: Joi.date().allow(null).default(new Date()),
    updatedAt: Joi.date().allow(new Date()),
    deletedAt: Joi.date().allow(null)
  });
  
  const Schema = mongoose.Schema;
  
  const mongooseSchema = new Schema(Joigoose.convert(schema), {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });
  
  mongooseSchema.path('ipAddress').index({ unique: true });
  
  mongooseSchema.virtual("id").get(function() {
    return this._id;
  });
  
  module.exports = {
    roomSchema: schema,
    Server: mongoose.model("Server", mongooseSchema)
  }
