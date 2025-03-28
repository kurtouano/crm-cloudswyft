import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: function () {
        return this.role === "employee"; 
      },
      unique: true,
      match: /^CS\d{4}$/, 
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "employee"],
      default: "employee",
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
