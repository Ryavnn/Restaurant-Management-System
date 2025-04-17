import { createContext, useContext, useState, useEffect } from "react";

// Create context
const OrderContext = createContext();

// Custom hook to use the order context
export function useOrders() {
  return useContext(OrderContext);
}

// Provider component
export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all orders
  const fetchOrders = async (status = null) => {
    try {
      setLoading(true);
      const url = new URL("http://127.0.0.1:5000/orders");
      if (status) {
        url.searchParams.append("status", status);
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch orders");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update the local orders state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: newStatus,
                  updated_at: data.order.updated_at,
                }
              : order
          )
        );
        return true;
      } else {
        throw new Error(data.message || "Failed to update order");
      }
    } catch (err) {
      console.error("Error updating order:", err);
      return false;
    }
  };

  // Get order by ID
  const getOrderById = async (orderId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:5000/orders/${orderId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || "Failed to fetch order");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching order:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete an order (manager only)
  const deleteOrder = async (orderId, authToken) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Remove the deleted order from the local state
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== orderId)
        );
        return true;
      } else {
        throw new Error(data.message || "Failed to delete order");
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      return false;
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  // Value to be provided
  const value = {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
    getOrderById,
    deleteOrder,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}
