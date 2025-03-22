import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Añade esta importación
import axios from "axios";
import Swal from "sweetalert2";

const mostrarMensaje = (tipo, titulo, texto) => {
  Swal.fire({
    icon: tipo, // 'success', 'error', 'warning', 'info'
    title: titulo,
    text: texto,
    timer: tipo === "success" ? 2000 : undefined, // Auto cerrar solo mensajes de éxito
    showConfirmButton: tipo !== "success",
    position: "top-end",
    toast: true,
    timerProgressBar: true,
  });
};

const CarritoComponent = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [observacion, setObservacion] = useState(""); // Nuevo estado para la observación
  const [busqueda, setBusqueda] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const response = await axios.get("http://localhost:8000/products");
        console.log("Productos cargados:", response.data);

        // Asegurarse de que las imágenes tengan la URL completa
        const productosConImagen = response.data.map((producto) => {
          if (producto.image) {
            // Si la imagen ya tiene URL completa, no modificarla
            if (!producto.image.startsWith("http")) {
              producto.image = `http://localhost:8000/uploads/${producto.image}`;
            }
          }
          return producto;
        });

        setProductos(productosConImagen);
        setProductosFiltrados(productosConImagen);
      } catch (error) {
        console.error("Error al obtener los productos:", error);
      }
    };

    obtenerProductos();
  }, []);

  // Función de búsqueda
  const filtrarProductos = (texto) => {
    setBusqueda(texto);
    const filtrados = productos.filter((producto) =>
      producto.descripcion.toLowerCase().includes(texto.toLowerCase())
    );
    setProductosFiltrados(filtrados);
  };

  const agregarProducto = (producto) => {
    const existeEnCarrito = carrito.find((item) => item.id === producto.id);

    if (existeEnCarrito) {
      mostrarMensaje("warning", "¡Cuidado!", "El producto ya esta en la lista");
      return;
    }

    setCarrito([
      ...carrito,
      {
        ...producto,
        cantidad: 1,
        subtotal: parseFloat(producto.precio),
      },
    ]);
    setMensaje("");
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    const producto = productos.find((item) => item.id === id);
    if (!producto) return;

    if (nuevaCantidad > producto.cantidad) {
      setMensaje(`No puedes agregar más de ${producto.cantidad} unidades.`);
      return;
    }

    const nuevoCarrito = carrito.map((item) =>
      item.id === id
        ? {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: nuevaCantidad * producto.precio,
          }
        : item
    );

    setCarrito(nuevoCarrito);
    setMensaje("");
  };

  const eliminarProducto = (id) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  const calcularTotal = () =>
    carrito.reduce((total, item) => total + item.subtotal, 0);

  const ConfirmarSalida = async () => {
    if (!observacion.trim()) {
      mostrarMensaje(
        "warning",
        "Atención",
        "Por favor, ingrese una observación para la salida."
      );
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      mostrarMensaje(
        "error",
        "No autenticado",
        "Por favor, inicia sesión para continuar."
      );
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/invouts",
        {
          productos: carrito.map(({ id, cantidad }) => ({
            product_id: id,
            cantidad,
          })),
          obs: observacion, // Usar la observación ingresada por el usuario
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      mostrarMensaje("success", "¡Éxito!", "Salida registrada correctamente");
      setCarrito([]);
      setObservacion(""); // Limpiar la observación
      setMensaje("Salida registrada exitosamente.");
      navigate("/invouts");
    } catch (error) {
      Swal.close();

      if (error.response) {
        switch (error.response.status) {
          case 403:
            mostrarMensaje(
              "error",
              "Sesión inválida",
              "Por favor, inicia sesión nuevamente."
            );
            localStorage.removeItem("authToken");
            navigate("/login");
            break;
          case 401:
            mostrarMensaje(
              "error",
              "No autorizado",
              "No tienes permisos para realizar esta acción."
            );
            navigate("/login");
            break;
          default:
            mostrarMensaje(
              "error",
              "Error",
              error.response.data.message || "Error al registrar la salida."
            );
        }
      } else {
        mostrarMensaje(
          "error",
          "Error de conexión",
          "No se pudo conectar con el servidor."
        );
      }
    }
  };

  return (
    <div className="container mt-4">
      <h1>Nueva Salida</h1>
      {mensaje && <div className="alert alert-warning">{mensaje}</div>}

      <div className="row">
        {/* Lista de productos */}
        <div className="col-md-6">
          <h3>Productos Disponibles</h3>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => filtrarProductos(e.target.value)}
            />
          </div>

          <ul className="list-group">
            {productosFiltrados.map((producto) => (
              <li
                key={producto.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div
                  className="d-flex align-items-center"
                  style={{ gap: "1rem" }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: "#e0e0e0",
                      borderRadius: "4px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#666",
                      fontWeight: "bold",
                      fontSize: "16px",
                      border: "1px solid #ccc",
                      overflow: "hidden",
                    }}
                  >
                    {producto.image ? (
                      <img
                        src={producto.image}
                        alt={producto.descripcion}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          console.log("Error cargando imagen:", producto.image);
                          e.target.style.display = "none";
                          e.target.parentElement.innerText =
                            producto.descripcion.substring(0, 2).toUpperCase();
                        }}
                      />
                    ) : (
                      producto.descripcion.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <strong>{producto.descripcion}</strong> <br />
                    <small>Stock: {producto.cantidad}</small>
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => agregarProducto(producto)}
                >
                  Agregar
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Carrito */}
        <div className="col-md-6">
          <h3>Salida Actual</h3>
          {carrito.length === 0 ? (
            <p>No hay productos en el carrito.</p>
          ) : (
            <>
              {/* Campo de observación */}
              <div className="mb-3">
                <label htmlFor="observacion" className="form-label">
                  Descripción de la salida:
                </label>
                <textarea
                  id="observacion"
                  className="form-control"
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Ingrese una descripción para esta salida"
                  rows="3"
                  required
                />
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item) => (
                    <tr key={item.id}>
                      <td>{item.descripcion}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max={
                            productos.find((p) => p.id === item.id)?.cantidad
                          }
                          value={item.cantidad}
                          onChange={(e) =>
                            actualizarCantidad(
                              item.id,
                              parseInt(e.target.value, 10) || 1
                            )
                          }
                          className="form-control form-control-sm"
                        />
                      </td>
                      <td>Bs.{item.subtotal.toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => eliminarProducto(item.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2">Total</td>
                    <td>Bs.{calcularTotal().toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-success"
                        onClick={ConfirmarSalida}
                        disabled={carrito.length === 0 || !observacion.trim()}
                      >
                        Confirmar Salida
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarritoComponent;
