const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Auth = require("../models/authModel");
const globalFunctions = require("../utils/globalFuctions");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const StudyCentre = require("../models/studyCentreModel");
const { encryptPassword, decryptPassword } = require("../utils/cryptoHelper");

exports.createUser = globalFunctions.createOne(Auth);
exports.createMultiUsers = async (req, res) => {
  try {
    let data = await Auth.insertMany(req.body);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error);
  }
};
exports.signUp = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await Auth.findOne({ username });
    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const newUser = await Auth.create(req.body);
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res
      .cookie("jwt", token, {
        httpOnly: true,
        // max age 30 days
        maxAge: 3600000 * 24 * 30,
      })
      .status(200);
    newUser.password = undefined;
    res.status(200).json({
      user: newUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err,
      err,
    });
  }
};

exports.signIn = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        message: "Please provide username and password",
      });
    }
    const user = await Auth.findOne({ username }).select("+password");
    if (!user) {
      return res.status(400).json({
        message: "User does not exist",
      });
    } else {
      const isValidPassword = await user.correctPassword(
        password,
        user.password
      );
      if (!isValidPassword) {
        return res.status(400).json({
          message: "Invalid password",
        });
      } else {  
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "90d",
        });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        res
          .cookie("jwt", token, {
            httpOnly: true,
            // max age 30 days
            maxAge: decoded.exp,
          })
          .status(200);
        // remove password from user object
        user.password = undefined;
        res.json(user);
      }
    }
  } catch (err) {
    next(err);
  }
};
exports.logout = (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({
    message: "Logged out",
    success: true,
  });
};

exports.getUser = async (req, res) => {
  try {
    const user = await Auth.findById(req.params.id).populate("branch");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: "Error getting user",
    });
  }
};

exports.deleteUser = globalFunctions.deleteOne(Auth)

exports.updatePassword = catchAsync(async (req, res, next) => {
  const targetId = req.params.id || req.user._id;
  const isSuperAdmin = req.user.role === "superAdmin";
  const isSelf = String(req.user._id) === String(targetId);

  if (!req.body.password || req.body.password.trim() === "") {
    return next(new AppError("Please provide a new password", 400));
  }

  const user = await Auth.findById(targetId).select("+password +encryptedPassword");
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // If current password is provided, verify it
  if (req.body.currentPassword) {
    let isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
    // Fallback: If legacy default password '1986' was entered and matches decrypted or default
    if (!isMatch) {
      const storedDecrypted = decryptPassword(user.encryptedPassword);
      if (req.body.currentPassword === storedDecrypted || req.body.currentPassword === "1986") {
        isMatch = true;
      }
    }
    if (!isMatch) {
      return next(new AppError("Your current password is incorrect", 400));
    }
  }

  // Set new password
  user.password = req.body.password;
  user.encryptedPassword = encryptPassword(req.body.password);
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
});

/**
 * Super Admin: Get all study centres and their credential status (passwords remain masked)
 */
exports.getStudyCentresCredentials = catchAsync(async (req, res, next) => {
  const centres = await StudyCentre.find({ deleted: { $ne: true } })
    .select("studyCentreName studyCentreCode district state phone isActive admin")
    .sort({ studyCentreCode: 1 });

  const auths = await Auth.find({ role: "admin", deleted: { $ne: true } })
    .select("username branch encryptedPassword");

  const authMapByBranch = {};
  auths.forEach((a) => {
    if (a.branch) authMapByBranch[String(a.branch)] = a;
    authMapByBranch[String(a._id)] = a;
  });

  const data = centres.map((centre) => {
    const auth = authMapByBranch[String(centre._id)] || (centre.admin ? authMapByBranch[String(centre.admin)] : null);
    return {
      _id: centre._id,
      studyCentreName: centre.studyCentreName,
      studyCentreCode: centre.studyCentreCode,
      district: centre.district || "",
      state: centre.state || "",
      phone: centre.phone || "",
      isActive: centre.isActive !== false,
      username: auth ? auth.username : centre.studyCentreCode,
      authId: auth ? auth._id : null,
      hasCustomPassword: Boolean(auth && auth.encryptedPassword),
      maskedPassword: "••••••••",
    };
  });

  res.status(200).json({
    status: "success",
    results: data.length,
    data,
  });
});

/**
 * Super Admin: Reveal password of a specific study centre by verifying Super Admin's password
 */
exports.revealStudyCentrePassword = catchAsync(async (req, res, next) => {
  const { centreId, superAdminPassword } = req.body;

  if (!superAdminPassword) {
    return next(new AppError("Super Admin password is required to reveal credentials", 400));
  }
  if (!centreId) {
    return next(new AppError("Study centre ID is required", 400));
  }

  // 1. Verify Super Admin password
  const superAdmin = await Auth.findById(req.user._id).select("+password");
  if (!superAdmin) {
    return next(new AppError("Super Admin account not found", 404));
  }
  const isPasswordValid = await bcrypt.compare(superAdminPassword, superAdmin.password);
  if (!isPasswordValid) {
    return next(new AppError("Incorrect Super Admin password. Access denied.", 401));
  }

  // 2. Fetch the Study Centre and its Auth record
  const centre = await StudyCentre.findById(centreId);
  if (!centre) {
    return next(new AppError("Study Centre not found", 404));
  }

  let centreAuth = await Auth.findOne({ branch: centreId, role: "admin" }).select("+password +encryptedPassword");
  if (!centreAuth && centre.admin) {
    centreAuth = await Auth.findById(centre.admin).select("+password +encryptedPassword");
  }

  // 3. Decrypt or default to 1986
  let revealedPassword = "1986";
  if (centreAuth && centreAuth.encryptedPassword) {
    revealedPassword = decryptPassword(centreAuth.encryptedPassword);
  }

  res.status(200).json({
    status: "success",
    centreId: centre._id,
    studyCentreName: centre.studyCentreName,
    studyCentreCode: centre.studyCentreCode,
    username: centreAuth ? centreAuth.username : centre.studyCentreCode,
    password: revealedPassword,
    hasCustomPassword: Boolean(centreAuth && centreAuth.encryptedPassword),
  });
});

/**
 * Super Admin: Directly reset/update password for a study centre
 */
exports.adminResetCentrePassword = catchAsync(async (req, res, next) => {
  const { centreId } = req.params;
  const { superAdminPassword, newPassword } = req.body;

  if (!superAdminPassword || !newPassword) {
    return next(new AppError("Super Admin password and new password are required", 400));
  }

  // 1. Verify Super Admin password
  const superAdmin = await Auth.findById(req.user._id).select("+password");
  const isPasswordValid = await bcrypt.compare(superAdminPassword, superAdmin.password);
  if (!isPasswordValid) {
    return next(new AppError("Incorrect Super Admin password. Access denied.", 401));
  }

  // 2. Find or create Auth account for the study centre
  const centre = await StudyCentre.findById(centreId);
  if (!centre) {
    return next(new AppError("Study Centre not found", 404));
  }

  let centreAuth = await Auth.findOne({ branch: centreId, role: "admin" }).select("+password +encryptedPassword");
  if (!centreAuth && centre.admin) {
    centreAuth = await Auth.findById(centre.admin).select("+password +encryptedPassword");
  }

  if (!centreAuth) {
    centreAuth = new Auth({
      username: centre.studyCentreCode,
      branch: centre._id,
      role: "admin",
    });
  }

  centreAuth.password = newPassword;
  centreAuth.encryptedPassword = encryptPassword(newPassword);
  await centreAuth.save();

  if (!centre.admin) {
    centre.admin = centreAuth._id;
    await centre.save();
  }

  res.status(200).json({
    status: "success",
    message: "Study Centre password updated successfully",
    studyCentreName: centre.studyCentreName,
    studyCentreCode: centre.studyCentreCode,
    username: centreAuth.username,
  });
});
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Auth.find({ role: { $ne: "superAdmin" } })
      .populate("branch")
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      message: "Error getting users",
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt
      ? req.cookies.jwt
      : req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Auth.findById(decoded.userId);
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      message: "Not authorized",
    });
  }
};
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }
    next();
  };
};

exports.checkUserLoggedIn = async (req, res, next) => {
  let token = req.cookies.jwt;
  if (!token) {
    res.status(200).json({ error: "user not logged in" });
  } else {
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await Auth.findById(decoded.userId).populate(
      "branch",
      "studyCentreName _id role username studyCentreCode"
    );
    res.status(200).json({ user: user });
  }
};
exports.getMyProfile = catchAsync(async (req, res, next) => {
  let data = await Auth.findById(req.user._id);
  res.status(200).json(data);
});

// const deleteall=async()=>{
//   try {
//     await Auth.deleteMany({role:"admin"})
//     console.log('deleted');
//   } catch (error) {
//     console.log(error);
//   }
// }
