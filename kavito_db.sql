-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-02-2025 a las 19:45:32
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `kavito_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `categoryname` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categories`
--

INSERT INTO `categories` (`id`, `categoryname`, `createdAt`, `updatedAt`) VALUES
(1, 'Materiales de Construcción', '2024-11-30 22:21:20', '2024-11-30 22:21:20'),
(2, 'Herramientas Manuales', '2024-11-30 22:21:20', '2024-11-30 22:21:20'),
(3, 'Herramientas Eléctricas', '2024-11-30 22:21:20', '2024-11-30 22:21:20'),
(4, 'Accesorios de Plomería y Electricidad', '2024-11-30 22:21:20', '2024-11-30 22:21:20'),
(5, 'Suministros de Seguridad', '2024-11-30 22:21:20', '2024-11-30 22:21:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `clientname` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clients`
--

INSERT INTO `clients` (`id`, `clientname`, `createdAt`, `updatedAt`) VALUES
(1, 'Cliente General', '2024-11-30 22:22:04', '2024-11-30 22:22:04'),
(3, 'prueba 2', '2025-02-22 03:37:46', '2025-02-22 03:37:46'),
(4, 'prueba sweet alert editar', '2025-02-22 03:58:38', '2025-02-22 03:58:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventory_out_products`
--

CREATE TABLE `inventory_out_products` (
  `id` int(11) NOT NULL,
  `invout_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `subtotal` decimal(10,2) DEFAULT 0.00,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventory_out_products`
--

INSERT INTO `inventory_out_products` (`id`, `invout_id`, `product_id`, `cantidad`, `subtotal`, `createdAt`, `updatedAt`) VALUES
(1, 26, 2, 50, 0.00, '2024-12-01 03:52:23', '2024-12-01 03:52:23'),
(2, 27, 1, 10, 520.00, '2024-12-01 16:30:53', '2024-12-01 16:30:53'),
(3, 28, 7, 10, 150.00, '2024-12-03 16:56:56', '2024-12-03 16:56:56'),
(4, 28, 9, 15, 112.50, '2024-12-03 16:56:56', '2024-12-03 16:56:56'),
(5, 28, 12, 12, 216.00, '2024-12-03 16:56:56', '2024-12-03 16:56:56'),
(6, 29, 12, 1, 18.00, '2024-12-05 16:20:29', '2024-12-05 16:20:29'),
(7, 29, 13, 1, 12.00, '2024-12-05 16:20:29', '2024-12-05 16:20:29'),
(8, 29, 14, 1, 35.00, '2024-12-05 16:20:29', '2024-12-05 16:20:29'),
(9, 29, 15, 1, 28.00, '2024-12-05 16:20:29', '2024-12-05 16:20:29'),
(10, 30, 20, 1, 12.00, '2024-12-05 16:21:27', '2024-12-05 16:21:27'),
(11, 31, 16, 1, 15.00, '2024-12-05 16:22:04', '2024-12-05 16:22:04'),
(12, 31, 17, 1, 8.00, '2024-12-05 16:22:04', '2024-12-05 16:22:04'),
(13, 32, 18, 5, 225.00, '2024-12-05 16:24:25', '2024-12-05 16:24:25'),
(14, 33, 3, 5, 225.00, '2024-12-05 20:22:10', '2024-12-05 20:22:10'),
(15, 34, 17, 3, 24.00, '2024-12-05 20:43:17', '2024-12-05 20:43:17'),
(16, 34, 19, 3, 114.00, '2024-12-05 20:43:17', '2024-12-05 20:43:17'),
(17, 35, 33, 50, 175.00, '2024-12-05 23:33:10', '2024-12-05 23:33:10'),
(18, 36, 40, 20, 90.00, '2024-12-06 00:35:03', '2024-12-06 00:35:03'),
(19, 36, 8, 10, 85.00, '2024-12-06 00:35:03', '2024-12-06 00:35:03'),
(20, 37, 17, 6, 48.00, '2024-12-06 00:46:33', '2024-12-06 00:46:33'),
(21, 37, 14, 4, 140.00, '2024-12-06 00:46:33', '2024-12-06 00:46:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `invouts`
--

CREATE TABLE `invouts` (
  `id` int(11) NOT NULL,
  `codigo` varchar(15) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `obs` varchar(220) NOT NULL,
  `total` decimal(10,2) DEFAULT 0.00,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `invouts`
--

INSERT INTO `invouts` (`id`, `codigo`, `cantidad`, `user_id`, `obs`, `total`, `createdAt`, `updatedAt`) VALUES
(26, NULL, 0, 1, 'Venta ', 75.00, '2024-11-01 03:52:23', '2024-11-01 03:52:23'),
(27, 'S241201001', 0, 1, 'salida de prueba', 520.00, '2024-11-01 16:30:53', '2024-12-01 16:30:53'),
(28, 'S241203001', 0, 7, 'Venta', 478.50, '2024-11-03 16:56:56', '2024-12-03 16:56:56'),
(29, 'S241205001', 0, 7, 'Venta ', 93.00, '2024-11-12 16:20:29', '2024-12-05 16:20:29'),
(30, 'S241205002', 0, 7, 'venta 2', 12.00, '2024-11-17 16:21:27', '2024-12-05 16:21:27'),
(31, 'S241205003', 0, 7, 'salida venta', 23.00, '2024-12-05 16:22:04', '2024-12-05 16:22:04'),
(32, 'S241205004', 0, 7, 'venta', 225.00, '2024-12-05 16:24:25', '2024-12-05 16:24:25'),
(33, 'S241205005', 0, 7, 'salida prueba 3', 225.00, '2024-12-05 20:22:10', '2024-12-05 20:22:10'),
(34, 'S241205006', 0, 7, 'venta prueba', 138.00, '2024-12-05 20:43:17', '2024-12-05 20:43:17'),
(35, 'S241205007', 0, 7, 'Salida por finalización de proyecto: prueba salidas (ID: 21)', 175.00, '2024-12-05 23:33:10', '2024-12-05 23:33:10'),
(36, 'S241205008', 0, 7, 'venta de prueba', 175.00, '2024-12-06 00:35:03', '2024-12-06 00:35:03'),
(37, 'S241205009', 0, 7, 'Salida por finalización de proyecto: presentacion (ID: 23)', 188.00, '2024-12-06 00:46:33', '2024-12-06 00:46:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(80) NOT NULL,
  `categoria` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `image` varchar(255) NOT NULL,
  `createdAt` date NOT NULL,
  `updatedAt` date NOT NULL,
  `cantidad_reservada` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `descripcion`, `categoria`, `cantidad`, `precio`, `image`, `createdAt`, `updatedAt`, `cantidad_reservada`) VALUES
(1, 'Cemento Viacha (Bolsa 50kg.)', 1, 100, 52.00, '1733026863277.png', '2024-11-30', '2024-12-03', 10),
(2, 'Ladrillo 6 Huecos', 1, 950, 1.50, '1733025333790.png', '2024-11-30', '2024-12-01', 0),
(3, 'Arena Fina (bolsa 25kg)', 1, 45, 45.00, '1733025349348.jpg', '2024-11-30', '2024-12-05', 25),
(4, 'Fierro de Construcción 6mm x 12m', 1, 100, 28.50, '1733025364314.jpg', '2024-11-30', '2024-12-02', 15),
(6, 'Cemento Blanco (Bolsa 1kg)', 1, 50, 35.00, '1733026212705.jpg', '2024-11-30', '2024-12-03', 15),
(7, 'Yeso de Construcción (Bolsa 20kg)', 1, 70, 15.00, '1733412427137.png', '2024-11-30', '2024-12-05', 10),
(8, 'Alambre Negro #16 (kg)', 1, 190, 8.50, '1733412506694.jpg', '2024-11-30', '2024-12-06', 0),
(9, 'Clavos 2\" (kg)', 1, 135, 7.50, '1733412551277.jpeg', '2024-11-30', '2024-12-05', 27),
(10, 'Malla de Alambre (m²)', 1, 100, 12.00, '1733412607192.jpeg', '2024-11-30', '2024-12-05', 30),
(11, 'Martillo de Carpintero', 2, 30, 25.00, '1733412663959.jpg', '2024-11-30', '2024-12-06', 0),
(12, 'Alicate Universal', 2, 27, 18.00, '1733413062273.jpg', '2024-11-30', '2024-12-06', 0),
(13, 'Destornillador Phillips Truper', 2, 49, 12.00, '1733413206671.webp', '2024-11-30', '2024-12-06', 0),
(14, 'Serrucho 20\"', 2, 20, 35.00, '1733413292627.jpg', '2024-11-30', '2024-12-06', 0),
(15, 'Nivel de Burbuja 24\"', 2, 29, 28.00, '1733413321048.jpeg', '2024-11-30', '2024-12-05', 0),
(16, 'Flexometro 8m', 2, 44, 15.00, '1733413369166.jpeg', '2024-11-30', '2024-12-05', 0),
(17, 'Espátula 3\"', 2, 30, 8.00, '1733413486390.jpeg', '2024-11-30', '2024-12-06', 0),
(18, 'Llave Ajustable 12\"', 2, 20, 45.00, '1733413556432.jpeg', '2024-11-30', '2024-12-05', 0),
(19, 'Pala Punta Redonda', 2, 27, 38.00, '1733413610101.png', '2024-11-30', '2024-12-05', 0),
(20, 'Cincel de madera', 2, 34, 12.00, '1733413674445.jpeg', '2024-11-30', '2024-12-05', 0),
(21, 'Taladro Percutor Tolsen 750W', 3, 15, 250.00, '1733413788162.jpeg', '2024-11-30', '2024-12-05', 0),
(22, 'Amoladora DeWalt 4½\"', 3, 20, 180.00, '1733413890292.jpeg', '2024-11-30', '2024-12-05', 0),
(23, 'Sierra Circular Truper 7¼\"', 3, 12, 320.00, '1733413956195.jpeg', '2024-11-30', '2024-12-05', 0),
(24, 'Rotomartillo Ingco 800W', 3, 10, 450.00, '1733414012108.jpeg', '2024-11-30', '2024-12-05', 0),
(25, 'Lijadora Orbital', 3, 15, 160.00, '1733414142238.jpeg', '2024-11-30', '2024-12-05', 0),
(26, 'Pistola de Calor', 3, 20, 120.00, '1733414241443.jpeg', '2024-11-30', '2024-12-05', 0),
(27, 'Atornillador Eléctrico BS18Li ', 3, 25, 140.00, '1733414310896.jpeg', '2024-11-30', '2024-12-05', 0),
(28, 'Caladora Eléctrica Skill', 3, 15, 190.00, '1733414360617.jpeg', '2024-11-30', '2024-12-05', 0),
(29, 'Compresora de Aire 25L', 3, 8, 580.00, '', '2024-11-30', '2024-11-30', 0),
(30, 'Soldadora Eléctrica 200A', 3, 10, 450.00, '', '2024-11-30', '2024-11-30', 0),
(31, 'Tubo PVC 4\" Tigre (3m)', 4, 50, 35.00, '1733414615985.jpeg', '2024-11-30', '2024-12-06', 0),
(32, 'Codo PVC 90° 1/2\"', 4, 200, 2.50, '1733414774499.jpeg', '2024-11-30', '2024-12-05', 0),
(33, 'Cable Flexible Domiciliario AWG - CT - Negro (m)', 4, 450, 3.50, '1733415009951.jpeg', '2024-11-30', '2024-12-05', 0),
(34, 'Tomacorriente Doble', 4, 100, 8.00, '1733415061196.jpeg', '2024-11-30', '2024-12-05', 0),
(35, 'Llave de Paso 1/2\"', 4, 60, 18.00, '1733415104039.jpeg', '2024-11-30', '2024-12-05', 3),
(36, 'Interruptor Simple', 4, 100, 7.00, '1733415189362.jpeg', '2024-11-30', '2024-12-05', 0),
(37, 'Unión Universal 1\"', 4, 80, 12.00, '1733415234273.jpeg', '2024-11-30', '2024-12-05', 0),
(38, 'Caja Octogonal PVC', 4, 150, 3.00, '1733415275577.jpeg', '2024-11-30', '2024-12-05', 0),
(39, 'Tubo Corrugado 3/4\" (m)', 4, 200, 2.50, '1733415305502.jpeg', '2024-11-30', '2024-12-05', 0),
(40, 'Cinta Aislante', 4, 100, 4.50, '1733415346688.jpeg', '2024-11-30', '2024-12-06', 3),
(41, 'Casco de Seguridad', 5, 50, 35.00, '1733415378548.jpeg', '2024-11-30', '2024-12-05', 0),
(42, 'Guantes de Cuero (Par)', 5, 100, 15.00, '1733415427153.jpeg', '2024-11-30', '2024-12-05', 0),
(43, 'Lentes de Seguridad', 5, 80, 12.00, '1733415455814.jpeg', '2024-11-30', '2024-12-05', 0),
(44, 'Botas de Seguridad (Par)', 5, 40, 85.00, '', '2024-11-30', '2024-11-30', 0),
(45, 'Chaleco Reflectivo', 5, 60, 25.00, '1733415496937.jpeg', '2024-11-30', '2024-12-05', 0),
(46, 'Máscara para Polvo', 5, 150, 8.00, '1733415547623.jpeg', '2024-11-30', '2024-12-05', 0),
(47, 'Arnés de Seguridad', 5, 20, 120.00, '', '2024-11-30', '2024-11-30', 0),
(48, 'Protector Auditivo', 5, 100, 18.00, '', '2024-11-30', '2024-11-30', 0),
(49, 'Extintor 6kg', 5, 30, 85.00, '', '2024-11-30', '2024-11-30', 0),
(50, 'Botiquín de Primeros Auxilios', 5, 25, 45.00, '', '2024-11-30', '2024-11-30', 0),
(51, 'Prensa C', 2, 2, 15.50, '1733425469505.jpeg', '2024-12-05', '2024-12-05', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_entrega` date NOT NULL,
  `estado` enum('PLANIFICACION','EN_PROGRESO','PAUSADO','COMPLETADO','CANCELADO') DEFAULT 'PLANIFICACION',
  `direccion` varchar(255) DEFAULT NULL,
  `presupuesto` decimal(10,2) DEFAULT NULL,
  `prioridad` enum('BAJA','MEDIA','ALTA') DEFAULT 'MEDIA',
  `client_id` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fecha_completado` datetime DEFAULT NULL,
  `motivo_cancelacion` varchar(255) DEFAULT NULL,
  `notas_cierre` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `projects`
--

INSERT INTO `projects` (`id`, `nombre`, `descripcion`, `fecha_inicio`, `fecha_entrega`, `estado`, `direccion`, `presupuesto`, `prioridad`, `client_id`, `createdAt`, `updatedAt`, `fecha_completado`, `motivo_cancelacion`, `notas_cierre`) VALUES
(12, 'prueba', 'prueba', '2024-12-03', '2024-12-27', 'PLANIFICACION', '', 0.00, 'MEDIA', 1, '2024-12-02 04:13:30', '2024-12-02 04:13:30', NULL, NULL, NULL),
(13, 'prueba 2 edit', 'prueba 2 edit', '2024-12-06', '2024-12-13', 'CANCELADO', '', 6000.00, 'MEDIA', 1, '2024-12-02 04:14:51', '2024-12-05 06:53:13', NULL, NULL, 'cancelar prueba'),
(14, 'Proyecto 1', 'Construccion', '2024-12-04', '2024-12-20', 'EN_PROGRESO', '', 0.00, 'MEDIA', 1, '2024-12-03 18:30:24', '2024-12-05 16:44:40', NULL, NULL, NULL),
(15, 'Prueba 2', 'Construcción ', '2024-12-05', '2024-12-27', 'PLANIFICACION', '', 0.00, 'MEDIA', 1, '2024-12-04 20:59:38', '2024-12-04 20:59:38', NULL, NULL, NULL),
(16, 'prueba estados reservas', 'test', '2024-12-06', '2024-12-13', 'CANCELADO', '', 0.00, 'MEDIA', 1, '2024-12-05 07:13:39', '2024-12-05 07:17:47', NULL, NULL, 'prueba'),
(17, 'prueba 4', 'test', '2024-12-06', '2024-12-12', 'CANCELADO', '', 0.00, 'MEDIA', 1, '2024-12-05 07:18:52', '2024-12-05 07:19:25', NULL, NULL, 'cancelacion'),
(18, 'prueba cancelacion con reservas', 'prueba cancelación con reservas', '2024-12-06', '2024-12-13', 'CANCELADO', '', 0.00, 'MEDIA', 1, '2024-12-05 16:46:46', '2024-12-05 17:05:37', NULL, NULL, NULL),
(19, 'prueba estados', 'test', '2024-12-06', '2024-12-12', 'CANCELADO', '', 0.00, 'MEDIA', 1, '2024-12-05 19:20:43', '2024-12-05 20:42:45', NULL, NULL, NULL),
(20, 'prueba modelo actualizado', '', '2024-12-06', '2024-12-13', 'PLANIFICACION', '', 0.00, 'MEDIA', 1, '2024-12-05 20:42:04', '2024-12-05 20:42:04', NULL, NULL, NULL),
(21, 'prueba salidas', 'prueba', '2024-12-06', '2024-12-12', 'COMPLETADO', '', 0.00, 'MEDIA', 1, '2024-12-05 22:55:25', '2024-12-05 23:33:10', '2024-12-05 23:33:10', NULL, 'Proyecto completado con entrega de productos pendientes'),
(22, 'prueba presentacion', 'prueba', '2024-12-06', '2024-12-12', 'CANCELADO', '', 0.00, 'MEDIA', 1, '2024-12-06 00:39:46', '2024-12-06 00:45:13', NULL, NULL, 'Inicio de prueba'),
(23, 'presentacion', 'presentacion', '2024-12-06', '2024-12-12', 'COMPLETADO', '', 0.00, 'ALTA', 1, '2024-12-06 00:46:20', '2024-12-06 00:46:33', '2024-12-06 00:46:33', NULL, 'Proyecto completado con entrega de productos pendientes');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `project_products`
--

CREATE TABLE `project_products` (
  `id` int(11) NOT NULL,
  `projectId` int(11) DEFAULT NULL,
  `productId` int(11) DEFAULT NULL,
  `cantidad_requerida` int(11) NOT NULL,
  `cantidad_entregada` int(11) DEFAULT 0,
  `estado` enum('PENDIENTE','RESERVADO','EN_PROCESO','ENTREGADO','CANCELADO') DEFAULT 'PENDIENTE',
  `fecha_requerida` date DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `cantidad_reservada` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `project_products`
--

INSERT INTO `project_products` (`id`, `projectId`, `productId`, `cantidad_requerida`, `cantidad_entregada`, `estado`, `fecha_requerida`, `notas`, `createdAt`, `updatedAt`, `cantidad_reservada`) VALUES
(7, 12, 6, 10, 0, 'RESERVADO', NULL, NULL, '2024-12-02 04:13:30', '2024-12-02 04:13:30', 10),
(8, 12, 4, 15, 0, 'RESERVADO', NULL, NULL, '2024-12-02 04:13:30', '2024-12-02 04:13:30', 15),
(9, 12, 3, 20, 0, 'RESERVADO', NULL, NULL, '2024-12-02 04:13:30', '2024-12-02 04:13:30', 20),
(12, 14, 6, 5, 0, 'RESERVADO', NULL, NULL, '2024-12-03 18:30:24', '2024-12-03 18:30:24', 5),
(13, 14, 7, 10, 0, 'RESERVADO', NULL, NULL, '2024-12-03 18:30:24', '2024-12-03 18:30:24', 10),
(14, 14, 1, 10, 0, 'RESERVADO', NULL, NULL, '2024-12-03 18:30:24', '2024-12-03 18:30:24', 10),
(15, 14, 3, 5, 0, 'RESERVADO', NULL, NULL, '2024-12-03 18:30:24', '2024-12-03 18:30:24', 5),
(16, 15, 37, 15, 0, 'PENDIENTE', NULL, NULL, '2024-12-04 20:59:38', '2024-12-04 20:59:38', 0),
(17, 15, 32, 5, 0, 'PENDIENTE', NULL, NULL, '2024-12-04 20:59:38', '2024-12-04 20:59:38', 0),
(18, 15, 39, 10, 0, 'PENDIENTE', NULL, NULL, '2024-12-04 20:59:38', '2024-12-04 20:59:38', 0),
(25, 13, 9, 15, 0, 'RESERVADO', NULL, NULL, '2024-12-05 06:50:33', '2024-12-05 06:53:01', 15),
(26, 13, 10, 15, 0, 'RESERVADO', NULL, NULL, '2024-12-05 06:50:33', '2024-12-05 06:53:05', 15),
(27, 16, 15, 2, 0, 'CANCELADO', NULL, NULL, '2024-12-05 07:13:39', '2024-12-05 07:17:47', 0),
(28, 16, 13, 2, 0, 'CANCELADO', NULL, NULL, '2024-12-05 07:13:39', '2024-12-05 07:17:47', 0),
(29, 17, 11, 2, 0, 'CANCELADO', NULL, NULL, '2024-12-05 07:18:52', '2024-12-05 07:19:25', 0),
(30, 17, 14, 2, 0, 'CANCELADO', NULL, NULL, '2024-12-05 07:18:52', '2024-12-05 07:19:25', 0),
(31, 18, 36, 10, 0, 'CANCELADO', NULL, NULL, '2024-12-05 16:46:46', '2024-12-05 17:05:37', 0),
(32, 18, 40, 20, 0, 'CANCELADO', NULL, NULL, '2024-12-05 16:46:46', '2024-12-05 17:05:37', 0),
(33, 19, 51, 2, 0, 'CANCELADO', NULL, NULL, '2024-12-05 19:20:43', '2024-12-05 20:42:45', 0),
(34, 20, 35, 3, 0, 'RESERVADO', NULL, NULL, '2024-12-05 20:42:04', '2024-12-05 20:42:04', 3),
(35, 20, 40, 3, 0, 'RESERVADO', NULL, NULL, '2024-12-05 20:42:04', '2024-12-05 20:42:04', 3),
(36, 21, 33, 50, 50, 'ENTREGADO', NULL, NULL, '2024-12-05 22:55:26', '2024-12-05 23:33:10', 0),
(40, 22, 11, 5, 0, 'CANCELADO', NULL, NULL, '2024-12-06 00:42:34', '2024-12-06 00:45:13', 0),
(41, 22, 31, 5, 0, 'CANCELADO', NULL, NULL, '2024-12-06 00:42:34', '2024-12-06 00:45:13', 0),
(42, 22, 12, 5, 0, 'CANCELADO', NULL, NULL, '2024-12-06 00:42:34', '2024-12-06 00:45:13', 0),
(43, 23, 17, 6, 6, 'ENTREGADO', NULL, NULL, '2024-12-06 00:46:20', '2024-12-06 00:46:33', 0),
(44, 23, 14, 4, 4, 'ENTREGADO', NULL, NULL, '2024-12-06 00:46:20', '2024-12-06 00:46:33', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `project_product_histories`
--

CREATE TABLE `project_product_histories` (
  `id` int(11) NOT NULL,
  `project_product_id` int(11) NOT NULL,
  `tipo_cambio` enum('RESERVA','ENTREGA','CANCELACION','MODIFICACION') NOT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `estado_anterior` varchar(50) DEFAULT NULL,
  `estado_nuevo` varchar(50) DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `project_product_histories`
--

INSERT INTO `project_product_histories` (`id`, `project_product_id`, `tipo_cambio`, `cantidad`, `estado_anterior`, `estado_nuevo`, `motivo`, `usuario_id`, `createdAt`, `updatedAt`) VALUES
(1, 7, 'RESERVA', 10, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-02 04:13:30', '2024-12-02 04:13:30'),
(2, 8, 'RESERVA', 15, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-02 04:13:30', '2024-12-02 04:13:30'),
(3, 9, 'RESERVA', 20, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-02 04:13:30', '2024-12-02 04:13:30'),
(4, 12, 'RESERVA', 5, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-03 18:30:24', '2024-12-03 18:30:24'),
(5, 13, 'RESERVA', 10, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-03 18:30:24', '2024-12-03 18:30:24'),
(6, 14, 'RESERVA', 10, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-03 18:30:24', '2024-12-03 18:30:24'),
(7, 15, 'RESERVA', 5, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-03 18:30:24', '2024-12-03 18:30:24'),
(22, 25, 'RESERVA', 15, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2024-12-05 06:53:01', '2024-12-05 06:53:01'),
(23, 26, 'RESERVA', 15, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2024-12-05 06:53:05', '2024-12-05 06:53:05'),
(24, 27, 'RESERVA', 2, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-05 07:13:39', '2024-12-05 07:13:39'),
(25, 28, 'RESERVA', 2, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-05 07:13:39', '2024-12-05 07:13:39'),
(26, 27, 'CANCELACION', 0, 'CANCELADO', 'CANCELADO', 'Cancelación del proyecto', NULL, '2024-12-05 07:17:47', '2024-12-05 07:17:47'),
(27, 28, 'CANCELACION', 0, 'CANCELADO', 'CANCELADO', 'Cancelación del proyecto', NULL, '2024-12-05 07:17:47', '2024-12-05 07:17:47'),
(28, 29, 'RESERVA', 2, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-05 07:18:52', '2024-12-05 07:18:52'),
(29, 30, 'RESERVA', 2, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-05 07:18:52', '2024-12-05 07:18:52'),
(30, 29, 'CANCELACION', 0, 'CANCELADO', 'CANCELADO', 'Cancelación del proyecto', NULL, '2024-12-05 07:19:25', '2024-12-05 07:19:25'),
(31, 30, 'CANCELACION', 0, 'CANCELADO', 'CANCELADO', 'Cancelación del proyecto', NULL, '2024-12-05 07:19:25', '2024-12-05 07:19:25'),
(32, 31, 'RESERVA', 10, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-05 16:46:46', '2024-12-05 16:46:46'),
(33, 32, 'RESERVA', 20, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-05 16:46:46', '2024-12-05 16:46:46'),
(34, 31, 'CANCELACION', 0, 'CANCELADO', 'CANCELADO', 'Cancelación del proyecto', NULL, '2024-12-05 17:05:37', '2024-12-05 17:05:37'),
(35, 32, 'CANCELACION', 0, 'CANCELADO', 'CANCELADO', 'Cancelación del proyecto', NULL, '2024-12-05 17:05:37', '2024-12-05 17:05:37'),
(36, 33, 'RESERVA', 2, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-05 19:20:43', '2024-12-05 19:20:43'),
(37, 34, 'RESERVA', 3, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-05 20:42:04', '2024-12-05 20:42:04'),
(38, 35, 'RESERVA', 3, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-05 20:42:04', '2024-12-05 20:42:04'),
(39, 33, 'CANCELACION', 0, 'CANCELADO', 'CANCELADO', 'Cancelación del proyecto', NULL, '2024-12-05 20:42:45', '2024-12-05 20:42:45'),
(40, 36, 'RESERVA', 50, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-05 22:55:26', '2024-12-05 22:55:26'),
(41, 36, 'MODIFICACION', 0, 'RESERVADO', 'PENDIENTE', 'Liberación de reserva', NULL, '2024-12-05 22:55:43', '2024-12-05 22:55:43'),
(42, 36, 'RESERVA', 50, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2024-12-05 23:17:11', '2024-12-05 23:17:11'),
(43, 36, 'MODIFICACION', 0, 'RESERVADO', 'PENDIENTE', 'Liberación de reserva', NULL, '2024-12-05 23:17:28', '2024-12-05 23:17:28'),
(44, 36, 'RESERVA', 50, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2024-12-05 23:19:44', '2024-12-05 23:19:44'),
(45, 36, 'ENTREGA', 50, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2024-12-05 23:33:10', '2024-12-05 23:33:10'),
(50, 40, 'RESERVA', 5, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2024-12-06 00:43:20', '2024-12-06 00:43:20'),
(51, 41, 'RESERVA', 5, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2024-12-06 00:43:23', '2024-12-06 00:43:23'),
(52, 42, 'RESERVA', 5, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2024-12-06 00:43:27', '2024-12-06 00:43:27'),
(53, 40, 'CANCELACION', 0, 'CANCELADO', 'CANCELADO', 'Cancelación del proyecto', NULL, '2024-12-06 00:45:13', '2024-12-06 00:45:13'),
(54, 41, 'CANCELACION', 0, 'CANCELADO', 'CANCELADO', 'Cancelación del proyecto', NULL, '2024-12-06 00:45:13', '2024-12-06 00:45:13'),
(55, 42, 'CANCELACION', 0, 'CANCELADO', 'CANCELADO', 'Cancelación del proyecto', NULL, '2024-12-06 00:45:13', '2024-12-06 00:45:13'),
(56, 43, 'RESERVA', 6, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-06 00:46:20', '2024-12-06 00:46:20'),
(57, 44, 'RESERVA', 4, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2024-12-06 00:46:20', '2024-12-06 00:46:20'),
(58, 43, 'ENTREGA', 6, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2024-12-06 00:46:33', '2024-12-06 00:46:33'),
(59, 44, 'ENTREGA', 4, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2024-12-06 00:46:33', '2024-12-06 00:46:33');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `createdAt`, `updatedAt`) VALUES
(1, 'test', 'test@gmail.com', '$2a$10$bUQ3n9L5hBoT1HI1eWF6yeVGndrT6UJ2AlJbCyCFwzzZzEA/06huy', 'administrador', '2024-11-18 20:00:51', '2024-11-18 20:00:51'),
(7, 'Administrador', 'admin@gmail.com', '$2a$10$vSAgQ4p/Ejc7ArHW8isXxuRw/EHeQZbvkDg5InBIzTSFjYaD.ebC2', 'administrador', '2024-12-03 15:58:07', '2024-12-03 16:01:23'),
(8, 'Empleado 1', 'empleado@gmail.com', '$2a$10$f9EQEErR5RFhLOcn6Cyww.u3n4/TB1Ovj7SNlK5a4nW3k3GvnDiKO', 'vendedor', '2024-12-03 15:58:44', '2024-12-03 15:58:44'),
(9, 'Empleado 2', 'empleado2@gmail.com', '$2a$10$XyPns/GtPde43c9Um/aQeOVm6TLpYYNhGsRV/5C4uiCeudsDKpH3e', 'vendedor', '2024-12-03 15:59:10', '2024-12-03 15:59:10');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `inventory_out_products`
--
ALTER TABLE `inventory_out_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invout_id` (`invout_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indices de la tabla `invouts`
--
ALTER TABLE `invouts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria` (`categoria`);

--
-- Indices de la tabla `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `idx_project_estado` (`estado`),
  ADD KEY `idx_project_fecha_entrega` (`fecha_entrega`);

--
-- Indices de la tabla `project_products`
--
ALTER TABLE `project_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `projectId` (`projectId`),
  ADD KEY `productId` (`productId`),
  ADD KEY `idx_project_products_estado` (`estado`);

--
-- Indices de la tabla `project_product_histories`
--
ALTER TABLE `project_product_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_product_id` (`project_product_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `inventory_out_products`
--
ALTER TABLE `inventory_out_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `invouts`
--
ALTER TABLE `invouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT de la tabla `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `project_products`
--
ALTER TABLE `project_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `project_product_histories`
--
ALTER TABLE `project_product_histories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `inventory_out_products`
--
ALTER TABLE `inventory_out_products`
  ADD CONSTRAINT `inventory_out_products_ibfk_1` FOREIGN KEY (`invout_id`) REFERENCES `invouts` (`id`),
  ADD CONSTRAINT `inventory_out_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Filtros para la tabla `invouts`
--
ALTER TABLE `invouts`
  ADD CONSTRAINT `invouts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoria`) REFERENCES `categories` (`id`);

--
-- Filtros para la tabla `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`);

--
-- Filtros para la tabla `project_products`
--
ALTER TABLE `project_products`
  ADD CONSTRAINT `project_products_ibfk_1` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `project_products_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`);

--
-- Filtros para la tabla `project_product_histories`
--
ALTER TABLE `project_product_histories`
  ADD CONSTRAINT `project_product_histories_ibfk_1` FOREIGN KEY (`project_product_id`) REFERENCES `project_products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
