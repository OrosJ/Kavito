import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const URI = 'http://localhost:8000/users/'; // Ruta para crear y editar usuarios

const CompCreateUser = () => {
  const { id } = useParams(); // Obtener el id desde la URL, si existe
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'vendedor',
  });
  const navigate = useNavigate();

  // Si hay un id, obtenemos los datos del usuario para editar
  useEffect(() => {
    if (id) {
      const getUserData = async () => {
        try {
          const res = await axios.get(`${URI}${id}`);
          setUserData(res.data);
        } catch (error) {
          console.error('Error al obtener los datos del usuario:', error);
          alert('Error al obtener los datos del usuario');
        }
      };
      getUserData();
    }
  }, [id]);

  // Manejo de cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  // Manejo de la acción de submit (creación o edición de usuario)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        // Editar usuario existente (PUT)
        await axios.put(`${URI}${id}`, userData);
        alert('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario (POST)
        await axios.post(`${URI}register`, userData);
        alert('Usuario creado exitosamente');
      }
      navigate('/users'); // Redirigir a la lista de usuarios
    } catch (error) {
      console.error('Hubo un error:', error);
      alert('Error al guardar el usuario');
    }
  };

  return (
    <div className='container'>
      <h3>{id ? 'Editar Usuario' : 'Crear Usuario'}</h3>
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
            required={!id} // Solo es obligatorio si estamos creando un nuevo usuario
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
        <button type="submit" className="btn btn-primary">
          {id ? 'Actualizar Usuario' : 'Crear Usuario'}
        </button>
      </form>
    </div>
  );
};

export default CompCreateUser;
