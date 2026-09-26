const theme = {
  cream: "#F9F5EE",
  charcoal: "#1C1C1A",
  gold: "#C9933A",
  muted: "#7A6F62",
  border: "#E5DDD0",
};

export default function PackageEditor({ formData, setFormData, items, newDishesForPackage, currentNewDish, setCurrentNewDish, newDishImagePreview, onAddDish, onRemoveDish, onClose, onSubmit, isEditing }) {
  const getMenuIds = (menus) => {
    return menus.map(m => typeof m === "string" ? m : m._id);
  };

  const handleMenuToggle = (menuId, isChecked) => {
    if (isChecked) {
      setFormData(prev => ({ ...prev, menus: [...prev.menus, menuId] }));
    } else {
      setFormData(prev => ({
        ...prev,
        menus: prev.menus.filter(id => (typeof id === "string" ? id : id._id) !== menuId)
      }));
    }
  };

  const menuIds = getMenuIds(formData.menus);
  const menuItems = items.filter(item => item.category === "menu" && item.active && !item.forPackageOnly);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, overflowY: "auto", padding: "2rem" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: 8, border: `1px solid ${theme.border}`, maxWidth: 700, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", margin: 0, color: theme.charcoal }}>
            {isEditing ? "Edit Package" : "Create Package"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: theme.muted }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Title */}
          <input
            type="text"
            placeholder="Package name"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4 }}
            required
          />

          {/* Image Upload */}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setFormData(prev => ({ ...prev, image: event.target.result }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
              style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4, width: "100%", cursor: "pointer" }}
            />
          </div>

          {/* Description */}
          <textarea
            placeholder="Package description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4, gridColumn: "1 / -1", minHeight: 80, fontFamily: "'DM Sans', sans-serif" }}
            required
          />

          {/* Image Preview */}
          {formData.image && (
            <div style={{ gridColumn: "1 / -1" }}>
              <img src={formData.image} alt="Preview" style={{ maxWidth: "100%", maxHeight: 150, borderRadius: 4, border: `1px solid ${theme.border}` }} />
            </div>
          )}

          {/* Select Menus */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", color: theme.charcoal, fontWeight: 500, marginBottom: "0.5rem" }}>
              📋 Select Menus for this Package
            </label>
            <div style={{ border: `1px solid ${theme.border}`, borderRadius: 4, maxHeight: 200, overflowY: "auto", padding: "0.5rem" }}>
              {menuItems.length > 0 ? (
                menuItems.map(menu => (
                  <label key={menu._id} style={{ display: "block", padding: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={menuIds.includes(menu._id)}
                      onChange={(e) => handleMenuToggle(menu._id, e.target.checked)}
                      style={{ marginRight: "0.5rem" }}
                    />
                    {menu.title}
                  </label>
                ))
              ) : (
                <p style={{ color: theme.muted, padding: "0.5rem" }}>No menus available</p>
              )}
            </div>
          </div>

          {/* Add New Dishes */}
          <div style={{ gridColumn: "1 / -1", borderTop: `2px solid ${theme.border}`, paddingTop: "1rem", marginTop: "1rem" }}>
            <label style={{ display: "block", color: theme.charcoal, fontWeight: 500, marginBottom: "1rem" }}>
              ✨ Add New Dishes for this Package
            </label>
            <div style={{ background: theme.cream, padding: "1rem", borderRadius: 4, marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Dish name"
                value={currentNewDish.title}
                onChange={(e) => setCurrentNewDish(prev => ({ ...prev, title: e.target.value }))}
                style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4, width: "100%", marginBottom: "0.5rem" }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setCurrentNewDish(prev => ({ ...prev, image: event.target.result }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4, width: "100%", marginBottom: "0.5rem", cursor: "pointer" }}
              />
              <textarea
                placeholder="Dish description"
                value={currentNewDish.description}
                onChange={(e) => setCurrentNewDish(prev => ({ ...prev, description: e.target.value }))}
                style={{ padding: "0.8rem", border: `1px solid ${theme.border}`, borderRadius: 4, width: "100%", minHeight: 60, fontFamily: "'DM Sans', sans-serif", marginBottom: "0.5rem" }}
              />
              {newDishImagePreview && (
                <img src={newDishImagePreview} alt="Dish" style={{ maxWidth: "100%", maxHeight: 100, borderRadius: 4, marginBottom: "0.5rem" }} />
              )}
              <button
                type="button"
                onClick={onAddDish}
                style={{ width: "100%", background: theme.gold, color: "white", padding: "0.8rem", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 500 }}
              >
                + Add Dish
              </button>
            </div>

            {/* Added Dishes List */}
            {newDishesForPackage.length > 0 && (
              <div style={{ background: "#f0f0f0", padding: "1rem", borderRadius: 4 }}>
                <label style={{ display: "block", color: theme.charcoal, fontWeight: 500, marginBottom: "0.8rem" }}>
                  📋 Dishes to be created ({newDishesForPackage.length})
                </label>
                {newDishesForPackage.map((dish) => (
                  <div key={dish.tempId} style={{ background: "white", padding: "0.8rem", borderRadius: 4, marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontWeight: 500, color: theme.charcoal, margin: "0 0 0.3rem 0" }}>{dish.title}</p>
                      <p style={{ fontSize: "0.8rem", color: theme.muted, margin: 0 }}>{dish.description.substring(0, 50)}...</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveDish(dish.tempId)}
                      style={{ background: "#c33", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: 4, cursor: "pointer", fontSize: "0.8rem" }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem" }}>
            <button
              type="submit"
              style={{ flex: 1, background: theme.gold, color: "white", padding: "1rem", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 500 }}
            >
              {isEditing ? "Update Package" : "Create Package"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, background: theme.muted, color: "white", padding: "1rem", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 500 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
