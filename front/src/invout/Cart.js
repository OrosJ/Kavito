//Cart.js:
import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const CarritoComponent = () => {
  const [productos, setProductos] = useState([]); // Lista de productos disponibles
  const [carrito, setCarrito] = useState([]); // Productos en el carrito
  const [mensaje, setMensaje] = useState(""); // Mensaje de error o notificación

  // Cargar productos desde el backend
  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const response = await axios.get("http://localhost:8000/products");
        setProductos(response.data);
      } catch (error) {
        console.error("Error al obtener los productos:", error);
      }
    };

    obtenerProductos();
  }, []);

  // Añadir un producto al carrito
  const agregarProducto = (producto) => {
    const existeEnCarrito = carrito.find((item) => item.id === producto.id);

    if (existeEnCarrito) {
      setMensaje("El producto ya está en el carrito.");
      return;
    }

    setCarrito([
      ...carrito,
      {
        ...producto,
        cantidad: 1,
        subtotal: parseFloat(producto.precio), // Inicialmente, el subtotal es igual al precio
      },
    ]);
    setMensaje(""); // Limpiar mensaje
  };

  // Actualizar la cantidad de un producto en el carrito
  const actualizarCantidad = (id, nuevaCantidad) => {
    const producto = productos.find((item) => item.id === id);
    if (!producto) return;

    // Validar que la cantidad no supere el stock
    if (nuevaCantidad > producto.cantidad) {
      setMensaje(`No puedes agregar más de ${producto.cantidad} unidades.`);
      return;
    }

    // Actualizar el carrito
    const nuevoCarrito = carrito.map((item) =>
      item.id === id
        ? {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: nuevaCantidad * producto.precio, // Recalcular el subtotal
          }
        : item
    );

    setCarrito(nuevoCarrito);
    setMensaje(""); // Limpiar mensaje
  };

  // Eliminar un producto del carrito
  const eliminarProducto = (id) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  // Calcular el total general
  const calcularTotal = () =>
    carrito.reduce((total, item) => total + item.subtotal, 0);

   // Manejar la confirmación de salida
  const ConfirmarSalida = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setMensaje("No estás autenticado. Por favor, inicia sesión.");
      return;
    }
    /* const decodedToken = jwtDecode(token); // Decodificar el token para obtener el user_id
    const userId = decodedToken.user_id; */
    try {
      const response = await axios.post(
        "http://localhost:8000/invouts",
        {
          productos: carrito.map(({ id, cantidad }) => ({
            product_id: id,
            cantidad,
          })),
          obs: "Salida generada",
          /* user_id: userId, */
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Incluir el token en los encabezados
          },
        }
      );
      console.log("Salida registrada:", response.data);
      setCarrito([]); // Limpiar el carrito
      setMensaje("Salida registrada exitosamente.");
    } catch (error) {
      console.error("Error al registrar la salida:", error);
      setMensaje("Error al registrar la salida.");
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
          <ul className="list-group">
            {productos.map((producto) => (
              <li
                key={producto.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{producto.descripcion}</strong> <br />
                  <small>Stock: {producto.cantidad}</small>
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
                        max={productos.find((p) => p.id === item.id)?.cantidad}
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
                      disabled={carrito.length === 0}
                    >
                      Confirmar Salida
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarritoComponent;
