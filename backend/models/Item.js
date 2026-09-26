import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["menu", "chef", "service", "package"],
      default: "menu",
    },
    price: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: null,
    },
    specialty: {
      type: String,
      default: null,
    },
    menus: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    forPackageOnly: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
