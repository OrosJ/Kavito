import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const URI = "http://localhost:8000/products/";

const CompEditProduct = () => {
  const { id } = useParams(); // Obtener el id del producto de la URL
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenActual, setImagenActual] = useState("");
  const navigate = useNavigate();

  const updateProduct = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("descripcion", descripcion);
    formData.append("cantidad", cantidad);
    formData.append("precio", precio);
    if (imagen) {
      formData.append("image", imagen); // Subir la nueva imagen
    }

    try {
      await axios.put(URI + id, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/products");
    } catch (error) {
      console.error("Error al actualizar el producto", error);
    }
  };

  useEffect(() => {
    const getProductById = async () => {
      try {
        const res = await axios.get(URI + id);
        setDescripcion(res.data.descripcion);
        setCantidad(res.data.cantidad);
        setPrecio(res.data.precio);
        setImagenActual(res.data.imagen); // Guardar la URL de la imagen actual
      } catch (error) {
        console.error("Error al obtener el producto", error);
      }
    };

    getProductById();
  }, [id]);

  // Manejar el cambio de imagen
  const handleImageChange = (e) => {
    setImagen(e.target.files[0]);
  };

  return (
    <div className="container mt-4">
      <h1>Editar Producto</h1>
      <form onSubmit={updateProduct}>
        <div className="mb-3">
          <label className="form-label">Descripción del producto:</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            type="text"
            className="form-control"
            placeholder="Escribe la descripción del producto"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Cantidad:</label>
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="form-control"
            placeholder="Cantidad del producto"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Precio:</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="form-control"
            placeholder="Precio del producto"
            step="0.01"
          />
        </div>

        {/* Mostrar la imagen actual si existe */}
        {imagenActual && (
          <div className="mb-3">
            <label>Imagen Actual:</label>
            <img
              src={`http://localhost:8000/uploads/${imagenActual}`}
              alt="Imagen Actual"
              width="150"
            />
          </div>
        )}

        {/* Campo para seleccionar una nueva imagen */}
        <div className="mb-3">
          <label>Seleccionar nueva imagen:</label>
          <input
            type="file"
            onChange={handleImageChange}
            className="form-control"
          />
        </div>

        <button type="submit" className="btn btn-success">
          Actualizar Producto
        </button>
      </form>
    </div>
  );
};

export default CompEditProduct;
