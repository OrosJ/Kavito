import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirigir después de crear 
import Swal from "sweetalert2";

const URI = 'http://localhost:8000/categories/register'; // Ruta para registrar 

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
      mostrarMensaje('success', 'Exito', 'Categoria creada correctamente');
      navigate('/categories');
    } catch (error) {
      mostrarMensaje('error', 'Error', 'Error al crear la categoria');
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
