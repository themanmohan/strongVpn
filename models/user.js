const mongoose = require('mongoose');
const Joi = require("@hapi/joi");
const Joigoose = require("joigoose")(mongoose, { convert: false });

const userSchema = Joi.object().keys({
    email: Joi.string().required(),
    isAnonymous: Joi.boolean().default(false),
    totalDownload: Joi.number().default(0),
    totalUpload: Joi.number().default(0),
    deviceId: Joi.string().allow('', null).empty(['', null]).default(null),
    createdAt: Joi.date().allow(null).default(new Date()),
    updatedAt: Joi.date().allow(new Date()),
    deletedAt: Joi.date().allow(null),
    lastLogin: Joi.date().allow(null),
  });
  
  const Schema = mongoose.Schema;
  
  const mongooseSchema = new Schema(Joigoose.convert(userSchema), {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });
  
  mongooseSchema.path('email').index({ unique: true });
  
  mongooseSchema.virtual("id").get(function() {
    return this._id;
  });
  

mongooseSchema.virtual('subscription', {
  ref: 'Subscriptions',
  localField: '_id',
  foreignField: 'userPurchase',
  justOne: true,
  match: { isActive: true }
});

  module.exports = {
    userSchema,
    User: mongoose.model("User", mongooseSchema)
  }