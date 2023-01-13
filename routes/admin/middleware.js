const Joi = require("@hapi/joi");
const { api } = require("../../utils");
const { Admin } = require("../../models/admin");
const { Server } = require("../../models/server");
const md5 = require("md5");

const checkSignin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(1).required(),
  });

  const valid = schema.validateAsync(req.body, { abortEarly: false });

  valid
    .then(() => next())
    .catch((e) => {
      api.error({ res, message: "Sever has some problems!" });
    });
};


const checkUpdateProfile = (req, res, next) => {
  const schema = Joi.object({
    adminId: Joi.string().required(),
    firstname: Joi.string().min(1).required(),
    lastname: Joi.string().min(1).required(),
  });

  const valid = schema.validateAsync(req.body, { abortEarly: false });

  valid
    .then(() => next())
    .catch(() => {
      api.error({ res, message: "Sever has some problems!" });
    });
};

const checkUpdatePassword = (req, res, next) => {
  const schema = Joi.object({
    adminId: Joi.string().required(),
    password: Joi.string().min(1).required(),
    oldPassword: Joi.string().min(1).required(),
  });

  const valid = schema.validateAsync(req.body, { abortEarly: false });

  valid
    .then(() => next())
    .catch(() => {
      api.error({ res, message: "Sever has some problems!" });
    });
};

const checkOldPassword = async (req, res, next) => {
  const {
    body: { adminId: id, oldPassword},
  } = req;
  try {
    const admin = await Admin.findById(id)
    req.isValidPassword = (admin.password == md5(oldPassword)) ? true : false
    console.log(req.isValidPassword)
    return next();
  } catch (e){
    return api.error({ res});
  }
};



const checkExistAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.find()
    req.isExistAdmin = admin && admin.length > 0
    return next()
  } catch (e){
    return api.error({ res});
  }
};

const checkExistIdAdmin = async (req, res, next) => {
  const {
    body: { adminId },
  } = req;

  if (!adminId) return api.error({ res, message: 'not found admin'});

  try {
    const admin = await Admin.findById(adminId)

    if (admin) {
      req.isExistIdAdmin = true
      return next()
    }

    return api.error({ res, message: 'not found admin'});
  } catch (e){
    return api.error({ res, e});
  }
};


const checkSignup = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(1).required(),
    firstname: Joi.string().min(1).required(),
    lastname: Joi.string().min(1).required(),
  });

  const valid = schema.validateAsync(req.body, { abortEarly: false });

  valid
    .then(() => next())
    .catch(() => {
      api.error({ res, message: "Sever has some problems!" });
    });
}

const checkServer = (req, res, next) => {
  const {body: { adminId, ...body }} = req

  const schema = Joi.object().keys({
    country: Joi.string().required(),
    countryCode: Joi.string().required(),
    ipAddress: Joi.string().required(),
    caFile: Joi.string().required(),
    caFileName: Joi.string().required(),
    p_nsm: Joi.string().required(),
    u_nsm: Joi.string().allow(null),
    premium: Joi.boolean().required(),
    recommend: Joi.boolean().required(),
    state: Joi.string().required(),
    status: Joi.boolean().required(),
    id: Joi.string().allow(null)
  });

  const valid = schema.validateAsync(body, { abortEarly: false });
  valid
    .then(() => next())
    .catch(() => {
      api.error({ res, message: "Sever has some problems!" });
    });
}


const checkExistIPServer = async (req, res, next) => {
  const {
    body: { ipAddress },
  } = req;

  try {
    const server = await Server.findOne({ ipAddress });

    if (server && server.ipAddress === ipAddress) {
        req.isExistIPServer = true
    }

    return next();
  } catch (e){
    return api.error({ res});
  }
};


const checkExistServer = async (req, res, next) => {
  let {
    body: { id },
  } = req;
  try {
    const server = await Server.findById(id)
    req.isExistServer = server ? true : false

    return next();
  } catch (e){
    return api.error({ res});
  }
};

const checkCreateAndUpdatePackage = (req, res, next) => {
  const { body: { id, adminId, ...body } } = req
  const schema = Joi.object().keys({
    packageName: Joi.string().required(),
    packageId: Joi.string().required(),
    packagePricing: Joi.number().required(),
    packagePlatform: Joi.string().required().allow('android', 'ios'),
    packageDuration: Joi.string().required()
  });

  const valid = schema.validateAsync(body, { abortEarly: false });

  valid
    .then(() => next())
    .catch(() => {
      api.error({ res, message: "Sever has some problems!" });
    });
}

const checkCreateAndUpdateAds = (req, res, next) => {
  const { body: { id, adminId, ...body } } = req
  const schema = Joi.object().keys({
    adsId: Joi.string().required(),
    adsType: Joi.string().required(),
    adsPlatform: Joi.string().required().allow('android', 'ios'),
    adsStatus: Joi.boolean().default(false),
  });

  const valid = schema.validateAsync(body, { abortEarly: false });

  valid
    .then(() => next())
    .catch((err) => {
      api.error({ res, message: "Sever has some problems!" });
    });
}

module.exports = {
  checkSignin,
  checkExistAdmin,
  checkSignup,
  checkServer,
  checkExistServer,
  checkExistIPServer,
  checkUpdateProfile,
  checkExistIdAdmin,
  checkUpdatePassword,
  checkOldPassword,
  checkCreateAndUpdatePackage,
  checkCreateAndUpdateAds
};
