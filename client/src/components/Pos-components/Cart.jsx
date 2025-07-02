import { useState, useEffect } from "react";
import { useCart } from "../../CartContext";

function Cart() {
  const { cart, clearCart } = useCart();
  const [quantity, setQuantity] = useState(cart.map(() => 1));
  const [waiterName, setWaiterName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setQuantity(cart.map(() => 1));
  }, [cart]);

  const increaseQuantity = (index) => {
    setQuantity((prevQuantity) =>
      prevQuantity.map((q, i) => (i === index ? q + 1 : q))
    );
  };

  const decreaseQuantity = (index) => {
    setQuantity((prevQuantity) =>
      prevQuantity.map((q, i) => (i === index ? Math.max(q - 1, 1) : q))
    );
  };

  const calculateTotal = () => {
    return cart
      .reduce((total, meal, index) => {
        return total + meal.price * (quantity[index] || 1);
      }, 0)
      .toFixed(2);
  };

  const handlePlaceOrderClick = () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }
    setShowModal(true);
  };

  const confirmOrder = async () => {
    if (!waiterName.trim()) {
      setErrorMessage("Please enter a waiter name");
      return;
    }

    const orderDetails = {
      waiter_name: waiterName,
      table_number: tableNumber ? parseInt(tableNumber, 10) : null,
      items: cart.map((meal, index) => ({
        name: meal.name,
        price: meal.price,
        quantity: quantity[index] || 1,
        menu_item_id: meal.id,
      })),
    };

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const response = await fetch("http://127.0.0.1:5000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDetails),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Order placed successfully:", data);
        clearCart();
        setWaiterName("");
        setTableNumber("");
        setShowModal(false);
        alert("Order placed successfully!");
      } else {
        setErrorMessage(data.message || "Failed to place order");
        console.error("Order placement failed:", data);
      }
    } catch (error) {
      setErrorMessage("Error connecting to server");
      console.error("Order placement error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="cart-cont">
        <div className="cart-details">
          <h2>Cart</h2>
          <div className="orders">
            {cart.length === 0 ? (
              <div className="empty-cart-message">Your cart is empty</div>
            ) : (
              cart.map((meal, index) => (
                <div className="order" key={index}>
                  <div className="order-1">
                    <div className="dish-image">
                      <img
                        src={meal.image || "/placeholder-food.png"}
                        alt="Meal"
                      />
                    </div>
                  </div>
                  <div className="dish-name">
                    <h3>{meal.name}</h3>
                    <div className="quantity">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(index)}
                      >
                        -
                      </button>
                      <p>{quantity[index] || 1}</p>
                      <button
                        type="button"
                        onClick={() => increaseQuantity(index)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="dish-price">
                    <h3>${meal.price.toFixed(2)}</h3>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-total">
              <h3>Total: ${calculateTotal()}</h3>
            </div>
          )}
        </div>

        <div className="cart-button">
          <button
            className="cart-btn"
            onClick={handlePlaceOrderClick}
            disabled={cart.length === 0}
          >
            Place Order
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Order Details</h3>

            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}

            <div className="modal-field">
              <label htmlFor="waiterName">Waiter Name (required)</label>
              <input
                id="waiterName"
                type="text"
                value={waiterName}
                onChange={(e) => setWaiterName(e.target.value)}
                placeholder="Enter waiter name"
              />
            </div>

            <div className="modal-field">
              <label htmlFor="tableNumber">Table Number (optional)</label>
              <input
                id="tableNumber"
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Enter table number"
              />
            </div>

            <div className="order-summary">
              <h4>Order Summary</h4>
              <div className="order-items-summary">
                {cart.map((meal, index) => (
                  <div key={index} className="order-item-summary">
                    <span>
                      {quantity[index] || 1} x {meal.name}
                    </span>
                    <span>
                      ${(meal.price * (quantity[index] || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="order-total-summary">
                <strong>Total:</strong> <strong>Ksh{calculateTotal()}</strong>
              </div>
            </div>

            <div className="modal-buttons">
              <button onClick={confirmOrder} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Confirm Order"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cart-total {
          margin-top: 1rem;
          text-align: right;
          padding-right: 1rem;
        }
        
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 0 10px rgba(0,0,0,0.2);
          width: 400px;
          max-width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-field {
          margin-bottom: 1rem;
        }
        
        .modal-field label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }
        
        .modal-field input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        
        .order-summary {
          margin: 1.5rem 0;
          border-top: 1px solid #eee;
          padding-top: 1rem;
        }
        
        .order-items-summary {
          margin: 1rem 0;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .order-item-summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px dashed #eee;
        }
        
        .order-total-summary {
          display: flex;
          justify-content: space-between;
          padding-top: 0.5rem;
          font-size: 1.1rem;
        }
        
        .modal-buttons {
          margin-top: 1.5rem;
          display: flex;
          justify-content: space-between;
        }
        
        .modal-buttons button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        
        .modal-buttons button:first-child {
          background-color: #4caf50;
          color: white;
        }
        
        .modal-buttons button:first-child:hover {
          background-color: #388e3c;
        }
        
        .modal-buttons button:last-child {
          background-color: #f5f5f5;
          color: #333;
        }
        
        .modal-buttons button:last-child:hover {
          background-color: #e0e0e0;
        }
        
        .modal-buttons button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        .empty-cart-message {
          padding: 2rem;
          text-align: center;
          color: #757575;
          font-style: italic;
        }
      `}</style>
    </>
  );
}

export default Cart;
