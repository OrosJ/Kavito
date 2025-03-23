import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import Swal from "sweetalert2";
import {
  getTodayDate,
  isDateBefore,
  isDateAfter,
  /* isDateEqual, */
} from "../utils/dateUtils";

const CompCreateProject = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_entrega: "",
    client_id: "",
    direccion: "",
    prioridad: "MEDIA",
  });

  const [productos, setProductos] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [costoTotal, setCostoTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Usar Date directamente para asegurarnos de obtener la fecha actual local
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const día = String(hoy.getDate()).padStart(2, "0");
    const fechaHoy = `${año}-${mes}-${día}`;

    setFormData((prev) => ({
      ...prev,
      fecha_inicio: fechaHoy,
    }));

    getProducts();
    getClients();
  }, []);

  // calcular costo total basado en los productos seleccionados
  useEffect(() => {
    let costo = 0;
    selectedProducts.forEach((prod) => {
      const producto = productos.find(
        (p) => p.id === parseInt(prod.product_id)
      );
      if (producto && prod.cantidad_requerida) {
        costo +=
          parseFloat(producto.precio) * parseInt(prod.cantidad_requerida);
      }
    });
    setCostoTotal(costo);
  }, [selectedProducts, productos]);

  const getProducts = async () => {
    try {
      /* const token = localStorage.getItem("authToken"); */
      const response = await api.get("/products");
      setProductos(response.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      setError("Error al cargar productos");
    }
  };

  const getClients = async () => {
    try {
      const response = await api.get("/clients");
      setClients(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      setError("Error al cargar los clientes");
      setLoading(false);
    }
  };

  const validateDates = (fecha_inicio, fecha_entrega) => {
    const today = getTodayDate();

    // Verificar que la fecha de inicio no sea anterior a hoy
    if (isDateBefore(fecha_inicio, today)) {
      throw new Error("La fecha de inicio no puede ser anterior a hoy");
    }

    // Verificar que la fecha de entrega sea posterior a la fecha de inicio
    if (!isDateAfter(fecha_entrega, fecha_inicio)) {
      throw new Error(
        "La fecha de entrega debe ser posterior a la fecha de inicio"
      );
    }
  };

  const validateProducts = () => {
    if (selectedProducts.length === 0) {
      throw new Error("Debe seleccionar al menos un producto");
    }

    selectedProducts.forEach((prod) => {
      if (!prod.cantidad_requerida || prod.cantidad_requerida <= 0) {
        throw new Error(
          `La cantidad debe ser mayor a 0 para todos los productos`
        );
      }

      const product = productos.find((p) => p.id === parseInt(prod.product_id));
      if (!product) {
        throw new Error(`Producto no encontrado`);
      }

      const disponible = product.cantidad - (product.cantidad_reservada || 0);
      if (prod.reservar && prod.cantidad_requerida > disponible) {
        throw new Error(
          `Stock insuficiente para ${product.descripcion}. Disponible: ${disponible}`
        );
      }
    });
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
        cantidad_requerida: 1,
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
    newProducts[index][field] =
      field === "product_id"
        ? value
        : field === "cantidad_requerida"
        ? Math.max(1, parseInt(value) || 0)
        : value;
    setSelectedProducts(newProducts);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      // Validaciones
      validateDates(formData.fecha_inicio, formData.fecha_entrega);
      validateProducts();

      // Mostrar resumen antes de crear
      setShowSummary(true);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: error.message,
      });
    }
  };

  const store = async () => {
    try {
      setLoading(true);

      /* const token = localStorage.getItem("authToken"); */
      /*       if (!token) {
        throw new Error("No hay token de autenticación");
      } */

      const response = await api.post(
        "/projects",
        {
          ...formData,
          productos: selectedProducts,
        }
        /*         {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        } */
      );

      Swal.fire({
        icon: "success",
        title: "Proyecto creado",
        text: "El proyecto se ha creado exitosamente",
      }).then(() => {
        navigate("/projects");
      });
    } catch (error) {
      console.error("Error al crear el proyecto:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al crear el proyecto",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProductStock = (productId) => {
    const product = productos.find((p) => p.id === parseInt(productId));
    if (!product) return null;

    const disponible = product.cantidad - (product.cantidad_reservada || 0);
    return {
      total: product.cantidad,
      disponible,
      reservado: product.cantidad_reservada || 0,
    };
  };

  // Calcular el precio unitario del producto
  const getProductPrice = (productId) => {
    const product = productos.find((p) => p.id === parseInt(productId));
    return product ? parseFloat(product.precio) : 0;
  };

  // Obtener el subtotal de un producto seleccionado
  const getProductSubtotal = (index) => {
    const prod = selectedProducts[index];
    const price = getProductPrice(prod.product_id);
    const quantity = parseInt(prod.cantidad_requerida) || 0;
    return price * quantity;
  };

  // Formatear número como moneda
  const formatCurrency = (value) => {
    return `Bs. ${parseFloat(value).toFixed(2)}`;
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="container">
      <h3>NUEVO PROYECTO</h3>
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
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
                min={formData.fecha_inicio}
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
            <Alert severity="warning">No hay clientes disponibles</Alert>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Dirección de entrega</label>
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
              <label className="form-label">Costo del Proyecto</label>
              <input
                value={formatCurrency(costoTotal)}
                type="text"
                className="form-control"
                readOnly
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
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h4>Productos Requeridos</h4>
            <Button
              variant="contained"
              color="secondary"
              onClick={addProduct}
              disabled={loading}
            >
              Agregar Producto
            </Button>
          </div>

          {selectedProducts.map((product, index) => (
            <div key={index} className="card mb-3">
              <div className="card-body">
                <div className="row align-items-center">
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
                    <div className="input-group">
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
                        min="1"
                      />
                      {product.product_id && (
                        <Tooltip title="Ver stock disponible">
                          <IconButton
                            size="small"
                            onClick={() => {
                              const stock = getProductStock(product.product_id);
                              const prod = productos.find(
                                (p) => p.id === parseInt(product.product_id)
                              );
                              Swal.fire({
                                title: `Stock de ${prod.descripcion}`,
                                html: `
                                Total: ${stock.total}<br>
                                Disponible: ${stock.disponible}<br>
                                Reservado: ${stock.reservado}
                              `,
                                icon: "info",
                              });
                            }}
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  </div>

                  {/*precio unitario y subtotal */}
                  <div className="col-md-2">
                    <div className="form-group">
                      <label className="small d-block">Precio Unitario</label>
                      <span className="form-control-plaintext">
                        {product.product_id
                          ? formatCurrency(getProductPrice(product.product_id))
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-2">
                    <div className="form-group">
                      <label className="small d-block">Subtotal</label>
                      <span className="form-control-plaintext">
                        {product.product_id
                          ? formatCurrency(getProductSubtotal(index))
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-2">
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
                      min={formData.fecha_inicio}
                      max={formData.fecha_entrega}
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

                    {product.product_id && product.reservar && (
                      <div className="mt-1">
                        {getProductStock(product.product_id)?.disponible <
                        product.cantidad_requerida ? (
                          <Chip
                            label="Stock insuficiente"
                            color="error"
                            size="small"
                          />
                        ) : (
                          <Chip
                            label="Stock disponible"
                            color="success"
                            size="small"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="col-md-1">
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => removeProduct(index)}
                      size="small"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Stack direction="row" spacing={2} className="mt-3">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Procesando..." : "Crear Proyecto"}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/projects")}>
            Cancelar
          </Button>
        </Stack>
      </form>

      {/* Diálogo de confirmación */}
      <Dialog open={showSummary} onClose={() => setShowSummary(false)}>
        <DialogTitle>Confirmar Creación de Proyecto</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            {formData.nombre}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Cliente:{" "}
            {
              clients.find((c) => c.id === parseInt(formData.client_id))
                ?.clientname
            }
          </Typography>
          <Typography variant="body2" gutterBottom>
            Fechas: {formData.fecha_inicio} - {formData.fecha_entrega}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Costo Total: {formatCurrency(costoTotal)}
          </Typography>

          <Typography variant="subtitle1" className="mt-3" gutterBottom>
            Productos seleccionados:
          </Typography>

          {selectedProducts.map((product, index) => {
            const prod = productos.find(
              (p) => p.id === parseInt(product.product_id)
            );
            const stock = getProductStock(product.product_id);
            return (
              <Box key={index} sx={{ mb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">
                    {prod?.descripcion} - {product.cantidad_requerida} unidades
                  </Typography>
                  {product.reservar && (
                    <Chip
                      size="small"
                      label={
                        stock?.disponible >= product.cantidad_requerida
                          ? "Se reservará"
                          : "Stock insuficiente"
                      }
                      color={
                        stock?.disponible >= product.cantidad_requerida
                          ? "success"
                          : "error"
                      }
                    />
                  )}
                </Stack>
              </Box>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSummary(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setShowSummary(false);
              store();
            }}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Procesando..." : "Confirmar y Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default CompCreateProject;
