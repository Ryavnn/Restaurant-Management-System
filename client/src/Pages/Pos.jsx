import { useState } from "react";
import Cart from "../components/Pos-components/Cart";
import CategoryBar from "../components/Pos-components/CategoryBar";
import Menu from "../components/Pos-components/Menu";
import SearchBar from "../components/Pos-components/SearchBar";

function Pos() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <div className="point-of-sale">
        <div className="pos-cont">
          <div className="pos-sidebar-left">
            <CategoryBar onCategorySelect={setSelectedCategory} />
          </div>
          <div className="pos-sidebar-right">
            <div className="search-bar">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>
            <div className="pos-main-cont">
              <div className="menu-cont">
                <Menu selectedCategory={selectedCategory} searchTerm={searchTerm} />
              </div>
              <div className="cart">
                <Cart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Pos;
