import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  uuid: String,

  text: String,

  filePath: String,
  fileName: String,

  expiresAt: Date,

  maxViews: {
    type: Number,
    default: 1, // one-time by default
  },

  views: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Content", contentSchema);
