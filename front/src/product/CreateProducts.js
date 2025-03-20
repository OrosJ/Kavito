import api from "../utils/api";
import { useNavigate } from 'react-router-dom';
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


const CreateProduct = () => {
  const navigate = useNavigate();
  
  const handleSubmit = async (formData) => {
    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };
      
      await api.post('/products', formData, config);
      mostrarMensaje('success', 'Éxito', 'Producto creado correctamente');
      navigate('/products');
    } catch (error) {
      console.error("Error al crear el producto:", error);
      mostrarMensaje('error', 'Error', 'No se pudo crear el producto');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateProduct;