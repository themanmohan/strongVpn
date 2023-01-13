const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const Joigoose = require("joigoose")(mongoose, { convert: false });

const schema = Joi.object().keys({
  code: Joi.string()
    .required(),
  isVerify: Joi.boolean()
    .required().default(false),
  email: Joi.string().email(),
  createdAt: Joi.date().allow(null).default(new Date()),
  updatedAt: Joi.date().allow(null),
  deletedAt: Joi.date().allow(null)
});

const Schema = mongoose.Schema;

const mongooseSchema = new Schema(Joigoose.convert(schema), {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

mongooseSchema.path('code').index({ unique: true });

mongooseSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = {
  otpSchema: schema,
  OTP: mongoose.model("OTP", mongooseSchema)
}