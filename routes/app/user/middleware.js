const Joi = require("@hapi/joi");
const { User } = require("../../../models/user");
const { api } = require("../../../utils");

const checkAuthByString = async (token, req, res, next) => {
  if (token) {
    const payload = verify(token);

    if (payload.id && payload.email) {
        const user = await User.findOne({ _id: payload.id, email: payload.email})
        if (!user) {
          api.unAuthorize({res});
        } else {
          req.user = user;

          next()
        }
    } else {
      console.error('=========ERROR=========')
      console.error('checkAuthByString: failed to valid')
      api.unAuthorize({res});
    }
  } else {
    console.error('=========ERROR=========')
    console.error('checkAuthByString: failed to valid')
    api.unAuthorize({res});
  }
};

const checkSignin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().lowercase().required(),
  });
  const {body: { os, userId, ...body }} = req
  
  const valid = schema.validateAsync(body, { abortEarly: false });

  valid
    .then(() => next())
    .catch(() => {
      console.error('=========ERROR=========')
      console.error('checkSignin: failed to valid')
      api.error({ res, message: "Sever has some problems!" });
    });
};

const checkExistUser = async (req, res, next) => {
  const {
    body: { email },
  } = req;

  try {
    const user = await User.findOne({ email });

    if (user && user.email === email) {
      req.isExistUser = true
    }

    return next();
  } catch (e){
    console.error('=========ERROR=========')
    console.error('checkExistUser: failed to valid')
    return api.error({ res});
  }
};

const checkOTP = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    code: Joi.string().length(6).required(),
  });
  const {body: { os, password, ...body }} = req

  const valid = schema.validateAsync(body, { abortEarly: false });

  valid
    .then(() => next())
    .catch(() => {
      console.error('=========ERROR=========')
      console.error('checkOTP: failed to valid')
      api.error({ res, message: "Sever has some problems!" });
    });
};

const checkProfile = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    id: Joi.string().required(),
  });

  const valid = schema.validateAsync(req.body, { abortEarly: false });

  valid
    .then(() => next())
    .catch(() => {
      console.error('=========ERROR=========')
      console.error('checkProfile: failed to valid')
      api.error({ res, message: "Sever has some problems!" });
    });
}

const checkAnonymousUser = async (req, res, next) => {
  const { deviceId } = req.body;


  if (!deviceId) return api.error({ res });

  try {
    const user = await User.findOne({deviceId, isAnonymous: true})

    if (!user) return next()

    return api.ok({res, data: user})
  } catch(err) {
    console.error('=========ERROR=========')
    console.error('checkAnonymousUser: failed to valid')
    return api.error({ res });
  }
}

const updateTotalDownloadAndUpload = async (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    totalUpload: Joi.number().default(0),
    totalDownload: Joi.number().default(0),
  });

  const valid = schema.validateAsync(req.body, { abortEarly: false });

  valid
    .then(() => next())
    .catch(() => {
      console.error('=========ERROR=========')
      console.error('updateTotalDownloadAndUpload: failed to valid')
      api.error({ res, message: "Sever has some problems!" });
    });
}

const checkExistUserById = async (req, res, next) => {
  const {
    body: { userId },
  } = req;

  try {
    const user = await User.findById(userId)

    if (!user) return api.error({ res });

    req.user = user;
 
    return next();
  } catch (e){
    console.error('=========ERROR=========')
    console.error('checkExistUserById: failed to valid')
    return api.error({ res});
  }
};

const insertSubscription = async (req, res, next) => {
  const schema = Joi.object().keys({
    subscriptionId: Joi.string().required(),
    subscriptionType: Joi.string().required(),
    subscriptionPricing: Joi.string().required(),
    userPurchase: Joi.string().required(),
    subscriptionPlatform: Joi.string().required().allow('android', 'ios'),
  });
  try {
    const {
      body: { userPurchase },
    } = req;
    const user = await User.findById(userPurchase)

    if (!user) return api.error({ res });

    req.userPurchase = user;
    
    const {userId, ...body} = req.body

    const valid = schema.validateAsync(body, { abortEarly: false });

    valid
      .then(() => next())
      .catch(() => {
        console.error('=========ERROR=========')
        console.error('insertSubscription: failed to valid')
        api.error({ res, message: "Sever has some problems!" });
      });
  } catch(e) {
    api.error({ res, message: "Sever has some problems!" });
  }
  
};

module.exports = {
  checkOTP,
  checkSignin,
  checkExistUser,
  checkProfile,
  checkAuthByString,
  checkAnonymousUser,
  updateTotalDownloadAndUpload,
  checkExistUserById,
  insertSubscription
};
