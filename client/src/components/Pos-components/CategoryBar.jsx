import { useEffect, useState } from "react";

function CategoryBar({onCategorySelect}) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/categories")
      .then((response) => response.json())
      .then((data) => setCategories(data));
  }, []);
  return (
    <>
      <div className="category-cont">
        <div className="category-header">
          <h2>Categories</h2>
        </div>
        {categories.map((category) => (
          <div key={category.id} className="category-card" onClick={() => onCategorySelect(category.name)}>
            <div className="category-image">
              <img src={category.image} alt="pizza Image" />
            </div>
            <div className="category-text">
              <p>{category.name}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default CategoryBar;
