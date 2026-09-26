import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    chef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventType: {
      type: String,
      enum: ["wedding", "corporate", "birthday", "anniversary", "private", "other"],
      default: "other",
    },
    guestCount: {
      type: Number,
    },
    venue: {
      type: String,
    },
    feedback: {
      customerName: {
        type: String,
        trim: true,
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
      },
      image: {
        type: String,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
