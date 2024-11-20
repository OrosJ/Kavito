import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const URI = 'http://localhost:8000/users/'; // Aquí usamos la ruta de usuarios

const CompShowUsers = () => {
  const [users, setUsers] = useState([]);

  // Cargar todos los usuarios cuando el componente se monta
  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const res = await axios.get(URI);
    setUsers(res.data);  // Almacena los datos de los usuarios en el estado
  };

  const deleteUser = async (id) => {
    await axios.delete(`${URI}${id}`);
    getUsers(); // Vuelve a cargar la lista de usuarios después de eliminar
  };

  return (
    <div className='container'>
      <div className='row'>
        <div className='col'>
          <Link to="/create-user" className='btn btn-primary mt-2 mb-2'>
            <i className="fa-regular fa-square-plus"></i> NUEVO USUARIO
          </Link>
          <table className="table table-hover">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Nombre</th>
                <th scope="col">Correo</th>
                <th scope="col">Rol</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button onClick={() => deleteUser(user.id)} className='btn btn-danger'>
                      <i className="fa-regular fa-trash-can"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompShowUsers;
