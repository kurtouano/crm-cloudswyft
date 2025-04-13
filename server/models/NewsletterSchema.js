import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    serviceNum: {
      type: Number,
      required: true,
      unique: true,
    },
    clicks: {
      type: Number,
      required: true,
      default: 0,
    },
    link: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Newsletter = mongoose.model("Newsletter", newsletterSchema);
export default Newsletter;

