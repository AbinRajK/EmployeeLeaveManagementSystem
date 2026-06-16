const { registerUser, loginUser } = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error); // Pass to errorMiddleware
  }
};

const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (error) {
    next(error); // Pass to errorMiddleware
  }
};

module.exports = { register, login };