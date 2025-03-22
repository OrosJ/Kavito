import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../utils/api";

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

const URI = "http://localhost:8000/users/"; // Ruta para crear y editar usuarios

const CompCreateUser = () => {
  const { id } = useParams(); // Obtener el id desde la URL, si existe
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    role: "vendedor",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Si hay un id, obtenemos los datos del usuario para editar
  useEffect(() => {
    if (id) {
      getUserData();
    }
  }, [id]);

  const getUserData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/${id}`);
      const { password, ...restUserData } = res.data;
      setUserData(restUserData);
      setError("");
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      if (error.response && error.response.status === 403) {
        mostrarMensaje(
          "error",
          "Acceso denegado",
          "No tienes permisos para editar usuarios"
        );
        navigate("/");
      } else {
        setError("Error al obtener los datos del usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejo de cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  // Validar formato de email
  const validateEmail = (email) => {
    // verifica que el email tenga formato válido y termine en .com, .org, .net
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Manejo de la acción de submit (creación o edición de usuario)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validar el formato del email
    if (!validateEmail(userData.email)) {
      mostrarMensaje(
        "error",
        "Email inválido",
        "Por favor ingrese un email con formato válido"
      );
      setLoading(false);
      return;
    }

    try {
      if (id) {
        // Editar usuario existente (PUT)
        await api.put(`${URI}${id}`, userData);
        mostrarMensaje(
          "success",
          "¡Editado!",
          "Datos de usuario actualizados correctamente."
        );
      } else {
        // Crear nuevo usuario (POST)
        await api.post(`${URI}register`, userData);
        mostrarMensaje("success", "¡Creado!", "Usuario creado correctamente.");
      }
      navigate("/users"); // Redirigir a la lista de usuarios
    } catch (error) {
      console.error("Hubo un error:", error);
      if (error.response && error.response.status === 403) {
        mostrarMensaje(
          "error",
          "Acceso denegado",
          "No tienes permisos para esta acción"
        );
        navigate("/");
      } else {
        mostrarMensaje(
          "error",
          "Error",
          error.response?.data?.message || "Error al guardar el usuario"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h3>{id ? "Editar Usuario" : "Crear Usuario"}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Nombre de Usuario
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={userData.username}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Correo Electrónico
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          {id && " (Dejar en blanco para mantener la actual)"}
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={userData.password}
            onChange={handleInputChange}
            required={!id} // Solo es obligatorio si estamos creando un nuevo usuario
            disabled={loading}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="role" className="form-label">
            Rol
          </label>
          <select
            className="form-control"
            id="role"
            name="role"
            value={userData.role}
            onChange={handleInputChange}
            required
            disabled={loading}
          >
            <option value="vendedor">Vendedor</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}> 
            {loading ? 'Procesando...' : (id ? 'Actualizar Usuario' : 'Crear Usuario')}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate('/users')}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompCreateUser;
