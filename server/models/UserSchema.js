import mongoose from "mongoose";

// User Schema for authentication
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "employee"], // Only allows admin or employee
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
