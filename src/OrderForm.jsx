import { useState, useMemo } from "react";
import products from "./data/product";

const CATEGORIES = [...new Set(products.map((p) => p.category))];

const CATEGORY_ICONS = {
  "Laptops & Computers": "💻",
  "Phones & Tablets": "📱",
};

function OrderForm() {
  const [category, setCategory] = useState("All");
  const [productId, setProductId] = useState("");
  const [amount, setAmount] = useState();
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);

  const filteredProducts = useMemo(() => {
    if (category === "All") return [];
    return products.filter((p) => p.category === category);
  }, [category]);

  const selectedProduct = products.find((p) => p.id === Number(productId));

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setProductId("");
    setAmount(0);
    setError("");
  };

  const handleProductChange = (e) => {
    setProductId(e.target.value);
    setAmount(0);
    setError("");
  };

  const handleAdd = () => {
    if (!selectedProduct) return;

    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    // check how many of this product are already in the cart
    const existingRow = cart.find((row) => row.id === selectedProduct.id);
    const alreadyInCart = existingRow ? existingRow.amount : 0;
    const totalRequested = alreadyInCart + amount;

    if (totalRequested > selectedProduct.stock) {
      const remaining = selectedProduct.stock - alreadyInCart;
      setError(`Not enough item, only ${remaining} left`);
      return;
    }

    const price = selectedProduct.price;

    if (existingRow) {
      // merge into existing row instead of duplicating
      setCart(
        cart.map((row) =>
          row.id === selectedProduct.id
            ? {
                ...row,
                amount: row.amount + amount,
                total: price * (row.amount + amount) * (1 - selectedProduct.discount),
              }
            : row
        )
      );
    } else {
      const total = price * amount * (1 - selectedProduct.discount);
      setCart([
        ...cart,
        {
          id: selectedProduct.id,
          item: selectedProduct.name,
          category: selectedProduct.category,
          price,
          discount: selectedProduct.discount,
          amount,
          total,
        },
      ]);
    }

    setProductId("");
    setAmount(0);
    setError("");
  };

  const grandTotal = cart.reduce((sum, row) => sum + row.total, 0);

  const isProductDisabled = category === "All";
  const isAmountDisabled = !selectedProduct;
  const isAddDisabled = !selectedProduct || amount <= 0;

  return (
    <div className="order-form">
      <div className="form-row">
        <label>Select Category:</label>
        <select value={category} onChange={handleCategoryChange}>
          <option value="All">All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Select Product:</label>
        <select
          value={productId}
          onChange={handleProductChange}
          disabled={isProductDisabled}
        >
          <option value="">Please Select An Item</option>
          {filteredProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <label className="amount-label">Amount:</label>
        <input
          type="number"
          min="0"
          value={amount}
          disabled={isAmountDisabled}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <button onClick={handleAdd} disabled={isAddDisabled}>
          Add Item
        </button>

        {error && <span className="error-message">{error}</span>}
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>Item</th>
            <th>Category</th>
            <th>Price</th>
            <th>Discount</th>
            <th>Amount</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((row, idx) => (
            <tr key={row.id}>
              <td>{idx}</td>
              <td>{row.id}</td>
              <td>{row.item}</td>
              <td>{CATEGORY_ICONS[row.category] || row.category}</td>
              <td>{row.price}</td>
              <td>{Math.round(row.discount * 100)}%</td>
              <td>{row.amount}</td>
              <td>{Math.round(row.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grand-total">Total: {Math.round(grandTotal)}</div>
    </div>
  );
}

export default OrderForm;