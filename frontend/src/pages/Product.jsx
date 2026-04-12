import { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../context/services/productService";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();

      const data = res.data.data.products;

      setProducts(Array.isArray(data) ? data : []);

    }catch (error) {
        const msg =
        error.response?.data?.error ||
        "Error fatching data";

      toast.error(msg);
      }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      toast.success("Deleted successfully");
      fetchProducts();
      setSelectedProduct(null);
    }catch (error) {
        const msg =
        error.response?.data?.error ||
        "Error deleting ";

      toast.error(msg);
      }
  };

  return (
    <div className="p-6 flex justify-center relative z-10">
      <div className="w-full max-w-4xl flex flex-col gap-4">

        <h1 className="text-white text-xl font-bold">Products</h1>

        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            className="text-white text-2xl font-bold cursor-pointer hover:text-orange-500"
            onClick={() => window.history.back()}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        </div>

        {/* List */}
        <div className="grid md:grid-cols-2 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="cursor-pointer bg-black/50 text-white rounded-2xl p-5 border hover:bg-black/80 transition"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="space-y-2 text-sm">

                <div className="flex justify-between">
                <p><strong>Name:</strong> {product.name}</p>
                <p><strong>Product Type:</strong> {product.product_type}</p>
                </div>
                <p><strong>Description:</strong> {product.description}</p>

                <div className="flex justify-between">
                  <p><strong>Price:</strong> {product.unit_price} DA</p>
                  <p><strong>Unit:</strong> {product.unit}</p>
                </div>

                <div className="flex justify-between">
                  <p><strong>Density:</strong> {product.density}</p>
                  <p className={product.active ? "text-green-500" : "text-red-500"}>
                    <strong className="text-white">State:</strong>{" "}
                    {product.active ? "Active" : "Inactive"}
                  </p>

                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-white text-white p-6 rounded-xl w-[350px] relative">

            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-2 right-3 cursor-pointer hover:text-red-500"
            >
              ✕
            </button>

            <div className="space-y-2 text-sm">

              <p><strong>Name:</strong> {selectedProduct.name}</p>
              <p><strong>Description:</strong> {selectedProduct.description}</p>
              <p><strong>Price:</strong> {selectedProduct.unit_price} DA</p>
              <p><strong>density:</strong> {selectedProduct.density}</p>
              <p><strong>Unit:</strong> {selectedProduct.unit}</p>

              <p className={selectedProduct.active ? "text-green-500" : "text-red-500"}>
                <strong className="text-white">State:</strong>{" "}
                {selectedProduct.active ? "Active" : "Inactive"}
              </p>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-4">

                {/* Edit */}
                <NavLink
                  to={selectedProduct ? `/EditProduct/${selectedProduct.id}` : "#"}
                  onClick={(e) => {
                    if (!selectedProduct) {
                      e.preventDefault();
                      toast.error("Select a product first");
                    }
                  }}
                  className="text-orange-400 text-xl hover:text-orange-600 transition"
                >
                  <i className="fa-solid fa-pen"></i>
                </NavLink>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedProduct) {
                      handleDelete(selectedProduct.id);
                    } else {
                      toast.error("Select a product first");
                    }
                  }}
                  className="text-orange-400 cursor-pointer text-xl hover:text-orange-600 transition"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}