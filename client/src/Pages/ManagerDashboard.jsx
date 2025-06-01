import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  ChefHat,
  FileText,
  Package,
  Home,
  BarChart2,
  PlusCircle,
  AlertCircle,
} from "lucide-react";

export default function RestaurantDashboard() {
  // State management for all entities
  const [activeTab, setActiveTab] = useState("dashboard");
  const [staff, setStaff] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  // Form state for adding new items
  const [newStaffMember, setNewStaffMember] = useState({
    name: "",
    role: "Waiter",
    hours: 40,
    performance: 80,
  });
  
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    category: "Main",
    price: 0,
    popularity: 50,
  });
  
  const [newInventoryItem, setNewInventoryItem] = useState({
    name: "",
    quantity: 0,
    low_stock: 0,
    category: "Miscellaneous",
  });

  // API base URL
  const API_URL = "http://127.0.0.1:5000";

  // Fetch data on component mount
  useEffect(() => {
    if (token) {
      fetchStaff();
      fetchMenu();
      fetchInventory();
    }
  }, [token]);

  // API methods
  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStaff(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch staff data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMenu = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/menu`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch menu data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/inventory`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setInventory(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch inventory data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Metrics calculations
  const waiters = staff.filter((s) => s.role === "Waiter");
  const chefs = staff.filter((s) => s.role === "Chef");
  const lowStockItems = inventory.filter(
    (item) => item.quantity <= item.low_stock
  );
  const totalMenuValue = menuItems.reduce((acc, item) => acc + item.price, 0);

  // Prepared data for charts
  const staffByRole = [
    { name: "Waiters", value: waiters.length },
    { name: "Chefs", value: chefs.length },
  ];

  const inventoryByCategory = inventory.reduce((acc, item) => {
    const existingCategory = acc.find((c) => c.name === item.category);
    if (existingCategory) {
      existingCategory.value += item.quantity;
    } else {
      acc.push({ name: item.category, value: item.quantity });
    }
    return acc;
  }, []);

  const popularItems = [...menuItems]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 5);

  // Handle form submissions
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStaffMember)
      });
      
      const data = await response.json();
      if (data.success) {
        setStaff([...staff, data.staff]);
        setNewStaffMember({ name: "", role: "Waiter", hours: 40, performance: 80 });
        setError(null);
      } else {
        setError(data.message || "Failed to add staff member");
      }
    } catch (err) {
      setError("Failed to add staff member");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMenuItem)
      });
      
      const data = await response.json();
      if (data.success) {
        setMenuItems([...menuItems, data.item]);
        setNewMenuItem({ name: "", category: "Main", price: 0, popularity: 50 });
        setError(null);
      } else {
        setError(data.message || "Failed to add menu item");
      }
    } catch (err) {
      setError("Failed to add menu item");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInventoryItem = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newInventoryItem.name,
          category: newInventoryItem.category,
          quantity: newInventoryItem.quantity,
          low_stock: newInventoryItem.low_stock
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setInventory([...inventory, data.item]);
        setNewInventoryItem({ name: "", quantity: 0, low_stock: 0, category: "Miscellaneous" });
        setError(null);
      } else {
        setError(data.message || "Failed to add inventory item");
      }
    } catch (err) {
      setError("Failed to add inventory item");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setError(null);
        // Fetch initial data
        fetchStaff();
        fetchMenu();
        fetchInventory();
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Login failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Styles
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
      color: "#333",
    },
    header: {
      padding: "20px",
      backgroundColor: "#ff6b6b",
      color: "white",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    content: {
      display: "flex",
      flex: 1,
      overflow: "hidden",
    },
    sidebar: {
      width: "220px",
      backgroundColor: "#f8f9fa",
      borderRight: "1px solid #e9ecef",
      padding: "20px 0",
    },
    sidebarItem: {
      display: "flex",
      alignItems: "center",
      padding: "12px 20px",
      cursor: "pointer",
      transition: "background-color 0.2s",
      color: "#495057",
    },
    sidebarItemActive: {
      backgroundColor: "#ff6b6b",
      color: "white",
      fontWeight: "bold",
    },
    sidebarIcon: {
      marginRight: "10px",
    },
    mainContent: {
      flex: 1,
      padding: "30px",
      overflowY: "auto",
      backgroundColor: "#fff",
    },
    dashboardGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      padding: "20px",
    },
    cardHeader: {
      marginTop: 0,
      fontWeight: "bold",
      color: "#333",
      borderBottom: "1px solid #eee",
      paddingBottom: "10px",
      marginBottom: "15px",
    },
    statsNumber: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#ff6b6b",
      marginBottom: "8px",
    },
    statsLabel: {
      color: "#6c757d",
      fontSize: "14px",
    },
    chartContainer: {
      height: "300px",
      marginBottom: "30px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: "30px",
    },
    th: {
      textAlign: "left",
      padding: "12px",
      backgroundColor: "#f8f9fa",
      borderBottom: "2px solid #dee2e6",
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid #dee2e6",
    },
    form: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      padding: "20px",
      marginBottom: "30px",
    },
    formField: {
      marginBottom: "15px",
    },
    label: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "bold",
    },
    input: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "16px",
    },
    select: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "16px",
      backgroundColor: "white",
    },
    button: {
      backgroundColor: "#ff6b6b",
      color: "white",
      border: "none",
      borderRadius: "4px",
      padding: "12px 20px",
      fontSize: "16px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonIcon: {
      marginRight: "8px",
    },
    alert: {
      padding: "12px",
      borderRadius: "4px",
      backgroundColor: "#f8d7da",
      color: "#721c24",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
    },
    loginContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f8f9fa",
    },
    loginCard: {
      width: "400px",
      padding: "30px",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    },
    loadingOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255,255,255,0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
  };

  // Render specific tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "staff":
        return renderStaff();
      case "menu":
        return renderMenu();
      case "inventory":
        return renderInventory();
      default:
        return renderDashboard();
    }
  };

  // Login component
  const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const handleSubmit = (e) => {
      e.preventDefault();
      handleLogin(email, password);
    };
    
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Restaurant Manager Login</h2>
          
          {error && (
            <div style={styles.alert}>
              <AlertCircle size={20} style={{ marginRight: "10px" }} />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={styles.formField}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              style={styles.button}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // Dashboard tab
  const renderDashboard = () => (
    <div>
      <h2 style={{ marginBottom: "20px" }}>Dashboard Overview</h2>

      {error && (
        <div style={styles.alert}>
          <AlertCircle size={20} style={{ marginRight: "10px" }} />
          {error}
        </div>
      )}

      <div style={styles.dashboardGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardHeader}>Staff</h3>
          <div style={styles.statsNumber}>{staff.length}</div>
          <div style={styles.statsLabel}>Total Staff Members</div>
          <div style={{ marginTop: "10px" }}>
            <div>Waiters: {waiters.length}</div>
            <div>Chefs: {chefs.length}</div>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardHeader}>Menu</h3>
          <div style={styles.statsNumber}>{menuItems.length}</div>
          <div style={styles.statsLabel}>Menu Items</div>
          <div style={{ marginTop: "10px" }}>
            <div>
              Average Price: Ksh{menuItems.length > 0 ? (totalMenuValue / menuItems.length).toFixed(2) : "0.00"}
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardHeader}>Inventory</h3>
          <div style={styles.statsNumber}>{inventory.length}</div>
          <div style={styles.statsLabel}>Inventory Items</div>
          <div
            style={{
              marginTop: "10px",
              color: lowStockItems.length > 0 ? "#dc3545" : "#28a745",
            }}
          >
            {lowStockItems.length} items low on stock
          </div>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div style={styles.alert}>
          <AlertCircle size={20} style={{ marginRight: "10px" }} />
          <strong>Warning:</strong> {lowStockItems.length} items are running low
          on stock. Please check the inventory tab.
        </div>
      )}

      {staff.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.cardHeader}>Staff Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={staffByRole}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#ff6b6b"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {popularItems.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.cardHeader}>Most Popular Menu Items</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={popularItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{
                  value: "Popularity Score",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="popularity" fill="#ff9f43" name="Popularity Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {inventoryByCategory.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.cardHeader}>Inventory by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={inventoryByCategory}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#54a0ff"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  // Staff tab
  const renderStaff = () => (
    <div>
      <h2 style={{ marginBottom: "20px" }}>Staff Management</h2>

      {error && (
        <div style={styles.alert}>
              <AlertCircle size={20} style={{ marginRight: "10px" }} />
          {error}
        </div>
      )}

      <form style={styles.form} onSubmit={handleAddStaff}>
        <h3 style={styles.cardHeader}>Add New Staff Member</h3>
        <div style={styles.formField}>
          <label style={styles.label}>Name</label>
          <input
            type="text"
            style={styles.input}
            value={newStaffMember.name}
            onChange={(e) =>
              setNewStaffMember({ ...newStaffMember, name: e.target.value })
            }
            required
          />
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Role</label>
          <select
            style={styles.select}
            value={newStaffMember.role}
            onChange={(e) =>
              setNewStaffMember({ ...newStaffMember, role: e.target.value })
            }
          >
            <option value="Waiter">Waiter</option>
            <option value="Chef">Chef</option>
          </select>
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Weekly Hours</label>
          <input
            type="number"
            style={styles.input}
            value={newStaffMember.hours}
            onChange={(e) =>
              setNewStaffMember({
                ...newStaffMember,
                hours: Number(e.target.value),
              })
            }
            min="0"
            max="80"
            required
          />
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Performance Score (0-100)</label>
          <input
            type="number"
            style={styles.input}
            value={newStaffMember.performance}
            onChange={(e) =>
              setNewStaffMember({
                ...newStaffMember,
                performance: Number(e.target.value),
              })
            }
            min="0"
            max="100"
            required
          />
        </div>
        <button type="submit" style={styles.button} disabled={isLoading}>
          <PlusCircle size={20} style={styles.buttonIcon} />
          {isLoading ? "Adding..." : "Add Staff Member"}
        </button>
      </form>

      <div>
        <h3 style={styles.cardHeader}>Staff Members</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Weekly Hours</th>
              <th style={styles.th}>Performance</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id}>
                <td style={styles.td}>{member.id}</td>
                <td style={styles.td}>{member.name}</td>
                <td style={styles.td}>{member.role}</td>
                <td style={styles.td}>{member.hours}</td>
                <td style={styles.td}>{member.performance}/100</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {staff.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.cardHeader}>Staff Performance</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={staff}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{
                  value: "Performance Score",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="performance"
                fill="#ff6b6b"
                name="Performance Score"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  // Menu tab
  const renderMenu = () => (
    <div>
      <h2 style={{ marginBottom: "20px" }}>Menu Management</h2>

      {error && (
        <div style={styles.alert}>
          <AlertCircle size={20} style={{ marginRight: "10px" }} />
          {error}
        </div>
      )}

      <form style={styles.form} onSubmit={handleAddMenuItem}>
        <h3 style={styles.cardHeader}>Add New Menu Item</h3>
        <div style={styles.formField}>
          <label style={styles.label}>Name</label>
          <input
            type="text"
            style={styles.input}
            value={newMenuItem.name}
            onChange={(e) =>
              setNewMenuItem({ ...newMenuItem, name: e.target.value })
            }
            required
          />
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Category</label>
          <select
            style={styles.select}
            value={newMenuItem.category}
            onChange={(e) =>
              setNewMenuItem({ ...newMenuItem, category: e.target.value })
            }
          >
            <option value="Starter">Starter</option>
            <option value="Main">Main</option>
            <option value="Dessert">Dessert</option>
            <option value="Drinks">Drinks</option>
          </select>
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Price (Ksh)</label>
          <input
            type="number"
            step="0.01"
            style={styles.input}
            value={newMenuItem.price}
            onChange={(e) =>
              setNewMenuItem({ ...newMenuItem, price: Number(e.target.value) })
            }
            min="0"
            required
          />
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Popularity Score (0-100)</label>
          <input
            type="number"
            style={styles.input}
            value={newMenuItem.popularity}
            onChange={(e) =>
              setNewMenuItem({
                ...newMenuItem,
                popularity: Number(e.target.value),
              })
            }
            min="0"
            max="100"
            required
          />
        </div>
        <button type="submit" style={styles.button} disabled={isLoading}>
          <PlusCircle size={20} style={styles.buttonIcon} />
          {isLoading ? "Adding..." : "Add Menu Item"}
        </button>
      </form>

      <div>
        <h3 style={styles.cardHeader}>Menu Items</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Popularity</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id}>
                <td style={styles.td}>{item.id}</td>
                <td style={styles.td}>{item.name}</td>
                <td style={styles.td}>{item.category}</td>
                <td style={styles.td}>Ksh{item.price.toFixed(2)}</td>
                <td style={styles.td}>{item.popularity}/100</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {menuItems.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.cardHeader}>Menu Items by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={menuItems.reduce((acc, item) => {
                  const existingCategory = acc.find(
                    (c) => c.name === item.category
                  );
                  if (existingCategory) {
                    existingCategory.value += 1;
                  } else {
                    acc.push({ name: item.category, value: 1 });
                  }
                  return acc;
                }, [])}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#54a0ff"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  // Inventory tab
  const renderInventory = () => (
    <div>
      <h2 style={{ marginBottom: "20px" }}>Inventory Management</h2>

      {error && (
        <div style={styles.alert}>
          <AlertCircle size={20} style={{ marginRight: "10px" }} />
          {error}
        </div>
      )}

      <form style={styles.form} onSubmit={handleAddInventoryItem}>
        <h3 style={styles.cardHeader}>Add New Inventory Item</h3>
        <div style={styles.formField}>
          <label style={styles.label}>Name</label>
          <input
            type="text"
            style={styles.input}
            value={newInventoryItem.name}
            onChange={(e) =>
              setNewInventoryItem({ ...newInventoryItem, name: e.target.value })
            }
            required
          />
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Category</label>
          <select
            style={styles.select}
            value={newInventoryItem.category}
            onChange={(e) =>
              setNewInventoryItem({
                ...newInventoryItem,
                category: e.target.value,
              })
            }
          >
            <option value="Meat">Meat</option>
            <option value="Seafood">Seafood</option>
            <option value="Produce">Produce</option>
            <option value="Dry Goods">Dry Goods</option>
            <option value="Dairy">Dairy</option>
            <option value="Beverages">Beverages</option>
            <option value="Oils">Oils</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Miscellaneous">Miscellaneous</option>
            <option value="flour">flour</option>
          </select>
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Quantity</label>
          <input
            type="number"
            style={styles.input}
            value={newInventoryItem.quantity}
            onChange={(e) =>
              setNewInventoryItem({
                ...newInventoryItem,
                quantity: Number(e.target.value),
              })
            }
            min="0"
            required
          />
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Low Stock Threshold</label>
          <input
            type="number"
            style={styles.input}
            value={newInventoryItem.low_stock}
            onChange={(e) =>
              setNewInventoryItem({
                ...newInventoryItem,
                low_stock: Number(e.target.value),
              })
            }
            min="0"
            required
          />
        </div>
        <button type="submit" style={styles.button} disabled={isLoading}>
          <PlusCircle size={20} style={styles.buttonIcon} />
          {isLoading ? "Adding..." : "Add Inventory Item"}
        </button>
      </form>

      <div>
        <h3 style={styles.cardHeader}>Inventory Items</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Low Stock Threshold</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => {
              const isLowStock = item.quantity <= item.low_stock;
              return (
                <tr key={item.id}>
                  <td style={styles.td}>{item.id}</td>
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>{item.category}</td>
                  <td style={styles.td}>{item.quantity}</td>
                  <td style={styles.td}>{item.low_stock}</td>
                  <td
                    style={{
                      ...styles.td,
                      color: isLowStock ? "#dc3545" : "#28a745",
                      fontWeight: "bold",
                    }}
                  >
                    {isLowStock ? "LOW STOCK" : "OK"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {inventory.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.cardHeader}>Inventory Status</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{ value: "Quantity", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#54a0ff" name="Current Quantity" />
              <Bar dataKey="low_stock" fill="#ff6b6b" name="Low Stock Threshold" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  // If no token, show login form
  if (!token) {
    return <LoginForm />;
  }

  // Loading indicator
  if (isLoading) {
    return (
      <div style={styles.loadingOverlay}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>Restaurant Manager Dashboard</h1>
      </header>
      <div style={styles.content}>
        <div style={styles.sidebar}>
          <div
            style={{
              ...styles.sidebarItem,
              ...(activeTab === "dashboard" ? styles.sidebarItemActive : {}),
            }}
            onClick={() => setActiveTab("dashboard")}
          >
            <Home size={20} style={styles.sidebarIcon} />
            Dashboard
          </div>
          <div
            style={{
              ...styles.sidebarItem,
              ...(activeTab === "staff" ? styles.sidebarItemActive : {}),
            }}
            onClick={() => setActiveTab("staff")}
          >
            <Users size={20} style={styles.sidebarIcon} />
            Staff
          </div>
          <div
            style={{
              ...styles.sidebarItem,
              ...(activeTab === "menu" ? styles.sidebarItemActive : {}),
            }}
            onClick={() => setActiveTab("menu")}
          >
            <FileText size={20} style={styles.sidebarIcon} />
            Menu
          </div>
          <div
            style={{
              ...styles.sidebarItem,
              ...(activeTab === "inventory" ? styles.sidebarItemActive : {}),
            }}
            onClick={() => setActiveTab("inventory")}
          >
            <Package size={20} style={styles.sidebarIcon} />
            Inventory
          </div>
        </div>
        <div style={styles.mainContent}>{renderTabContent()}</div>
      </div>
    </div>
  );
}