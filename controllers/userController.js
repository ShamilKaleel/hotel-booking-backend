const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bcryptSalt = bcrypt.genSaltSync(10);
require("dotenv").config();

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc).status(200);
  } catch (e) {
    res.status(422).json(e);
  }
};



const login = async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign(
        {
          email: userDoc.email,
          id: userDoc._id,
        },
        process.env.JWT_SECRETT,
        { expiresIn: "1h" }, // Expires in 1 hour,
        (err, token) => {
          if (err) throw err;
          res
            .cookie("token", token, {
              httpOnly: true, // Only accessible via HTTP requests, not JS
              secure: true, // Must be true for HTTPS (set this in production)
              sameSite: "None",
            })
            .json(userDoc);
        }
      );
    } else {
      res.status(422).json("pass not ok");
    }
  } else {
    res.status(422).json("not found");
  }
};


const profile = async (req, res) => {
  const userId = req.userId;
  try {
    const { name, email, _id } = await User.findById(userId);
    res.json({ name, email, _id }).status(200);
  } catch (e) {
    res.json(null).status(401);
  }
};

const logout = (req, res) => {
  try {
    const userId = req.userId; // Available from authMiddleware
    
    res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
        secure: true, // Must match login cookie settings
        sameSite: "None",
      })
      .json({ 
        message: "Logged out successfully",
        success: true 
      });
      
    console.log(`User ${userId} logged out successfully at ${new Date().toISOString()}`);
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ 
      message: "Error during logout", 
      success: false 
    });
  }
};
module.exports = { register, login, profile, logout };
