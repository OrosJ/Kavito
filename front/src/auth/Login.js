import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/Login.css";

const mostrarMensaje = (tipo, titulo, texto) => {
  Swal.fire({
    icon: tipo,
    title: titulo,
    text: texto,
    position: "top-end",
    toast: true,
    timer: tipo === "success" ? 2000 : undefined,
    timerProgressBar: true,
    showConfirmButton: tipo !== "success",
  });
};

// Función para decodificar el token JWT y extraer su información
const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error("Error decodificando token:", error);
    return null;
  }
};

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      Swal.fire({
        title: "Iniciando sesión...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post("http://localhost:8000/auth/login", {
        username,
        password,
      });

      const { token } = response.data;

      if (!token) {
        throw new Error("No se recibió token en la respuesta");
      }

      // Decodificar el token para obtener información del usuario
      const decodedToken = decodeToken(token);

      if (!decodedToken) {
        throw new Error("Error al procesar la respuesta del servidor");
      }

      // Guardar el token en el localStorage
      localStorage.setItem("authToken", token);

      // Actualizar el estado de autenticación en App.js
      setIsAuthenticated(true);

      Swal.close(); // Cerrar loading
      mostrarMensaje(
        "success",
        "¡Bienvenido!",
        `Sesión iniciada como ${decodedToken.username || "usuario"}`
      );

      // Redirigir a la página de inicio
      navigate("/");
    } catch (error) {
      Swal.close();
      console.error("Error de login:", error);
      setError(
        error.response?.data?.msg ||
          "Credenciales incorrectas. Por favor, verifica tus datos."
      );
      mostrarMensaje(
        "error",
        "Error",
        "Credenciales incorrectas. Por favor, verifica tus datos."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h3 className="text-center mb-4">Iniciar sesión</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Usuario
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
          {loading ? "Procesando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
