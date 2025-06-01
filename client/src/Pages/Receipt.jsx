import React from "react";

function Receipt({ order }) {
  if (!order) return null;

  const handlePrint = () => {
    const printContent = document.getElementById("receipt-content").innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      `<!DOCTYPE html><html><head><title>Receipt</title></head><body>${printContent}</body></html>`
    );
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="receipt">
      <div id="receipt-content">
        <h2>Receipt</h2>
        <p>Order ID: {order.id}</p>
        <p>Waiter: {order.waiter_name}</p>
        <p>Table: {order.table_number || "N/A"}</p>
        <p>Date: {new Date(order.created_at).toLocaleString()}</p>
        <h3>Items:</h3>
        <ul>
          {order.items.map((item) => (
            <li key={item.id}>
              {item.name} - {item.quantity} x ksh{item.price.toFixed(2)} = $
              {(item.quantity * item.price).toFixed(2)}
            </li>
          ))}
        </ul>
        <h3>Total: ${order.total_amount.toFixed(2)}</h3>
      </div>
      <button onClick={handlePrint}>Print Receipt</button>
    </div>
  );
}

export default Receipt;
