import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ProductForm.css";

const URI_CATEGORIES = "http://localhost:8000/categories/";

const ProductForm = ({ initialData = {}, onSubmit, isEditing = false }) => {
  const [formData, setFormData] = useState({
    descripcion: "",
    cantidad: "",
    precio: "",
    categoria: "",
    ...initialData,
  });
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(URI_CATEGORIES);
        setCategories(res.data);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData.image) {
      setImagePreview(`http://localhost:8000/uploads/${initialData.image}`);
    }
  }, [initialData.image]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file }));

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.descripcion ||
      !formData.cantidad ||
      !formData.precio ||
      !formData.categoria ||
      (!isEditing && !formData.image)
    ) {
      setError("Por favor complete todos los campos requeridos.");
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "image" && !formData[key]) {
        return;
      }
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });

    onSubmit(submitData);
  };

  return (
    <div className="product-form-container">
      <div className="product-form-card">
        <h2 className="form-title">
          {isEditing ? "Editar Producto" : "Registrar Producto"}
        </h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cantidad</label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Precio Unitario</label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Categoría</label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryname}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Imagen</label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              accept="image/*"
              required={!isEditing}
            />

            {imagePreview && (
              <div className="image-preview">
                <p>Vista previa:</p>
                <div className="preview-container">
                  <img src={imagePreview} alt="Preview" />
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="submit-button">
            {isEditing ? "Actualizar" : "Crear"} Producto
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
