const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const registerUser = async (
  userData
) => {
  const {
    name,
    email,
    password,
    role,
  } = userData;

  const existingUser =
    await User.findOne({
      email,
    });

  if (existingUser) {
    throw new Error(
      "Email already exists"
    );
  }

  const hashedPassword =
    await bcrypt.hash(
      password,
      10
    );

  return await User.create({
    name,
    email,
    password:
      hashedPassword,
    role,
  });
};

const loginUser = async (
  userData
) => {
  const {
    email,
    password,
  } = userData;

  const user =
    await User.findOne({
      email,
    });

  if (!user) {
    throw new Error(
      "Invalid credentials"
    );
  }

  const isMatch =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!isMatch) {
    throw new Error(
      "Invalid credentials"
    );
  }

  const token =
    generateToken(
      user._id,
      user.role
    );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = {
  registerUser,
  loginUser,
};