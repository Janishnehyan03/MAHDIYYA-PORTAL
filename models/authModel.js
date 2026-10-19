const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const authSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: true,
      select: false,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      default: "admin",
      type: String,
      enum: ["admin", "superAdmin", "user"],
    },
    branch: {
      type: mongoose.Types.ObjectId,
      ref: "Branch",
    },
    encryptedPassword: {
      type: String,
      select: false,
    },
    deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);


authSchema.pre(/^find/, function(next) {
  // Only include documents where the deleted field is not true
  this.find({ deleted: { $ne: true } });
  next();
});

authSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Encrypt plain-text password for Super Admin retrieval if not already hashed
  if (this.password && !this.password.startsWith("$2a$") && !this.password.startsWith("$2b$")) {
    const { encryptPassword } = require("../utils/cryptoHelper");
    this.encryptedPassword = encryptPassword(this.password);
    this.password = await bcrypt.hash(this.password, 12);
  } else if (!this.encryptedPassword && this.password) {
    // If password was already hashed and no encryptedPassword, leave as is
  }
  this.passwordConfirm = undefined;
  next();
});
// bcrypt compare
authSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
authSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;
