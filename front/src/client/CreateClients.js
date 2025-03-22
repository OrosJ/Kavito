import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from "sweetalert2";

const URI = 'http://localhost:8000/clients/'; // Ruta para crear y editar usuarios

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

const CompCreateClient = () => {
  const { id } = useParams(); // Obtener el id desde la URL, si existe
  const [clientData, setClientData] = useState({
    clientname: ''
  });
  const navigate = useNavigate();

  // Si hay un id, obtenemos los datos del para editar
  useEffect(() => {
    if (id) {
      const getClientData = async () => {
        try {
          const res = await axios.get(`${URI}${id}`);
          setClientData(res.data);
        } catch (error) {
          console.error('Error al obtener los datos:', error);
          alert('Error al obtener los datos');
        }
      };
      getClientData();
    }
  }, [id]);

  // Manejo de cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientData({
      ...clientData,
      [name]: value,
    });
  };

  // Manejo de la acción de submit (creación o edición)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        // Editar (PUT)
        await axios.put(`${URI}edit-client/${id}`, clientData);
        mostrarMensaje('success', 'Exito', 'Cliente editado correctamente');
      } else {
        // Crear nuevo (POST)
        await axios.post(`${URI}register`, clientData);
        mostrarMensaje('success', 'Exito', 'Cliente agregado correctamente');
      }
      navigate('/clients'); // Redirigir a la lista
    } catch (error) {
      console.error('Hubo un error:', error);
      alert('Error al guardar');
    }
  };

  return (
    <div className='container'>
      <h3>{id ? 'Editar Cliente' : 'Crear Cliente'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="clientname" className="form-label">Nombre de Cliente</label>
          <input
            type="text"
            className="form-control"
            id="clientname"
            name="clientname"
            value={clientData.clientname}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">
            {id ? 'Actualizar Cliente' : 'Crear Cliente'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate('/clients')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompCreateClient;
