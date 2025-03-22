import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from "sweetalert2";

const URI = 'http://localhost:8000/categories/';

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

const EditCategory = () => {
  const { id } = useParams();
  const [categoryData, setCategoryData] = useState({
    categoryname: '',
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar los datos de la categoría cuando el componente se monta
  useEffect(() => {
    const getCategoryData = async () => {
      try {
        const res = await axios.get(`${URI}${id}`);
        setCategoryData(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los datos de la categoría:', error);
        mostrarMensaje('error', 'Error', 'Error al cargar los datos de la categoría');
        navigate('/categories');
      }
    };
    
    getCategoryData();
  }, [id, navigate]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryData({
      ...categoryData,
      [name]: value,
    });
  };

  // Manejar la acción de submit (edición)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.put(`${URI}${id}`, categoryData);
      mostrarMensaje('success', 'Éxito', 'Categoría actualizada correctamente');
      navigate('/categories');
    } catch (error) {
      console.error('Error al actualizar la categoría:', error);
      mostrarMensaje('error', 'Error', 'Error al actualizar la categoría');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Cargando...</div>;
  }

  return (
    <div className='container'>
      <div className='row'>
        <div className='col'>
          <h3>Editar Categoría</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="categoryname" className="form-label">Nombre de la Categoría</label>
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
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar Categoría'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => navigate('/categories')}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCategory;