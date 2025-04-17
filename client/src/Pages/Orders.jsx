import { useState, useEffect } from "react";
import { useOrders } from "./OrderContext";
//import { useNavigate } from "react-router-dom";

function Orders() {
  const { orders, loading, error, fetchOrders, updateOrderStatus } =
    useOrders();
  const [statusFilter, setStatusFilter] = useState("");
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    
  //const navigate = useNavigate();

  // Status options for orders
  const statusOptions = [
    { value: "", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "delivered", label: "Delivered" },
    { value: "paid", label: "Paid" },
  ];

  // Next status mapping for progression
  const nextStatusMap = {
    pending: "preparing",
    preparing: "ready",
    ready: "delivered",
    delivered: "paid",
  };

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [statusFilter]);

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleStatusUpdate = async (orderId, currentStatus) => {
    const nextStatus = nextStatusMap[currentStatus];
    if (nextStatus) {
      const success = await updateOrderStatus(orderId, nextStatus);
      if (success) {
        // Optionally refresh the orders
        fetchOrders(statusFilter);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "#ffeb3b", // Yellow
      preparing: "#ff9800", // Orange
      ready: "#4caf50", // Green
      delivered: "#2196f3", // Blue
      paid: "#9e9e9e", // Grey
    };

    return statusColors[status] || "#9e9e9e";
  };

  if (loading && orders.length === 0) {
    return <div className="orders-loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="orders-error">Error: {error}</div>;
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>Orders Management</h1>
        <div className="filter-container">
          <label htmlFor="status-filter">Filter by status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={handleFilterChange}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            className="refresh-button"
            onClick={() => fetchOrders(statusFilter)}
          >
            Refresh
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>
            No orders found{statusFilter ? ` with status: ${statusFilter}` : ""}
            .
          </p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`order-card ${
                expandedOrderId === order.id ? "expanded" : ""
              }`}
            >
              <div
                className="order-header"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div className="order-basic-info">
                  <span className="order-number">Order #{order.id}</span>
                  <span
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
                <div className="order-summary-info">
                  <div className="order-waiter">
                    Waiter: {order.waiter_name}
                  </div>
                  {order.table_number && (
                    <div className="order-table">
                      Table: {order.table_number}
                    </div>
                  )}
                  <div className="order-time">
                    {formatDate(order.created_at)}
                  </div>
                  <div className="order-amount">
                    ${order.total_amount.toFixed(2)}
                  </div>
                </div>
                <div className="order-expand-icon">
                  {expandedOrderId === order.id ? "▲" : "▼"}
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div className="order-details">
                  <div className="order-items">
                    <h3>Order Items</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>${item.price.toFixed(2)}</td>
                            <td>${(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3">
                            <strong>Total</strong>
                          </td>
                          <td>
                            <strong>${order.total_amount.toFixed(2)}</strong>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="order-actions">
                    {nextStatusMap[order.status] && (
                      <button
                        className="update-status-button"
                        onClick={() =>
                          handleStatusUpdate(order.id, order.status)
                        }
                      >
                        Mark as{" "}
                        {nextStatusMap[order.status].charAt(0).toUpperCase() +
                          nextStatusMap[order.status].slice(1)}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .orders-page {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .orders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .orders-header h1 {
          margin: 0;
        }

        .filter-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-container select {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        .refresh-button {
          background-color: #2196f3;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        .refresh-button:hover {
          background-color: #0d8bf2;
        }

        .no-orders {
          text-align: center;
          padding: 40px;
          background-color: #f9f9f9;
          border-radius: 8px;
          color: #757575;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .order-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          background-color: white;
          transition: all 0.3s ease;
        }

        .order-card.expanded {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .order-header {
          padding: 16px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #f9f9f9;
        }

        .order-basic-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .order-number {
          font-weight: bold;
          font-size: 1.1rem;
        }

        .order-status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
          color: rgba(0, 0, 0, 0.7);
        }

        .order-summary-info {
          display: flex;
          gap: 16px;
        }

        .order-waiter,
        .order-table,
        .order-time,
        .order-amount {
          font-size: 0.9rem;
        }

        .order-amount {
          font-weight: bold;
        }

        .order-expand-icon {
          font-size: 0.8rem;
          color: #757575;
        }

        .order-details {
          padding: 16px;
          border-top: 1px solid #eee;
          background-color: white;
        }

        .order-items h3 {
          margin-top: 0;
          margin-bottom: 12px;
        }

        .order-items table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }

        .order-items th,
        .order-items td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        .order-items th {
          background-color: #f5f5f5;
        }

        .order-items tfoot td {
          border-top: 2px solid #ddd;
          padding-top: 12px;
        }

        .order-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
        }

        .update-status-button {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .update-status-button:hover {
          background-color: #3d8b40;
        }

        .orders-loading,
        .orders-error {
          padding: 40px;
          text-align: center;
          background-color: #f9f9f9;
          border-radius: 8px;
        }

        .orders-error {
          color: #d32f2f;
        }
      `}</style>
    </div>
  );
}

export default Orders;
