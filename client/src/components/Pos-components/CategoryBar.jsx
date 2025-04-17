import { useEffect, useState } from "react";

function CategoryBar({ onCategorySelect }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:5000/categories")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        // Handle the actual response structure which has data array with string values
        if (responseData.success && Array.isArray(responseData.data)) {
          // Transform string categories into objects with id and name
          const formattedCategories = responseData.data.map(
            (categoryName, index) => ({
              id: index + 1,
              name: categoryName,
              // Using placeholder images since actual images aren't in the API response
              image: `/api/placeholder/100/100`,
            })
          );
          setCategories(formattedCategories);
        } else {
          throw new Error("Invalid data format received from API");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="error-message">Error loading categories: {error}</div>
    );
  }

  if (isLoading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="category-cont">
      <div className="category-header">
        <h2>Categories</h2>
      </div>

      <div
    
        className="category-card"
        onClick={() => onCategorySelect("")}
      >
        <div className="category-text">
          <p>All</p>
        </div>
      </div>

      {categories && categories.length > 0 ? (
        categories.map((category) => (
          <div
            key={category.id}
            className="category-card"
            onClick={() => onCategorySelect(category.name)}
          >
            <div className="category-text">
              <p>{category.name || "Unnamed Category"}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="no-categories">No categories available</div>
      )}
    </div>
  );
}

export default CategoryBar;
