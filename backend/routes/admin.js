import express from "express";
import Item from "../models/Item.js";
import Event from "../models/Event.js";
import { adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

// GET all items (public)
router.get("/items", async (req, res) => {
  try {
    const items = await Item.find({ active: true })
      .populate("createdBy", "name email")
      .populate("menus");
    res.status(200).json(items);
  } catch (error) {
    console.error("Get items error:", error);
    res.status(500).json({ message: "Error fetching items" });
  }
});

// GET single item (public)
router.get("/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("menus");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error("Get item error:", error);
    res.status(500).json({ message: "Error fetching item" });
  }
});

// CREATE new item (admin only)
router.post("/items", adminOnly, async (req, res) => {
  try {
    const { title, description, category, price, image, specialty, menus, forPackageOnly } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newItem = new Item({
      title,
      description,
      category: category || "menu",
      price: price || 0,
      image: image || null,
      specialty: specialty || null,
      menus: menus && Array.isArray(menus) ? menus : [],
      forPackageOnly: forPackageOnly || false,
      createdBy: req.user.id,
      active: true,
    });

    await newItem.save();
    
    // Populate references - use separate populate calls for better error handling
    try {
      await newItem.populate("createdBy", "name email");
    } catch (popErr) {
      console.warn("Warning: Could not populate createdBy:", popErr);
    }
    
    try {
      await newItem.populate("menus");
    } catch (popErr) {
      console.warn("Warning: Could not populate menus:", popErr);
    }

    res.status(201).json({
      message: "Item created successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("Create item error:", error);
    res.status(500).json({ message: "Error creating item: " + error.message });
  }
});

// UPDATE item (admin only)
router.put("/items/:id", adminOnly, async (req, res) => {
  try {
    const { title, description, category, price, image, specialty, active, menus, forPackageOnly } = req.body;

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Update fields
    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (price !== undefined) item.price = price;
    if (image !== undefined) item.image = image;
    if (specialty !== undefined) item.specialty = specialty;
    if (active !== undefined) item.active = active;
    if (forPackageOnly !== undefined) item.forPackageOnly = forPackageOnly;
    if (menus !== undefined) item.menus = Array.isArray(menus) ? menus : [];

    await item.save();
    
    // Populate references - use separate populate calls for better error handling
    try {
      await item.populate("createdBy", "name email");
    } catch (popErr) {
      console.warn("Warning: Could not populate createdBy:", popErr);
    }
    
    try {
      await item.populate("menus");
    } catch (popErr) {
      console.warn("Warning: Could not populate menus:", popErr);
    }

    res.status(200).json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update item error:", error);
    res.status(500).json({ message: "Error updating item: " + error.message });
  }
});

// DELETE item (admin only)
router.delete("/items/:id", adminOnly, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({
      message: "Item deleted successfully",
      item,
    });
  } catch (error) {
    console.error("Delete item error:", error);
    res.status(500).json({ message: "Error deleting item" });
  }
});

// ========== EVENTS ROUTES ==========

// GET events by chef ID (public)
router.get("/events/chef/:chefId", async (req, res) => {
  try {
    const events = await Event.find({ chef: req.params.chefId, active: true })
      .populate("chef", "title specialty image")
      .populate("createdBy", "name email")
      .sort({ eventDate: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Get chef events error:", error);
    res.status(500).json({ message: "Error fetching chef events" });
  }
});

// GET all events (public)
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find({ active: true })
      .populate("chef", "title specialty image")
      .populate("createdBy", "name email")
      .sort({ eventDate: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ message: "Error fetching events" });
  }
});

// CREATE new event (admin only)
router.post("/events", adminOnly, async (req, res) => {
  try {
    const { title, description, chef, eventDate, eventType, guestCount, venue, feedback } = req.body;

    if (!title || !chef || !eventDate) {
      return res.status(400).json({ message: "Title, chef, and event date are required" });
    }

    const newEvent = new Event({
      title,
      description: description || "",
      chef,
      eventDate,
      eventType: eventType || "other",
      guestCount: guestCount || null,
      venue: venue || null,
      feedback: feedback || null,
      createdBy: req.user.id,
    });

    await newEvent.save();
    await newEvent.populate("chef", "title specialty image");
    await newEvent.populate("createdBy", "name email");

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ message: "Error creating event" });
  }
});

// UPDATE event (admin only)
router.put("/events/:id", adminOnly, async (req, res) => {
  try {
    const { title, description, chef, eventDate, eventType, guestCount, venue, feedback, active } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (chef) event.chef = chef;
    if (eventDate) event.eventDate = eventDate;
    if (eventType) event.eventType = eventType;
    if (guestCount !== undefined) event.guestCount = guestCount;
    if (venue) event.venue = venue;
    if (feedback !== undefined) event.feedback = feedback;
    if (active !== undefined) event.active = active;

    await event.save();
    await event.populate("chef", "title specialty image");
    await event.populate("createdBy", "name email");

    res.status(200).json({
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({ message: "Error updating event" });
  }
});

// DELETE event (admin only)
router.delete("/events/:id", adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({
      message: "Event deleted successfully",
      event,
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ message: "Error deleting event" });
  }
});

export default router;
