import { useState, useEffect } from "react";
import { useOrders } from "./OrderContext";

function KitchenDisplay() {
  const { orders, loading, error, fetchOrders, updateOrderStatus } =
    useOrders();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Sort orders when orders array changes
  useEffect(() => {
    if (orders && orders.length > 0) {
      setPendingOrders(orders.filter((order) => order.status === "pending"));
      setPreparingOrders(
        orders.filter((order) => order.status === "preparing")
      );
      setReadyOrders(orders.filter((order) => order.status === "ready"));
    }
  }, [orders]);

  const handleStartPreparing = async (orderId) => {
    const success = await updateOrderStatus(orderId, "preparing");
    if (success) {
      fetchOrders();
    }
  };

  const handleMarkReady = async (orderId) => {
    const success = await updateOrderStatus(orderId, "ready");
    if (success) {
      fetchOrders();
    }
  };

  const handleMarkDelivered = async (orderId) => {
    const success = await updateOrderStatus(orderId, "delivered");
    if (success) {
      fetchOrders();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Calculate time elapsed since order creation
  const getTimeElapsed = (dateString) => {
    const orderTime = new Date(dateString);
    const now = new Date();
    const diffMs = now - orderTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  };

  if (loading && orders.length === 0) {
    return <div className="kitchen-loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="kitchen-error">Error: {error}</div>;
  }

  return (
    <div className="kitchen-display">
      <div className="kitchen-header">
        <h1>Kitchen Display System</h1>
        <button className="refresh-button" onClick={fetchOrders}>
          Refresh Orders
        </button>
      </div>

      <div className="orders-columns">
        <div className="order-column">
          <div className="column-header pending">
            <h2>Pending Orders ({pendingOrders.length})</h2>
          </div>
          <div className="column-orders">
            {pendingOrders.length === 0 ? (
              <div className="no-orders">No pending orders</div>
            ) : (
              pendingOrders.map((order) => (
                <div key={order.id} className="kitchen-order-card pending">
                  <div className="order-info">
                    <div className="order-header">
                      <span className="order-number">Order #{order.id}</span>
                      <span className="order-time">
                        {formatTime(order.created_at)}
                      </span>
                    </div>
                    <div className="order-meta">
                      <span>Waiter: {order.waiter_name}</span>
                      {order.table_number && (
                        <span>Table: {order.table_number}</span>
                      )}
                      <span className="order-ago">
                        {getTimeElapsed(order.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="order-items">
                    <ul>
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          <span className="item-quantity">
                            {item.quantity}x
                          </span>
                          <span className="item-name">{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="order-actions">
                    <button
                      className="prepare-button"
                      onClick={() => handleStartPreparing(order.id)}
                    >
                      Start Preparing
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="order-column">
          <div className="column-header preparing">
            <h2>Preparing ({preparingOrders.length})</h2>
          </div>
          <div className="column-orders">
            {preparingOrders.length === 0 ? (
              <div className="no-orders">No orders in preparation</div>
            ) : (
              preparingOrders.map((order) => (
                <div key={order.id} className="kitchen-order-card preparing">
                  <div className="order-info">
                    <div className="order-header">
                      <span className="order-number">Order #{order.id}</span>
                      <span className="order-time">
                        {formatTime(order.created_at)}
                      </span>
                    </div>
                    <div className="order-meta">
                      <span>Waiter: {order.waiter_name}</span>
                      {order.table_number && (
                        <span>Table: {order.table_number}</span>
                      )}
                      <span className="order-ago">
                        {getTimeElapsed(order.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="order-items">
                    <ul>
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          <span className="item-quantity">
                            {item.quantity}x
                          </span>
                          <span className="item-name">{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="order-actions">
                    <button
                      className="ready-button"
                      onClick={() => handleMarkReady(order.id)}
                    >
                      Mark as Ready
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="order-column">
          <div className="column-header ready">
            <h2>Ready for Pickup ({readyOrders.length})</h2>
          </div>
          <div className="column-orders">
            {readyOrders.length === 0 ? (
              <div className="no-orders">No orders ready for pickup</div>
            ) : (
              readyOrders.map((order) => (
                <div key={order.id} className="kitchen-order-card ready">
                  <div className="order-info">
                    <div className="order-header">
                      <span className="order-number">Order #{order.id}</span>
                      <span className="order-time">
                        {formatTime(order.created_at)}
                      </span>
                    </div>
                    <div className="order-meta">
                      <span>Waiter: {order.waiter_name}</span>
                      {order.table_number && (
                        <span>Table: {order.table_number}</span>
                      )}
                      <span className="order-ago">
                        {getTimeElapsed(order.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="order-items">
                    <ul>
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          <span className="item-quantity">
                            {item.quantity}x
                          </span>
                          <span className="item-name">{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="order-actions">
                    <button
                      className="delivered-button"
                      onClick={() => handleMarkDelivered(order.id)}
                    >
                      Mark as Delivered
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .kitchen-display {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .kitchen-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .kitchen-header h1 {
          margin: 0;
        }

        .refresh-button {
          background-color: #2196f3;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .orders-columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .order-column {
          display: flex;
          flex-direction: column;
          background-color: #f5f5f5;
          border-radius: 8px;
          overflow: hidden;
          min-height: 400px;
        }

        .column-header {
          padding: 16px;
          color: white;
        }

        .column-header h2 {
          margin: 0;
          font-size: 1.2rem;
        }

        .column-header.pending {
          background-color: #ff9800;
        }

        .column-header.preparing {
          background-color: #2196f3;
        }

        .column-header.ready {
          background-color: #4caf50;
        }

        .column-orders {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .kitchen-order-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .kitchen-order-card.pending {
          border-left: 4px solid #ff9800;
        }

        .kitchen-order-card.preparing {
          border-left: 4px solid #2196f3;
        }

        .kitchen-order-card.ready {
          border-left: 4px solid #4caf50;
        }

        .order-info {
          padding: 16px;
          border-bottom: 1px solid #eee;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .order-number {
          font-weight: bold;
          font-size: 1.1rem;
        }

        .order-time {
          font-size: 0.9rem;
          color: #757575;
        }

        .order-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 0.9rem;
          color: #757575;
        }

        .order-ago {
          font-style: italic;
        }

        .order-items {
          padding: 16px;
        }

        .order-items ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .order-items li {
          margin-bottom: 8px;
          font-size: 1rem;
          display: flex;
          align-items: center;
        }

        .item-quantity {
          margin-right: 8px;
          font-weight: bold;
          color: #757575;
        }

        .order-actions {
          padding: 0 16px 16px;
          display: flex;
          justify-content: flex-end;
        }

        .order-actions button {
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .prepare-button {
          background-color: #2196f3;
        }

        .ready-button {
          background-color: #4caf50;
        }

        .delivered-button {
          background-color: #9c27b0;
        }

        .no-orders {
          padding: 24px;
          text-align: center;
          color: #757575;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 8px;
        }

        .kitchen-loading,
        .kitchen-error {
          padding: 40px;
          text-align: center;
          background-color: #f9f9f9;
          border-radius: 8px;
        }

        .kitchen-error {
          color: #d32f2f;
        }
      `}</style>
    </div>
  );
}

export default KitchenDisplay;
