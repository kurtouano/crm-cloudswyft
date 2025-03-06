import { AuthorizationCode } from "simple-oauth2"; // ✅ Correct Import
import User from "../models/UserSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ✅ Initialize OAuth2 Client
const oauth2Client = new AuthorizationCode({
  client: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
  },
  auth: {
    tokenHost: "https://login.microsoftonline.com",
    authorizePath: `/${process.env.TENANT_ID}/oauth2/v2.0/authorize`,
    tokenPath: `/${process.env.TENANT_ID}/oauth2/v2.0/token`,
  },
});

// ✅ Function to Exchange Authorization Code for Access Token
export const getAccessToken = async (authCode) => {
  try {
    const tokenParams = {
      code: authCode,
      redirect_uri: process.env.REDIRECT_URI, 
      grant_type: "authorization_code", // ✅ Add this
      scope: "https://graph.microsoft.com/.default",
    };

    const result = await oauth2Client.getToken(tokenParams);
    return result.token.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw new Error("Failed to fetch access token");
  }
};

export const handleAuthCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: "Authorization code is missing" });
  }

  try {
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: "authorization_code",
        scope: "https://graph.microsoft.com/.default offline_access",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }, // ✅ Required header
      }
    );

    const accessToken = tokenResponse.data.access_token;
    res.json({ accessToken });
  } catch (error) {
    console.error("Error exchanging code for token:", error.response?.data || error.message);
    res.status(500).json({ message: "Authentication failed" });
  }
};

// ✅ Login Controller for Normal Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // Create a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
