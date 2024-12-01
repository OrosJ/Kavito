import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from './ProductForm';
import Swal from "sweetalert2";


const URI = 'http://localhost:8000/products/';

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


const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${URI}${id}`);
        setInitialData(res.data);
      } catch (error) {
        setError('Error al cargar el producto');
        console.error("Error al obtener el producto:", error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      await axios.put(`${URI}${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      mostrarMensaje('success', 'Exito', 'Producto editado correctamente');
      navigate('/products');
    } catch (error) {
      setError('Error al actualizar el producto');
      mostrarMensaje('error', 'Error', 'No se pudo editar el producto');
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {initialData ? (
        <ProductForm 
          initialData={initialData}
          onSubmit={handleSubmit}
          isEditing={true}
        />
      ) : (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      )}
    </div>
  );
};

export default EditProduct;