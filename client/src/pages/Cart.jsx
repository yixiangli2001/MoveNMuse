// Shirley
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CheckoutBtn } from "../utils/index.jsx";
import {
  getCartById,
  removeCartItem,
  removeMultipleCartItems,
  updateCartItem,
} from "../services/cartService";

export default function CartPage() {
  const user = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();

  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = user?.userId;
  
  // const allState = useSelector((state) => state);
  //     console.log(allState);

  // Load Cart
  useEffect(() => {

    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getCartById(userId);
        const data = res.data || res;
        setCart(data);
        setProducts(
          (data.cartItems || []).map((i) => ({ ...i, isSelected: false }))
        );
      } catch (e) {
        console.error("Failed to fetch cart", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, userId]);

  if (!user) {
    return (
      <div className="py-8">
        <h1 className="text-3xl font-bold text-center mb-6">My Cart</h1>
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white shadow-md rounded-lg p-6">
            <p className="text-center text-gray-600">
              Please log in to view your cart.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const priceOf = (p) =>
    Number(p?.occurrence?.price?.$numberDecimal ?? p?.occurrence?.price ?? 0);

  // Calculate subtotal
  const items = Array.isArray(products) ? products : [];
  const subtotal = items
    .filter((p) => p.isSelected)
    .reduce((sum, p) => sum + priceOf(p), 0);

  //  Toggle selection
  const toggleOne = (itemId) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.itemId === itemId ? { ...p, isSelected: !p.isSelected } : p
      )
    );
    setSelectAll(false);
  };
  // Toggle all
  const toggleAll = () => {
    setSelectAll((prev) => {
      const next = !prev;
      setProducts((ps) => ps.map((p) => ({ ...p, isSelected: next })));
      return next;
    });
  };

  //  Remove item
  const removeItem = async (itemId) => {
    try {
      setLoading(true);

      const res = await removeCartItem({
        cartId: cart.cartId,
        itemId,
      }); 
      const data = res.data || res;
      setCart(data);
      setProducts((prev) => prev.filter((p) => p.itemId !== itemId));
    } catch (e) {
      console.error("Failed to remove item", e);
    } finally {
      setConfirmId(null);
      setLoading(false);
    }
  };

  // Remove selected items
  const removeSelectedItems = async () => {
    try {
      setLoading(true);
      const selectedIds = products
        .filter((p) => p.isSelected)
        .map((p) => p.itemId);

      const res = await removeMultipleCartItems({
        cartId: cart.cartId,
        itemIds: selectedIds,
      });
      const data = res.data || res;
      setCart(data);
      setProducts((prev) =>
        prev.filter((p) => !selectedIds.includes(p.itemId))
      );
    } catch (e) {
      console.error("Failed to remove selected items", e);
    } finally {
      setLoading(false);
    }
  };

  //  Update item's occurrence (date/time)
  const updateOccurrence = async (itemId, occurrenceId) => {
    // update UI
    setProducts((prev) =>
      prev.map((p) => {
        if (p.itemId !== itemId) return p;
        const nextOcc =
          p.occurrences?.find(
            (o) =>
              (o.sessionId != null &&
                String(o.sessionId) === String(occurrenceId)) ||
              (o.roomSlotId != null &&
                String(o.roomSlotId) === String(occurrenceId))
          ) ?? p.occurrence;
        return {
          ...p,
          occurrenceId: occurrenceId,
          occurrence: nextOcc,
        };
      })
    );
    // update backend
    try {
      const res = await updateCartItem({
        cartId: cart.cartId,
        itemId,
        occurrenceId: occurrenceId,
      });
      const data = res.data || res;
      setCart(data);
      setProducts(data.cartItems);
    } catch (e) {
      console.error("Failed to update occurrence", e);
    }
  };

  //  Render
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-center mb-6">My Cart</h1>
      <div className="max-w-4xl mx-auto px-4">
        {/* Confirm popup */}
        {confirmId != null && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/50" />
            <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-6 relative z-10">
              <div className="mb-4">
                Are you sure you want to remove{" "}
                <b>
                  {products.find((p) => p.itemId === confirmId)?.product
                    ?.courseName ||
                    products.find((p) => p.itemId === confirmId)?.product
                      ?.name ||
                    "this item"}
                </b>{" "}
                from cart?
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setConfirmId(null)}
                >
                  No
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded"
                  onClick={() => removeItem(confirmId)}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
        {loading || products === null ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <p className="text-center text-gray-600 animate-pulse">
              Loading your cart…
            </p>
          </div>
        ) : !products.length ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <p className="text-center text-gray-600">Your cart is empty.</p>
          </div>
        ) : (
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleAll}
                  />
                </th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                  Product
                </th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                  Date & Time
                </th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                  Duration
                </th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-700">
                  Price
                </th>
                <th />
              </tr>
            </thead>

            <tbody>
              {products.map((p) => {
                const selectedId =
                  p?.occurrence?.sessionId ??
                  p?.occurrenceId ??
                  p?.occurrences?.[0]?.sessionId ??
                  "";

                return (
                  <tr key={p.itemId} className="border-b">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={p.isSelected}
                        onChange={() => toggleOne(p.itemId)}
                      />
                    </td>

                    <td className="py-4 px-6 text-sm text-gray-900">
                      {p?.product?.courseName ||
                        p?.product?.name ||
                        "Unnamed Product"}
                    </td>

                    <td className="py-4 px-6">
                      <select
                        id={`dates-${p.itemId}`}
                        className="border p-2"
                        value={String(selectedId)}
                        onChange={(e) =>
                          updateOccurrence(p.itemId, e.target.value)
                        }
                      >
                        {(p.occurrences || []).map((o) => {
                          const optId = o.sessionId ?? o.roomSlotId;
                          return (
                            <option key={String(optId)} value={String(optId)}>
                              {new Date(o.startTime)
                                .toISOString()
                                .slice(0, 16)
                                .replace("T", " ")}
                            </option>
                          );
                        })}
                      </select>
                    </td>

                    <td className="py-4 px-6 text-sm text-gray-900">
                      {p?.occurrence?.duration ?? 0} min
                    </td>

                    <td className="py-4 px-6 text-sm text-gray-900">
                      ${priceOf(p).toFixed(2)}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button
                        className="text-red-600 hover:text-red-800 font-bold"
                        onClick={() => setConfirmId(p.itemId)}
                      >
                        X
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr>
                <td className="py-4 px-6 text-sm text-gray-900" colSpan="3">
                  {/* {products?.filter((p) => p.isSelected).length} /{" "}
                  {products?.length} items selected */}
                  <div>

                  <button
                    className="text-red-600 font-bold"
                    onClick={removeSelectedItems}
                  >
                    Remove selected
                  </button>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-900 font-bold">
                  Subtotal
                </td>
                <td className="py-4 px-6 text-sm text-gray-900 font-bold">
                  ${subtotal.toFixed(2)}
                </td>
                <td className="py-4 px-6">
                  <CheckoutBtn
                    selectedItems={products.filter((p) => p.isSelected)}
                    subtotal={subtotal}
                    userId={userId}
                  />
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
