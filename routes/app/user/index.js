const express = require("express");
const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars");
const { OTP } = require("../../../models/otp");
const { User } = require("../../../models/user");
const { Server } = require("../../../models/server");
const { Subscriptions } = require("../../../models/subscriptions");
const { api, betweenNumber } = require("../../../utils");
const {
  checkSignin,
  checkExistUser,
  checkOTP,
  checkProfile,
  checkAnonymousUser,
  updateTotalDownloadAndUpload,
  checkExistUserById,
  insertSubscription,
} = require("./middleware");
const { sgMail } = require("../../../configs");
const { Package } = require("../../../models/package");
const { Ads } = require("../../../models/ads");

const userRouter = express.Router();

const sendOTPMail = async (to) => {
  try {
    let code = `${betweenNumber(100000, 999999)}`;
    let existingOTP = await OTP.findOne({ email: to, isVerify: false });

    if (existingOTP) {
      code = existingOTP.code;
    }

    let replacements = {
      code,
    };

    const htmlTemplate = fs.readFileSync(
      path.join(__dirname, "../../../configs/template.html"),
      "utf8"
    );
 
    const template = handlebars.compile(htmlTemplate);
    const htmlToSend = template(replacements);
//from: "mirvict@gmail.com",
    const mailOptions = {
      from: "hello@witwork.app",
      to,
      subject: "Verify your email for ApeVpn",
      html: htmlToSend,
    };

    const resSendMail = await sgMail.send(mailOptions);

    if (resSendMail) {
      if (!existingOTP) {
        await OTP.create({
          email: to,
          code: replacements.code,
          isVerify: false,
        });
      }

      return Promise.resolve({});
    } else {
      return Promise.reject({});
    }
  } catch (e) {
    return Promise.reject({});
  }
};

/* SIGN UP */
userRouter.post(
  "/user/signup",
  [checkSignin, checkExistUser],
  async (req, res) => {
    const { body, isExistUser } = req;
    let user = undefined;

    try {
      if (!isExistUser) {
        user = await User.create({
          ...body,
          createdAt: new Date(),
        });
      } else {
        user = await User.findOne({ email: body.email, updatedAt: new Date(), });
      }

      await sendOTPMail(body.email);

      api.ok({
        res,
        data: user,
      });
    } catch (e) {
      console.log(e);
      api.error({ res });
    }
  }
);

/* VERIFY OTP */
userRouter.post("/user/otp", [checkOTP], async (req, res) => {
  const {
    body: { code, email },
  } = req;

  try {
    const otp = await OTP.findOneAndUpdate(
      { email, isVerify: false, code },
      { isVerify: true }
    );

    if (otp) {
      User.findOneAndUpdate({ email }, { isVerify: true })
        .then((result) => {
          const user = {
            email: result.email,
            id: result.id,
            avatar: result.avatar,
            firstName: result.firstName,
            lastName: result.lastName,
          };

          api.ok({
            res,
            data: user,
          });
        })
        .catch(() => api.error({ res }));
    } else {
      api.error({ res });
    }
  } catch {
    api.error({ res });
  }
});

//update
userRouter.post("/profile", [checkProfile], async (req, res) => {
  const { body: { id, email, ...props } = req } = req;
  try {
    const user = await User.findOneAndUpdate(
      { email, _id: id },
      { ...props, updatedAt: new Date() },
      { new: true }
    );

    api.ok({
      res,
      data: user,
    });
  } catch {
    api.error({ res });
  }
});

//get profile
userRouter.post("/user/profile", [checkExistUserById], async (req, res) => {
  if (!req?.user) return api.error({ res });

  const user = await User.findOneAndUpdate(
    { email: req?.user?.email, _id: req?.user?.id },
    { lastLogin: new Date() },
    { new: true }
  );

  api.ok({
    res,
    data: user,
  });
});

//resend code
userRouter.post("/resend-code", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return api.error({ res });
  }

  try {
    await sendOTPMail(email);

    api.ok({ res });
  } catch (e) {
    api.error({ res });
  }
});

/*LOGIN ANONYMOUS USER*/
userRouter.post(
  "/user/loginAnonymousUser",
  [checkAnonymousUser],
  async (req, res, next) => {
    const { deviceId } = req.body;
    try {
      const user = await User.create({
        deviceId,
        isAnonymous: true,
        email: deviceId,
      });

      api.ok({
        res,
        data: user,
      });
    } catch (e) {
      api.error({ res });
    }
  }
);

/* REMOVE DEVICE ID FOR Anonymous user*/
userRouter.post(
  "/user/removeAnonymousUser",
  [checkExistUserById],
  async (req, res, next) => {
    try {
      await User.findByIdAndUpdate(req.body.userId, { deviceId: null });

      api.ok({
        res,
        data: {},
      });
    } catch (e) {
      api.error({ res });
    }
  }
);

//get servers
userRouter.post("/user/server", [checkExistUserById], async (req, res) => {
  try {
    const servers = await Server.find({ status: true });
    api.list({
      res,
      data: servers,
    });
  } catch (e) {
    api.error({ res });
  }
});

userRouter.post(
  "/user/updateTotalUploadDownload",
  [checkExistUserById, updateTotalDownloadAndUpload],
  async (req, res, next) => {
    const { userId, ...body } = req.body;
    const { isExistUser, user } = req;

    if (!isExistUser && !user) return api.error({ res });

    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          totalUpload:
            parseFloat(body?.totalUpload || 0) +
            parseFloat(user?.totalUpload || 0),
          totalDownload:
            parseFloat(body?.totalDownload || 0) +
            parseFloat(user?.totalDownload || 0),
          updatedAt: new Date(),
        },
        { new: true }
      );

      api.ok({
        res,
        data: updatedUser,
      });
    } catch (e) {
      api.error({ res });
    }
  }
);

userRouter.post(
  "/user/packages",
  [checkExistUserById],
  async (req, res, next) => {
    const { os } = req.body;
    if (!os) return api.error({ res, message: "Not found os" });
    if (!["android", "ios"].includes(os.toLocaleLowerCase?.()?.trim?.()))
      return api.error({ res, message: "Not found os" });

    try {
      const packages = await Package.find({
        packagePlatform: os.toLocaleLowerCase?.()?.trim?.(),
      });

      api.list({
        res,
        data: packages,
      });
    } catch (e) {
      api.error({ res });
    }
  }
);

userRouter.post("/user/ads", [checkExistUserById], async (req, res, next) => {
  const { os } = req.body;
  if (!os) return api.error({ res, message: "Not found os" });
  if (!["android", "ios"].includes(os.toLocaleLowerCase?.()?.trim?.()))
    return api.error({ res, message: "Not found os" });

  try {
    const ads = await Ads.find({
      adsPlatform: os.toLocaleLowerCase?.()?.trim?.(),
      adsStatus: true,
    });

    api.list({
      res,
      data: ads,
    });
  } catch (e) {
    api.error({ res });
  }
});

userRouter.post('/user/subscription', [checkExistUserById, insertSubscription], async (req, res, next) => {
  const {userId, ...body} = req.body;
  const subscription = await Subscriptions.create(body)

  api.ok({
    res,
    data: subscription
  });
  try {
    
  } catch (e) {
    api.error({ res });
  }
})

// cancel sub
userRouter.post('/user/subscription/:id', [checkExistUserById], async (req, res, next) => {
  const { id: subId } = req.params;

  await Subscriptions.findByIdAndUpdate(subId, {
    isActive: false
  })
  
  api.ok({
    res,
    data: "OK"
  });
  try {
    
  } catch (e) {
    api.error({ res });
  }
})

module.exports = userRouter;
