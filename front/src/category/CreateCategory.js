import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirigir después de crear 

const URI = 'http://localhost:8000/categories/register'; // Ruta para registrar 

const CompCreateCategory = () => {
  const [categoryData, setCategoryData] = useState({
    categoryname: '',
  });

  const navigate = useNavigate(); // Usado para redirigir después de crear 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryData({
      ...categoryData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await axios.post(URI, categoryData);
      alert('Categoria creada exitosamente');
      navigate('/categories');
    } catch (error) {
      console.error('Hubo un error al crear la categoria:', error);
      alert('Error al crear la categoria');
    }
  };

  return (
    <div className='container'>
      <div className='row'>
        <div className='col'>
          <h3>Crear Categoria</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="categoryname" className="form-label">Categoria</label>
              <input
                type="text"
                className="form-control"
                id="categoryname"
                name="categoryname"
                value={categoryData.categoryname}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Crear Categoria</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompCreateCategory;
