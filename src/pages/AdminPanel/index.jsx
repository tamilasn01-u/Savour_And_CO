import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PackageEditor from "../../components/PackageEditor";

const theme = {
  cream: "#F9F5EE",
  warmWhite: "#FDFAF5",
  charcoal: "#1C1C1A",
  brown: "#5C3D2E",
  gold: "#C9933A",
  muted: "#7A6F62",
  border: "#E5DDD0",
};

export default function AdminPanel() {
  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("menu"); // "menu", "package", "chef", or "events"
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "menu",
    price: 0,
    image: "",
    specialty: "", // for chefs
    menus: [], // for packages
  });
  const [newDishesForPackage, setNewDishesForPackage] = useState([]);
  const [currentNewDish, setCurrentNewDish] = useState({ title: "", description: "", image: "" });
  const [newDishImagePreview, setNewDishImagePreview] = useState(null);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [showPackageEditor, setShowPackageEditor] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    chef: "",
    eventDate: "",
    eventType: "wedding",
    guestCount: "",
    venue: "",
    feedback: {
      customerName: "",
      rating: 5,
      comment: "",
    },
  });
  const navigate = useNavigate();

  const adminToken = localStorage.getItem("adminToken");
  const adminUserStr = localStorage.getItem("adminUser");
  const adminUser = adminUserStr ? JSON.parse(adminUserStr) : null;

  useEffect(() => {
    if (!adminToken || !adminUser) {
      navigate("/login");
      return;
    }
    fetchItems();
    fetchEvents();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/admin/items");
      const data = await response.json();
      setItems(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/events");
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  // Filter items by category
  const filteredItems = items.filter((item) => item.category === activeTab);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };

  // Handle image file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          image: event.target.result, // Base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle new dish image upload for package
  const handleNewDishImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentNewDish((prev) => ({
          ...prev,
          image: event.target.result,
        }));
        setNewDishImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new dish to package (before submission)
  const addNewDishToPackage = () => {
    if (!currentNewDish.title || !currentNewDish.description) {
      setError("Dish title and description are required");
      return;
    }

    setNewDishesForPackage((prev) => [...prev, { ...currentNewDish, tempId: Date.now() }]);
    setCurrentNewDish({ title: "", description: "", image: "" });
    setNewDishImagePreview(null);
    setError("");
  };

  // Remove new dish from package
  const removeNewDishFromPackage = (tempId) => {
    setNewDishesForPackage((prev) => prev.filter((dish) => dish.tempId !== tempId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.description) {
      setError("Title and description are required");
      return;
    }

    try {
      let menusToAdd = [...formData.menus];

      // Create new dishes if this is a package
      if (activeTab === "package" && newDishesForPackage.length > 0) {
        for (const dish of newDishesForPackage) {
          const dishPayload = {
            title: dish.title,
            description: dish.description,
            category: "menu",
            image: dish.image,
            active: true,
            forPackageOnly: true,
          };

          console.log("Creating new dish:", dishPayload);

          const dishResponse = await fetch("http://localhost:5000/api/admin/items", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify(dishPayload),
          });

          const createdDish = await dishResponse.json();
          console.log("Created dish response:", createdDish);

          if (!dishResponse.ok) {
            throw new Error(`Failed to create dish: ${createdDish.message || "Unknown error"}`);
          }

          // Extract ID from response - handle different response structures
          const dishId = createdDish.item?._id || createdDish._id || createdDish.data?._id || createdDish.id;
          if (dishId) {
            menusToAdd.push(dishId);
            console.log("Added dish ID to menu:", dishId);
          } else {
            throw new Error("No ID returned from dish creation");
          }
        }
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `http://localhost:5000/api/admin/items/${editingId}`
        : "http://localhost:5000/api/admin/items";

      const payload = {
        ...formData,
        menus: menusToAdd,
        category: formData.category || activeTab,
        active: true,
      };

      console.log("Submitting payload:", payload);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response:", response.status, data);

      if (!response.ok) {
        setError(data.message || `Failed to ${editingId ? "update" : "create"} item`);
        return;
      }

      setSuccess(data.message || `Item ${editingId ? "updated" : "created"} successfully`);
      let resetData;
      if (activeTab === "chef") {
        resetData = { title: "", description: "", category: "chef", price: 0, image: "", specialty: "", menus: [] };
      } else if (activeTab === "package") {
        resetData = { title: "", description: "", category: "package", price: 0, image: "", specialty: "", menus: [] };
      } else {
        resetData = { title: "", description: "", category: "menu", price: 0, image: "", specialty: "", menus: [] };
      }
      setFormData(resetData);
      setNewDishesForPackage([]);
      setCurrentNewDish({ title: "", description: "", image: "" });
      setNewDishImagePreview(null);
      setEditingId(null);
      setShowForm(false);
      fetchItems();
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      price: item.price || 0,
      image: item.image || "",
      specialty: item.specialty || "",
      menus: item.menus || [],
    });
    setActiveTab(item.category);
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete item");
        return;
      }

      setSuccess("Item deleted successfully");
      fetchItems();
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    }
  };

  // Update package dishes
  const handleUpdatePackageDishes = async (packageId, selectedMenuIds) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/items/${packageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          menus: selectedMenuIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update package");
        return;
      }

      setSuccess("Package dishes updated successfully");
      setShowPackageEditor(false);
      setEditingPackageId(null);
      fetchItems();
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    }
  };

  // Open package editor
  const openPackageEditor = (packageItem) => {
    setEditingPackageId(packageItem._id);
    setFormData({
      title: packageItem.title,
      description: packageItem.description,
      category: "package",
      price: packageItem.price || 0,
      image: packageItem.image || "",
      specialty: "",
      menus: packageItem.menus || [],
    });
    setShowPackageEditor(true);
  };

  // Event handlers
  const handleEventChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("feedback.")) {
      const feedbackField = name.split(".")[1];
      setEventFormData((prev) => ({
        ...prev,
        feedback: {
          ...prev.feedback,
          [feedbackField]: feedbackField === "rating" ? parseInt(value) : value,
        },
      }));
    } else {
      setEventFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!eventFormData.title || !eventFormData.chef || !eventFormData.eventDate) {
      setError("Title, chef, and event date are required");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `http://localhost:5000/api/admin/events/${editingId}`
        : "http://localhost:5000/api/admin/events";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(eventFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || `Failed to ${editingId ? "update" : "create"} event`);
        return;
      }

      setSuccess(data.message);
      setEventFormData({
        title: "",
        description: "",
        chef: "",
        eventDate: "",
        eventType: "wedding",
        guestCount: "",
        venue: "",
        feedback: {
          customerName: "",
          rating: 5,
          comment: "",
        },
      });
      setEditingId(null);
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    }
  };

  const handleEventDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete event");
        return;
      }

      setSuccess("Event deleted successfully");
      fetchEvents();
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    }
  };

  const handleEventEdit = (event) => {
    setEventFormData({
      title: event.title,
      description: event.description || "",
      chef: event.chef._id,
      eventDate: event.eventDate.split("T")[0],
      eventType: event.eventType,
      guestCount: event.guestCount || "",
      venue: event.venue || "",
      feedback: event.feedback || {
        customerName: "",
        rating: 5,
        comment: "",
      },
    });
    setEditingId(event._id);
    setShowForm(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.warmWhite, paddingTop: 100, paddingBottom: 40 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", color: theme.charcoal, marginBottom: "0.5rem" }}>
            Admin Dashboard
          </h1>
          <p style={{ color: theme.muted, fontSize: "0.95rem" }}>
            Welcome, {adminUser?.name}! Manage menus and chefs.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: `2px solid ${theme.border}` }}>
          <button
            onClick={() => {
              setActiveTab("menu");
              setShowForm(false);
              setEditingId(null);
            }}
            style={{
              padding: "1rem 2rem",
              background: activeTab === "menu" ? theme.charcoal : "transparent",
              color: activeTab === "menu" ? "white" : theme.muted,
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 500,
              borderBottom: activeTab === "menu" ? `3px solid ${theme.gold}` : "none",
              transition: "all 0.3s",
            }}
          >
            🍽️ Menus
          </button>
          <button
            onClick={() => {
              setActiveTab("package");
              setShowForm(false);
              setEditingId(null);
            }}
            style={{
              padding: "1rem 2rem",
              background: activeTab === "package" ? theme.charcoal : "transparent",
              color: activeTab === "package" ? "white" : theme.muted,
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 500,
              borderBottom: activeTab === "package" ? `3px solid ${theme.gold}` : "none",
              transition: "all 0.3s",
            }}
          >
            📦 Packages
          </button>
          <button
            onClick={() => {
              setActiveTab("chef");
              setShowForm(false);
              setEditingId(null);
            }}
            style={{
              padding: "1rem 2rem",
              background: activeTab === "chef" ? theme.charcoal : "transparent",
              color: activeTab === "chef" ? "white" : theme.muted,
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 500,
              borderBottom: activeTab === "chef" ? `3px solid ${theme.gold}` : "none",
              transition: "all 0.3s",
            }}
          >
            👨‍🍳 Chefs
          </button>
          <button
            onClick={() => {
              setActiveTab("events");
              setShowForm(false);
              setEditingId(null);
            }}
            style={{
              padding: "1rem 2rem",
              background: activeTab === "events" ? theme.charcoal : "transparent",
              color: activeTab === "events" ? "white" : theme.muted,
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 500,
              borderBottom: activeTab === "events" ? `3px solid ${theme.gold}` : "none",
              transition: "all 0.3s",
            }}
          >
            📅 Events
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div style={{ background: "#fee", border: "1px solid #fcc", color: "#c33", padding: "1rem", borderRadius: 4, marginBottom: "1.5rem" }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ background: "#efe", border: "1px solid #cfc", color: "#3c3", padding: "1rem", borderRadius: 4, marginBottom: "1.5rem" }}>
            ✓ {success}
          </div>
        )}

        {/* Add Item Button */}
        {activeTab !== "events" && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setEditingId(null);
                let resetData;
                if (activeTab === "chef") {
                  resetData = { title: "", description: "", category: activeTab, price: 0, image: "", specialty: "", menus: [] };
                } else if (activeTab === "package") {
                  resetData = { title: "", description: "", category: activeTab, price: 0, image: "", specialty: "", menus: [] };
                } else {
                  resetData = { title: "", description: "", category: activeTab, price: 0, image: "", specialty: "", menus: [] };
                }
                setFormData(resetData);
              } else {
                let initialData;
                if (activeTab === "chef") {
                  initialData = { title: "", description: "", category: activeTab, price: 0, image: "", specialty: "", menus: [] };
                } else if (activeTab === "package") {
                  initialData = { title: "", description: "", category: activeTab, price: 0, image: "", specialty: "", menus: [] };
                } else {
                  initialData = { title: "", description: "", category: activeTab, price: 0, image: "", specialty: "", menus: [] };
                }
                setFormData(initialData);
              }
            }}
            style={{
              background: showForm ? theme.muted : theme.charcoal,
              color: "white",
              padding: "0.8rem 1.5rem",
              border: "none",
              borderRadius: 4,
              fontSize: "0.9rem",
              cursor: "pointer",
              marginBottom: "2rem",
              fontWeight: 500,
            }}
          >
            {showForm ? "Cancel" : `+ Add New ${activeTab === "chef" ? "Chef" : "Menu"}`}
          </button>
        )}

        {/* Add Event Button */}
        {activeTab === "events" && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setEditingId(null);
                setEventFormData({
                  title: "",
                  description: "",
                  chef: "",
                  eventDate: "",
                  eventType: "wedding",
                  guestCount: "",
                  venue: "",
                  feedback: {
                    customerName: "",
                    rating: 5,
                    comment: "",
                  },
                });
              }
            }}
            style={{
              background: showForm ? theme.muted : theme.charcoal,
              color: "white",
              padding: "0.8rem 1.5rem",
              border: "none",
              borderRadius: 4,
              fontSize: "0.9rem",
              cursor: "pointer",
              marginBottom: "2rem",
              fontWeight: 500,
            }}
          >
            {showForm ? "Cancel" : "+ Add New Event"}
          </button>
        )}

        {/* Package Editor Modal */}
        {showPackageEditor && editingPackageId && (
          <div style={{ background: "white", padding: "2rem", borderRadius: 8, border: `1px solid ${theme.border}`, marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", marginBottom: 0, color: theme.charcoal }}>
                📋 Manage Dishes: {formData.title}
              </h2>
              <button
                onClick={() => setShowPackageEditor(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: theme.muted,
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: theme.muted, marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              Select dishes to include in this package. Blue checkmarks (✓) indicate included dishes.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              {items
                .filter((item) => item.category === "menu")
                .map((dish) => {
                  const isIncluded = formData.menus.includes(dish._id);
                  return (
                    <div
                      key={dish._id}
                      onClick={() => {
                        setFormData((prev) => {
                          if (isIncluded) {
                            return { ...prev, menus: prev.menus.filter((id) => id !== dish._id) };
                          } else {
                            return { ...prev, menus: [...prev.menus, dish._id] };
                          }
                        });
                      }}
                      style={{
                        padding: "1rem",
                        border: isIncluded ? `2px solid #4169E1` : `1px solid ${theme.border}`,
                        borderRadius: 4,
                        cursor: "pointer",
                        background: isIncluded ? "#E6F0FF" : "white",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.8rem",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(65, 105, 225, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{ fontSize: "1.3rem", color: isIncluded ? "#4169E1" : theme.border, minWidth: "1.5rem" }}>
                        {isIncluded ? "✓" : "○"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 500, color: theme.charcoal, margin: "0 0 0.3rem 0" }}>{dish.title}</p>
                        <p style={{ fontSize: "0.8rem", color: theme.muted, margin: 0, lineHeight: 1.4 }}>
                          {dish.description.substring(0, 60)}...
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => handleUpdatePackageDishes(editingPackageId, formData.menus)}
                style={{
                  flex: 1,
                  background: "#4169E1",
                  color: "white",
                  padding: "0.8rem",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                ✓ Save Changes
              </button>
              <button
                onClick={() => setShowPackageEditor(false)}
                style={{
                  flex: 1,
                  background: theme.muted,
                  color: "white",
                  padding: "0.8rem",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Package Editor Modal */}
        {showForm && activeTab === "package" && (
          <PackageEditor
            formData={formData}
            setFormData={setFormData}
            items={items}
            newDishesForPackage={newDishesForPackage}
            currentNewDish={currentNewDish}
            setCurrentNewDish={setCurrentNewDish}
            newDishImagePreview={newDishImagePreview}
            onAddDish={addNewDishToPackage}
            onRemoveDish={removeNewDishFromPackage}
            onClose={() => {
              setShowForm(false);
              setEditingId(null);
              setNewDishesForPackage([]);
              setCurrentNewDish({ title: "", description: "", image: "" });
            }}
            onSubmit={handleSubmit}
            isEditing={!!editingId}
          />
        )}

        {/* Add/Edit Form Modal - Items (Non-Package) */}
        {showForm && activeTab !== "events" && activeTab !== "package" && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, overflowY: "auto", padding: "2rem" }}>
            <div style={{ background: "white", padding: "2rem", borderRadius: 8, border: `1px solid ${theme.border}`, maxWidth: 700, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", margin: 0, color: theme.charcoal }}>
                  {editingId ? `Edit ${activeTab === "chef" ? "Chef" : activeTab === "package" ? "Package" : "Menu"}` : `Add New ${activeTab === "chef" ? "Chef" : activeTab === "package" ? "Package" : "Menu"}`}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    color: theme.muted,
                  }}
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <input
                type="text"
                name="title"
                placeholder={activeTab === "chef" ? "Chef name" : activeTab === "package" ? "Package name" : "Menu name"}
                value={formData.title}
                onChange={handleChange}
                style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4 }}
                required
              />
              {activeTab === "chef" && (
                <input
                  type="text"
                  name="specialty"
                  placeholder="Specialty (e.g., Italian Cuisine)"
                  value={formData.specialty}
                  onChange={handleChange}
                  style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4 }}
                />
              )}
              {activeTab === "package" && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", color: theme.charcoal, fontWeight: 500, marginBottom: "0.5rem" }}>
                    Select Menus for this Package
                  </label>
                  <div style={{ border: `1px solid ${theme.border}`, borderRadius: 4, maxHeight: 200, overflowY: "auto", padding: "0.5rem" }}>
                    {items.filter(item => item.category === "menu" && item.active && !item.forPackageOnly).map(menu => {
                      const menuIds = formData.menus.map(m => typeof m === "string" ? m : m._id);
                      const isChecked = menuIds.includes(menu._id);
                      return (
                      <label key={menu._id} style={{ display: "block", padding: "0.5rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, menus: [...prev.menus, menu._id] }));
                            } else {
                              setFormData(prev => ({ ...prev, menus: prev.menus.filter(id => (typeof id === "string" ? id : id._id) !== menu._id) }));
                            }
                          }}
                          style={{ marginRight: "0.5rem" }}
                        />
                        {menu.title}
                      </label>
                    );
                    })}
                  </div>
                </div>
              )}
              {activeTab === "package" && (
                <div style={{ gridColumn: "1 / -1", borderTop: `2px solid ${theme.border}`, paddingTop: "1.5rem", marginTop: "0.5rem" }}>
                  <label style={{ display: "block", color: theme.charcoal, fontWeight: 500, marginBottom: "1rem", fontSize: "1rem" }}>
                    ✨ Add New Dishes for this Package
                  </label>
                  <div style={{ background: theme.cream, padding: "1rem", borderRadius: 4, marginBottom: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                      <input
                        type="text"
                        placeholder="New dish name"
                        value={currentNewDish.title}
                        onChange={(e) => setCurrentNewDish(prev => ({ ...prev, title: e.target.value }))}
                        style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4 }}
                      />
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleNewDishImageUpload}
                          style={{ flex: 1, padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4, cursor: "pointer" }}
                        />
                      </div>
                    </div>
                    <textarea
                      placeholder="New dish description"
                      value={currentNewDish.description}
                      onChange={(e) => setCurrentNewDish(prev => ({ ...prev, description: e.target.value }))}
                      style={{ width: "100%", padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4, marginBottom: "1rem", fontFamily: "'DM Sans', sans-serif", minHeight: 80 }}
                    />
                    {newDishImagePreview && (
                      <div style={{ marginBottom: "1rem" }}>
                        <img
                          src={newDishImagePreview}
                          alt="New dish preview"
                          style={{ maxWidth: "100%", maxHeight: 120, borderRadius: 4, border: `1px solid ${theme.border}` }}
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={addNewDishToPackage}
                      style={{
                        width: "100%",
                        background: theme.gold,
                        color: "white",
                        padding: "0.8rem",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      + Add Dish
                    </button>
                  </div>

                  {newDishesForPackage.length > 0 && (
                    <div style={{ background: "#f0f0f0", padding: "1rem", borderRadius: 4 }}>
                      <label style={{ display: "block", color: theme.charcoal, fontWeight: 500, marginBottom: "0.8rem" }}>
                        📋 Dishes to be created ({newDishesForPackage.length})
                      </label>
                      {newDishesForPackage.map((dish) => (
                        <div key={dish.tempId} style={{ background: "white", padding: "0.8rem", borderRadius: 4, marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${theme.border}` }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 500, color: theme.charcoal, margin: "0 0 0.3rem 0" }}>{dish.title}</p>
                            <p style={{ fontSize: "0.8rem", color: theme.muted, margin: 0 }}>{dish.description.substring(0, 50)}...</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNewDishFromPackage(dish.tempId)}
                            style={{
                              background: "#c33",
                              color: "white",
                              padding: "0.5rem 1rem",
                              border: "none",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              marginLeft: "1rem",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", color: theme.charcoal, fontWeight: 500, marginBottom: "0.5rem" }}>
                  📷 Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ padding: "0.8rem", border: `2px dashed ${theme.gold}`, borderRadius: 4, width: "100%", cursor: "pointer" }}
                />
                <p style={{ fontSize: "0.75rem", color: theme.muted, marginTop: "0.3rem" }}>
                  Supported formats: JPG, PNG, GIF, WebP, SVG (Max 5MB)
                </p>
                {formData.image && (
                  <div style={{ marginTop: "1rem" }}>
                    <p style={{ color: theme.charcoal, fontWeight: 500, marginBottom: "0.5rem" }}>Image Preview:</p>
                    <img
                      src={formData.image}
                      alt="Preview"
                      style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 4, border: `1px solid ${theme.border}` }}
                    />
                  </div>
                )}
              </div>
              <textarea
                name="description"
                placeholder={activeTab === "chef" ? "Chef bio and experience" : "Menu description"}
                value={formData.description}
                onChange={handleChange}
                style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4, gridColumn: "1 / -1", minHeight: 120, fontFamily: "'DM Sans', sans-serif" }}
                required
              />
              <button
                type="submit"
                style={{
                  gridColumn: "1 / -1",
                  background: theme.gold,
                  color: "white",
                  padding: "1rem",
                  border: "none",
                  borderRadius: 4,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {editingId ? `Update ${activeTab === "chef" ? "Chef" : activeTab === "package" ? "Package" : "Menu"}` : `Create ${activeTab === "chef" ? "Chef" : activeTab === "package" ? "Package" : "Menu"}`}
              </button>
            </form>
            </div>
          </div>
        )}

        {/* Add/Edit Form - Events */}
        {showForm && activeTab === "events" && (
          <div style={{ background: "white", padding: "2rem", borderRadius: 8, border: `1px solid ${theme.border}`, marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", marginBottom: "1.5rem", color: theme.charcoal }}>
              {editingId ? "Edit Event" : "Add New Event"}
            </h2>
            <form onSubmit={handleEventSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <input
                type="text"
                name="title"
                placeholder="Event title"
                value={eventFormData.title}
                onChange={handleEventChange}
                style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4 }}
                required
              />
              <select
                name="chef"
                value={eventFormData.chef}
                onChange={handleEventChange}
                style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4 }}
                required
              >
                <option value="">Select a chef</option>
                {items.filter(item => item.category === "chef").map(chef => (
                  <option key={chef._id} value={chef._id}>{chef.title}</option>
                ))}
              </select>
              <input
                type="date"
                name="eventDate"
                value={eventFormData.eventDate}
                onChange={handleEventChange}
                style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4 }}
                required
              />
              <select
                name="eventType"
                value={eventFormData.eventType}
                onChange={handleEventChange}
                style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4 }}
              >
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="private">Private</option>
                <option value="other">Other</option>
              </select>
              <input
                type="number"
                name="guestCount"
                placeholder="Guest count"
                value={eventFormData.guestCount}
                onChange={handleEventChange}
                style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4 }}
              />
              <input
                type="text"
                name="venue"
                placeholder="Venue"
                value={eventFormData.venue}
                onChange={handleEventChange}
                style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4 }}
              />
              <textarea
                name="description"
                placeholder="Event description"
                value={eventFormData.description}
                onChange={handleEventChange}
                style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4, gridColumn: "1 / -1", minHeight: 100, fontFamily: "'DM Sans', sans-serif" }}
              />
              
              {/* Customer Feedback Section */}
              <div style={{ gridColumn: "1 / -1", borderTop: `2px solid ${theme.border}`, paddingTop: "1rem", marginTop: "0.5rem" }}>
                <h3 style={{ color: theme.charcoal, marginBottom: "1rem" }}>Customer Feedback</h3>
              </div>
              <input
                type="text"
                name="feedback.customerName"
                placeholder="Customer name"
                value={eventFormData.feedback.customerName}
                onChange={handleEventChange}
                style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4 }}
              />
              <select
                name="feedback.rating"
                value={eventFormData.feedback.rating}
                onChange={handleEventChange}
                style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4 }}
              >
                <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                <option value="4">4 Stars ⭐⭐⭐⭐</option>
                <option value="3">3 Stars ⭐⭐⭐</option>
                <option value="2">2 Stars ⭐⭐</option>
                <option value="1">1 Star ⭐</option>
              </select>
              <textarea
                name="feedback.comment"
                placeholder="Customer feedback/comment"
                value={eventFormData.feedback.comment}
                onChange={handleEventChange}
                style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4, gridColumn: "1 / -1", minHeight: 100, fontFamily: "'DM Sans', sans-serif" }}
              />
              <button
                type="submit"
                style={{
                  gridColumn: "1 / -1",
                  background: theme.gold,
                  color: "white",
                  padding: "1rem",
                  border: "none",
                  borderRadius: 4,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {editingId ? "Update Event" : "Create Event"}
              </button>
            </form>
          </div>
        )}

        {/* Items List */}
        {activeTab !== "events" && (
          <>
            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem", color: theme.muted }}>Loading {activeTab === "chef" ? "chefs" : "menus"}...</div>
            ) : filteredItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: theme.muted }}>No {activeTab === "chef" ? "chefs" : "menus"} found. Create one to get started!</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
                {filteredItems.map((item) => (
                  <div key={item._id} style={{ background: "white", padding: "1.5rem", borderRadius: 8, border: `1px solid ${theme.border}` }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 4, marginBottom: "1rem" }}
                      />
                    )}
                    <h3 style={{ color: theme.charcoal, marginBottom: "0.5rem" }}>{item.title}</h3>
                    {item.specialty && activeTab === "chef" && (
                      <p style={{ color: theme.gold, fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                        🌟 {item.specialty}
                      </p>
                    )}
                    <p style={{ color: theme.muted, fontSize: "0.85rem", marginBottom: "1rem", lineHeight: 1.5 }}>{item.description}</p>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {activeTab === "package" && (
                        <button
                          onClick={() => openPackageEditor(item)}
                          style={{
                            flex: 1,
                            background: "#4169E1",
                            color: "white",
                            padding: "0.6rem",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                          }}
                        >
                          📋 Dishes
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(item)}
                        style={{
                          flex: 1,
                          background: theme.gold,
                          color: "white",
                          padding: "0.6rem",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        style={{
                          flex: 1,
                          background: "#c33",
                          color: "white",
                          padding: "0.6rem",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Events List */}
        {activeTab === "events" && (
          <>
            {events.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: theme.muted }}>No events found. Create one to get started!</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2rem" }}>
                {events.map((event) => (
                  <div key={event._id} style={{ background: "white", padding: "1.5rem", borderRadius: 8, border: `1px solid ${theme.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                      <div>
                        <h3 style={{ color: theme.charcoal, marginBottom: "0.3rem" }}>{event.title}</h3>
                        <p style={{ fontSize: "0.8rem", color: theme.gold, textTransform: "uppercase" }}>{event.eventType}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: theme.charcoal, marginBottom: "0.5rem" }}>
                      👨‍🍳 Chef: <strong>{event.chef.title}</strong>
                    </p>
                    <p style={{ fontSize: "0.85rem", color: theme.muted, marginBottom: "0.5rem" }}>
                      📅 {new Date(event.eventDate).toLocaleDateString()}
                    </p>
                    {event.guestCount && (
                      <p style={{ fontSize: "0.85rem", color: theme.muted, marginBottom: "0.5rem" }}>
                        👥 {event.guestCount} guests
                      </p>
                    )}
                    {event.venue && (
                      <p style={{ fontSize: "0.85rem", color: theme.muted, marginBottom: "0.5rem" }}>
                        📍 {event.venue}
                      </p>
                    )}
                    {event.description && (
                      <p style={{ fontSize: "0.85rem", color: theme.muted, marginBottom: "1rem", lineHeight: 1.5 }}>{event.description}</p>
                    )}
                    {event.feedback && (
                      <div style={{ background: theme.cream, borderRadius: 4, padding: "1rem", marginBottom: "1rem", borderLeft: `3px solid ${theme.gold}` }}>
                        <strong style={{ display: "block", marginBottom: "0.3rem", color: theme.charcoal }}>{event.feedback.customerName || "Anonymous"}</strong>
                        {event.feedback.rating && (
                          <p style={{ fontSize: "0.8rem", color: theme.gold, marginBottom: "0.3rem" }}>
                            {"⭐".repeat(event.feedback.rating)} ({event.feedback.rating}/5)
                          </p>
                        )}
                        <p style={{ fontSize: "0.8rem", color: theme.muted, fontStyle: "italic" }}>"{event.feedback.comment}"</p>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleEventEdit(event)}
                        style={{
                          flex: 1,
                          background: theme.gold,
                          color: "white",
                          padding: "0.6rem",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleEventDelete(event._id)}
                        style={{
                          flex: 1,
                          background: "#c33",
                          color: "white",
                          padding: "0.6rem",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
