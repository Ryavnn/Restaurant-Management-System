import { useState, useEffect } from "react";
import Cart from "../components/Pos-components/Cart";
import CategoryBar from "../components/Pos-components/CategoryBar";
import Menu from "../components/Pos-components/Menu";

function Pos() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [waiterName, setWaiterName] = useState("");

  useEffect(() => {
    let name = "";
    while (!name) {
      name = prompt("Please enter your name:");
    }
    setWaiterName(name);
  }, []);

  return (
    <>
      <div className="point-of-sale">
        <div className="pos-cont">
          <div className="pos-sidebar-left">
            <CategoryBar onCategorySelect={setSelectedCategory} />
          </div>
          <div className="pos-sidebar-right">
            <div className="search-bar">
              <input type="search" name="searchbar" id="searchbar" />
            </div>
            <div className="pos-main-cont">
              <div className="menu-cont">
                <Menu selectedCategory={selectedCategory} />
              </div>
              <div className="cart">
                <Cart waiterName={waiterName} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Pos;
