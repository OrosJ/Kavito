import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const URI = 'http://localhost:8000/users/'; // Ruta base para la API

const EditUser = () => {
  const { id } = useParams(); // Obtener el ID desde la URL
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'vendedor',
  });
  const navigate = useNavigate();

  // Cargar los datos del usuario al montar el componente
  useEffect(() => {
    const getUser = async () => {
      const res = await axios.get(`${URI}${id}`);
      setUserData(res.data);
    };
    getUser();
  }, [id]); // Vuelve a cargar si el ID cambia

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${URI}${id}`, userData);
      alert('Usuario actualizado exitosamente');
      navigate('/users'); // Redirige a la lista de usuarios después de la actualización
    } catch (error) {
      console.error('Hubo un error al actualizar el usuario:', error);
      alert('Error al actualizar el usuario');
    }
  };

  return (
    <div className="container">
      <h3>Editar Usuario</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Nombre de Usuario</label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={userData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo Electrónico</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={userData.password}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="role" className="form-label">Rol</label>
          <select
            className="form-control"
            id="role"
            name="role"
            value={userData.role}
            onChange={handleInputChange}
            required
          >
            <option value="vendedor">Vendedor</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Actualizar Usuario</button>
      </form>
    </div>
  );
};

export default EditUser;
