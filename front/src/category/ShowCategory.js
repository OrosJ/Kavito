import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const URI = 'http://localhost:8000/categories/'; // RUTA

const CompShowCategories = () => {
  const [categories, setCategories] = useState([]);

  // Cargar todos los datos cuando el componente se monta
  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    const res = await axios.get(URI);
    setCategories(res.data);  // Almacena los datos en el estado
  };

  const deleteCategory = async (id) => {
    await axios.delete(`${URI}${id}`);
    getCategories(); // Vuelve a cargar la lista después de eliminar
  };

  return (
    <div className='container'>
      <div className='row'>
        <div className='col'>
          <Link to="/create-category" className='btn btn-primary mt-2 mb-2'>
            <i className="fa-regular fa-square-plus"></i> NUEVA CATEGORIA
          </Link>
          <table className="table table-hover">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Categoria</th>
                <th scope="col">Creacion</th>
                <th scope="col">Ultima Actualizacion</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.categoryname}</td>
                  <td>{category.createdAt}</td>
                  <td>{category.updatedAt}</td>
                  <td>
                    <button onClick={() => deleteCategory(category.id)} className='btn btn-danger'>
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

export default CompShowCategories;
