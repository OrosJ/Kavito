import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    activeProjects: 0,
    pendingDeliveries: 0,
  });
  const [inventoryData, setInventoryData] = useState([]);
  const [dateRange, setDateRange] = useState("month");
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función centralizada para obtener headers con token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No se encontró token de autenticación");
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const config = getAuthHeaders();

      const [statsRes, deliveriesRes] = await Promise.all([
        axios.get("http://localhost:8000/stats/dashboard", config),
        axios.get("http://localhost:8000/stats/upcoming-deliveries", config),
      ]);

      setStats(statsRes.data);
      setUpcomingDeliveries(deliveriesRes.data);

      // Fetch initial inventory movements
      await fetchInventoryMovements(dateRange);

      setLoading(false);
    } catch (err) {
      console.error("Error en fetchDashboardData:", err);
      if (err.response?.status === 403) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      } else {
        setError(
          err.response?.data?.msg || "Error al cargar los datos del dashboard"
        );
      }
      setLoading(false);
    }
  };

  const fetchInventoryMovements = async (range) => {
    try {
      const config = getAuthHeaders();
      const response = await axios.get(
        `http://localhost:8000/stats/inventory-movements?range=${range}`,
        config
      );
      setInventoryData(response.data);
    } catch (error) {
      console.error("Error en fetchInventoryMovements:", error);
      if (error.response?.status === 403) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      }
    }
  };

  // Función para navegar a la vista de productos con stock bajo
  const navigateToLowStockProducts = () => {
    // Guardamos la preferencia en localStorage para que persista
    localStorage.setItem("showLowStockOnly", "true");
    navigate("/products");
  };

  // Efecto inicial para cargar datos
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Efecto para cuando cambia el rango de fechas
  useEffect(() => {
    if (!loading) {
      fetchInventoryMovements(dateRange);
    }
  }, [dateRange, loading]);

  if (loading) return <div className="loading-spinner">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Panel de Control</h1>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Productos</h3>
            <div className="stat-value">{stats.totalProducts}</div>
          </div>
        </div>

        <div
          className="stat-card warning"
          onClick={navigateToLowStockProducts}
          style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Stock Bajo</h3>
            <div className="stat-value">{stats.lowStock}</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <h3>Proyectos Activos</h3>
            <div className="stat-value">{stats.activeProjects}</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>Entregas Pendientes</h3>
            <div className="stat-value">{stats.pendingDeliveries}</div>
          </div>
        </div>
      </div>

      {/* Gráfico de movimientos */}
      <div className="chart-container">
        <div className="chart-header">
          <h2 className="section-title">Movimientos de Inventario</h2>
          <div className="range-selector">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="range-select"
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
              <option value="year">Último Año</option>
            </select>
          </div>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={inventoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="salidas"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Tabla de entregas */}
      <div className="deliveries-container">
        <h2 className="section-title">Próximas Entregas</h2>
        <div className="table-wrapper">
          <table className="deliveries-table">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Fecha Entrega</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {upcomingDeliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td>{delivery.nombre}</td>
                  <td>
                    {new Date(delivery.fecha_entrega).toLocaleDateString()}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${delivery.estado.toLowerCase()}`}
                    >
                      {delivery.estado}
                    </span>
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

export default HomePage;
