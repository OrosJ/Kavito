import axios from 'axios';
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
      await axios.post(URI, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      mostrarMensaje('success', 'Exito', 'Producto creado correctamente');
      navigate('/products');
    } catch (error) {
      console.error("Error al crear el producto:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateProduct;