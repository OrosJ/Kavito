import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CompCreateProject = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_entrega: "",
    client_id: "",
    direccion: "",
    presupuesto: "",
    prioridad: "MEDIA",
    client_id: "",
  });

  const [productos, setProductos] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getProducts();
    getClients();
  }, []);

  const getProducts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:8000/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProductos(response.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const getClients = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:8000/clients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClients(response.data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      setError("Error al cargar los clientes");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addProduct = () => {
    setSelectedProducts([
      ...selectedProducts,
      {
        product_id: "",
        cantidad_requerida: "",
        fecha_requerida: "",
        reservar: false,
      },
    ]);
  };

  const removeProduct = (index) => {
    const newProducts = [...selectedProducts];
    newProducts.splice(index, 1);
    setSelectedProducts(newProducts);
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...selectedProducts];
    newProducts[index][field] = value;
    setSelectedProducts(newProducts);
  };

  const store = async (e) => {
    e.preventDefault();
    try {
      if (
        !formData.nombre ||
        !formData.fecha_inicio ||
        !formData.fecha_entrega ||
        !formData.client_id
      ) {
        setError("Por favor complete todos los campos requeridos");
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await axios.post(
        "http://localhost:8000/projects",
        {
          ...formData,
          productos: selectedProducts,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Respuesta:", response.data);  // Log de la respuesta
      navigate("/projects");
    } catch (error) {
      console.error("Error al crear el proyecto:", error);
      setError(error.response?.data?.message || "Error al crear el proyecto");
    }
  };

  return (
    <div className="container">
      <h3>NUEVO PROYECTO</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={store}>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            value={formData.nombre}
            onChange={handleChange}
            type="text"
            name="nombre"
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <textarea
            value={formData.descripcion}
            onChange={handleChange}
            name="descripcion"
            className="form-control"
          />
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Fecha Inicio</label>
              <input
                value={formData.fecha_inicio}
                onChange={handleChange}
                type="date"
                name="fecha_inicio"
                className="form-control"
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Fecha Entrega</label>
              <input
                value={formData.fecha_entrega}
                onChange={handleChange}
                type="date"
                name="fecha_entrega"
                className="form-control"
                required
              />
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Cliente</label>
          {clients.length > 0 ? (
            <select
              value={formData.client_id}
              onChange={handleChange}
              name="client_id"
              className="form-control"
              required
            >
              <option value="">Seleccione un cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.clientname}
                </option>
              ))}
            </select>
          ) : (
            <p>No hay clientes disponibles</p>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Dirección</label>
          <input
            value={formData.direccion}
            onChange={handleChange}
            type="text"
            name="direccion"
            className="form-control"
          />
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Presupuesto</label>
              <input
                value={formData.presupuesto}
                onChange={handleChange}
                type="number"
                name="presupuesto"
                className="form-control"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Prioridad</label>
              <select
                value={formData.prioridad}
                onChange={handleChange}
                name="prioridad"
                className="form-control"
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <h4>Productos Requeridos</h4>
          <button
            type="button"
            className="btn btn-secondary mb-3"
            onClick={addProduct}
          >
            Agregar Producto
          </button>

          {selectedProducts.map((product, index) => (
            <div key={index} className="card mb-3">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <select
                      value={product.product_id}
                      onChange={(e) =>
                        handleProductChange(index, "product_id", e.target.value)
                      }
                      className="form-control"
                      required
                    >
                      <option value="">Seleccione un producto</option>
                      {productos.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <input
                      type="number"
                      value={product.cantidad_requerida}
                      onChange={(e) =>
                        handleProductChange(
                          index,
                          "cantidad_requerida",
                          e.target.value
                        )
                      }
                      placeholder="Cantidad"
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <input
                      type="date"
                      value={product.fecha_requerida}
                      onChange={(e) =>
                        handleProductChange(
                          index,
                          "fecha_requerida",
                          e.target.value
                        )
                      }
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-2">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        checked={product.reservar}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "reservar",
                            e.target.checked
                          )
                        }
                        className="form-check-input"
                      />
                      <label className="form-check-label">Reservar</label>
                    </div>
                  </div>
                  <div className="col-md-1">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeProduct(index)}
                    >
                      X
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </form>
    </div>
  );
};

export default CompCreateProject;
