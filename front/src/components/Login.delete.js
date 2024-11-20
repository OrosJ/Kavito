import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Enviar solicitud POST al backend
      const res = await axios.post('http://localhost:8000/auth/login', { username, password });

      // Al recibir la respuesta, guardar el token en localStorage
      localStorage.setItem('token', res.data.token);

      // Redirigir al usuario a la página de productos o inicio
      navigate('/products');
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.msg);
      } else {
        setErrorMessage('Error de servidor');
      }
    }
  };

  return (
    <div className="container">
      <h2>Iniciar sesión</h2>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Usuario</label>
          <input
            type="text"
            id="username"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Iniciar sesión</button>
      </form>
    </div>
  );
};

export default Login;
