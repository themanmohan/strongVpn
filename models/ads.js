const mongoose = require('mongoose');
const Joi = require("@hapi/joi");
const Joigoose = require("joigoose")(mongoose, { convert: false });

const schema = Joi.object().keys({
    adsId: Joi.string().required(),
    adsType: Joi.string().required(),
    adsPlatform: Joi.string().required().allow('android', 'ios'),
    adsStatus: Joi.boolean().default(false).required(),
    createdAt: Joi.date().allow(null).default(new Date()),
    updatedAt: Joi.date().allow(new Date()),
    deletedAt: Joi.date().allow(null)
  });
  
  const Schema = mongoose.Schema;
  
  const mongooseSchema = new Schema(Joigoose.convert(schema), {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });
  
  mongooseSchema.virtual("id").get(function() {
    return this._id;
  });
  
  module.exports = {
    roomSchema: schema,
    Ads: mongoose.model("Ads", mongooseSchema)
  }