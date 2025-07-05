import { useState, useEffect } from "react";
import { useCart } from "../../CartContext";

function Menu({ selectedCategory, searchTerm = "" }) {
  const [meals, setMeals] = useState([]);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("https://restaurant-management-system-o16r.onrender.com/menu")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch menu items");
        }
        return response.json();
      })
      .then((responseData) => {
        // Handle the response structure from the backend
        if (responseData.success && responseData.data) {
          setMeals(responseData.data);
        } else {
          throw new Error("Invalid data structure");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filter meals based on the selected category and search term
  const filteredMeals = meals.filter((meal) => {
    const matchesCategory = selectedCategory ? meal.category === selectedCategory : true;
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <p>Loading menu items...</p>;
  if (error) return <p>Error loading menu: {error}</p>;

  return (
    <div className="menu-cont-det">
      {filteredMeals.length > 0 ? (
        filteredMeals.map((meal) => (
          <div
            key={meal.id}
            className="menu-card"
            onClick={() => addToCart(meal)}
          >
            <div className="menu-image">
              <img
                src={
                  meal.image && meal.image !== ""
                    ? meal.image
                    : "https://img.freepik.com/free-photo/vegetables-salad-table_23-2148515515.jpg?semt=ais_hybrid&w=740"
                }
                alt={`${meal.name} image`}
              />
            </div>
            <div className="menu-text">
              <p className="food-name">{meal.name}</p>
              <p className="food-price">${meal.price}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No meals available for this category.</p>
      )}
    </div>
  );
}

export default Menu;
