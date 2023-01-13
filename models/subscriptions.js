const mongoose = require('mongoose');
const Joi = require("@hapi/joi");
const Joigoose = require("joigoose")(mongoose, { convert: false });

const schema = Joi.object().keys({
    subscriptionId: Joi.string().required(),
    subscriptionType: Joi.string().required(),
    subscriptionPricing: Joi.string().required(),
    userPurchase: Joi.string().required(),
    subscriptionPlatform: Joi.string().required().allow('android', 'ios'),
    isActive: Joi.boolean().default(true),
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
    Subscriptions: mongoose.model("Subscriptions", mongooseSchema)
  }