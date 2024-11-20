import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirigir después de crear un usuario

const URI = 'http://localhost:8000/users/register'; // Ruta para registrar usuarios

const CompCreateUser = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'vendedor', // Valor por defecto para el rol
  });

  const navigate = useNavigate(); // Usado para redirigir después de crear un usuario

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
      const res = await axios.post(URI, userData);
      alert('Usuario creado exitosamente');
      navigate('/users');
    } catch (error) {
      console.error('Hubo un error al crear el usuario:', error);
      alert('Error al crear el usuario');
    }
  };

  return (
    <div className='container'>
      <div className='row'>
        <div className='col'>
          <h3>Crear Usuario</h3>
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
                required
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
            <button type="submit" className="btn btn-primary">Crear Usuario</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompCreateUser;
