-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-03-2025 a las 04:29:59
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
(5, 'Suministros de Seguridad', '2024-11-30 22:21:20', '2024-11-30 22:21:20'),
(12, 'cat con producto', '2025-03-22 06:59:03', '2025-03-22 06:59:03'),
(13, 'catedited', '2025-03-22 07:00:09', '2025-03-22 08:35:28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `clientname` varchar(50) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clients`
--

INSERT INTO `clients` (`id`, `clientname`, `activo`, `createdAt`, `updatedAt`) VALUES
(1, 'Cliente General', 1, '2024-11-30 22:22:04', '2024-11-30 22:22:04'),
(3, 'prueba 2', 1, '2025-02-22 03:37:46', '2025-02-22 03:37:46'),
(4, 'prueba sweet alert editar', 1, '2025-02-22 03:58:38', '2025-02-22 03:58:45'),
(8, 'prueba cliente desactivado', 0, '2025-03-21 05:57:47', '2025-03-21 05:57:50'),
(9, 'prueba cliente con proyecto', 1, '2025-03-21 05:58:08', '2025-03-21 05:58:08'),
(10, 'nuevo', 0, '2025-03-21 06:00:38', '2025-03-21 06:00:42'),
(11, 'pueba cliente edit', 1, '2025-03-22 06:57:41', '2025-03-22 06:57:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventory_histories`
--

CREATE TABLE `inventory_histories` (
  `id` int(11) NOT NULL,
  `tipo` enum('ENTRADA','MODIFICACION','ELIMINACION','DESACTIVACION','SALIDA') NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `cantidad_anterior` int(11) DEFAULT NULL,
  `cantidad_nueva` int(11) DEFAULT NULL,
  `diferencia` int(11) NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventory_histories`
--

INSERT INTO `inventory_histories` (`id`, `tipo`, `product_id`, `cantidad_anterior`, `cantidad_nueva`, `diferencia`, `motivo`, `user_id`, `fecha`, `createdAt`, `updatedAt`) VALUES
(1, 'ENTRADA', 57, 0, 12, 12, 'Creación inicial del producto', NULL, '2025-03-20 15:33:01', '2025-03-20 15:33:01', '2025-03-20 15:33:01'),
(2, 'ENTRADA', 58, 0, 121, 121, 'Creación inicial del producto', NULL, '2025-03-20 15:49:51', '2025-03-20 15:49:51', '2025-03-20 15:49:51'),
(3, 'ENTRADA', 59, 0, 121, 121, 'Creación inicial del producto', NULL, '2025-03-20 15:51:22', '2025-03-20 15:51:22', '2025-03-20 15:51:22'),
(4, 'ENTRADA', NULL, 0, 11, 11, 'Creación inicial del producto', 7, '2025-03-20 16:59:49', '2025-03-20 16:59:49', '2025-03-20 16:59:49'),
(5, 'ENTRADA', 59, 121, 12110, 10, 'Entrada manual de inventario', 7, '2025-03-20 17:07:49', '2025-03-20 17:07:49', '2025-03-20 17:07:49'),
(6, 'ENTRADA', 59, 131, 1315, 5, 'Entrada manual de inventario', 7, '2025-03-20 17:08:19', '2025-03-20 17:08:19', '2025-03-20 17:08:19'),
(7, 'ELIMINACION', NULL, 11, 0, -11, 'Eliminación del producto', NULL, '2025-03-21 00:30:39', '2025-03-21 00:30:39', '2025-03-21 00:30:39'),
(8, 'ENTRADA', NULL, 0, 12, 12, 'Creación inicial del producto', 7, '2025-03-21 04:26:21', '2025-03-21 04:26:21', '2025-03-21 04:26:21'),
(9, 'ELIMINACION', NULL, 12, 0, -12, 'Eliminación del producto', NULL, '2025-03-21 04:42:28', '2025-03-21 04:42:28', '2025-03-21 04:42:28'),
(10, 'ENTRADA', 62, 0, 21, 21, 'Creación inicial del producto', 7, '2025-03-21 05:32:34', '2025-03-21 05:32:34', '2025-03-21 05:32:34'),
(11, 'DESACTIVACION', 62, 21, 0, -21, 'Desactivacion del producto', NULL, '2025-03-21 05:49:15', '2025-03-21 05:49:15', '2025-03-21 05:49:15'),
(12, 'ENTRADA', 63, 0, 21, 21, 'Creación inicial del producto', 15, '2025-03-21 06:23:21', '2025-03-21 06:23:21', '2025-03-21 06:23:21'),
(13, 'DESACTIVACION', 63, 21, 0, -21, 'Desactivacion del producto', NULL, '2025-03-21 06:26:44', '2025-03-21 06:26:44', '2025-03-21 06:26:44'),
(14, 'ENTRADA', 64, 0, 21, 21, 'Creación inicial del producto', 7, '2025-03-21 06:31:29', '2025-03-21 06:31:29', '2025-03-21 06:31:29'),
(15, 'DESACTIVACION', 64, 21, 0, -21, 'Desactivacion del producto', NULL, '2025-03-21 06:31:43', '2025-03-21 06:31:43', '2025-03-21 06:31:43'),
(16, 'ENTRADA', 65, 0, 2, 2, 'Creación inicial del producto', 7, '2025-03-21 07:13:33', '2025-03-21 07:13:33', '2025-03-21 07:13:33'),
(17, 'ENTRADA', 66, 0, 3, 3, 'Creación inicial del producto', 7, '2025-03-22 04:43:12', '2025-03-22 04:43:12', '2025-03-22 04:43:12'),
(18, 'DESACTIVACION', 66, 3, 0, -3, 'Desactivacion del producto', 7, '2025-03-22 05:01:28', '2025-03-22 05:01:28', '2025-03-22 05:01:28'),
(19, 'ENTRADA', 67, 0, 33, 33, 'Creación inicial del producto', 7, '2025-03-22 05:04:33', '2025-03-22 05:04:33', '2025-03-22 05:04:33'),
(20, 'DESACTIVACION', 67, 33, 0, -33, 'Desactivacion del producto', 7, '2025-03-22 05:05:17', '2025-03-22 05:05:17', '2025-03-22 05:05:17'),
(21, 'ENTRADA', 68, 0, 334, 334, 'Creación inicial del producto', 7, '2025-03-22 05:14:08', '2025-03-22 05:14:08', '2025-03-22 05:14:08'),
(22, 'ENTRADA', 69, 0, 22, 22, 'Creación inicial del producto', 7, '2025-03-22 05:16:46', '2025-03-22 05:16:46', '2025-03-22 05:16:46'),
(23, 'DESACTIVACION', 69, 22, 0, -22, 'Desactivacion del producto', 7, '2025-03-22 05:17:08', '2025-03-22 05:17:08', '2025-03-22 05:17:08'),
(24, 'ENTRADA', 70, 0, 22, 22, 'Creación inicial del producto', 7, '2025-03-22 05:18:56', '2025-03-22 05:18:56', '2025-03-22 05:18:56'),
(25, 'DESACTIVACION', 70, 22, 0, -22, 'Desactivacion del producto', 7, '2025-03-22 05:19:16', '2025-03-22 05:19:16', '2025-03-22 05:19:16'),
(26, 'ENTRADA', 71, 0, 33, 33, 'Creación inicial del producto', 7, '2025-03-22 05:25:19', '2025-03-22 05:25:19', '2025-03-22 05:25:19'),
(27, 'DESACTIVACION', 71, 33, 0, -33, 'Desactivacion del producto', 7, '2025-03-22 05:25:27', '2025-03-22 05:25:27', '2025-03-22 05:25:27'),
(28, 'ENTRADA', 72, 0, 33, 33, 'Creación inicial del producto', 7, '2025-03-22 05:37:57', '2025-03-22 05:37:57', '2025-03-22 05:37:57'),
(29, 'ENTRADA', 72, 33, 35, 2, 'Actualización manual de cantidad', 7, '2025-03-22 05:46:22', '2025-03-22 05:46:22', '2025-03-22 05:46:22'),
(30, 'MODIFICACION', 72, 35, 30, -5, 'Actualización manual de cantidad', 7, '2025-03-22 05:47:14', '2025-03-22 05:47:14', '2025-03-22 05:47:14'),
(31, 'ENTRADA', 73, 0, 22, 22, 'Creación inicial del producto', 7, '2025-03-22 06:05:38', '2025-03-22 06:05:38', '2025-03-22 06:05:38'),
(32, 'SALIDA', 73, 20, 19, -1, 'Salida de inventario: S250322003', 7, '2025-03-22 06:07:52', '2025-03-22 06:07:52', '2025-03-22 06:07:52'),
(34, 'ENTRADA', 74, 0, 22, 22, 'Creación inicial del producto', 7, '2025-03-22 06:19:43', '2025-03-22 06:19:43', '2025-03-22 06:19:43'),
(35, 'DESACTIVACION', 74, 22, 0, -22, 'Desactivacion del producto', 7, '2025-03-22 06:20:13', '2025-03-22 06:20:13', '2025-03-22 06:20:13'),
(36, 'ENTRADA', 75, 0, 5, 5, 'Creación inicial del producto', 7, '2025-03-22 06:20:55', '2025-03-22 06:20:55', '2025-03-22 06:20:55'),
(38, 'ENTRADA', 76, 0, 22, 22, 'Creación inicial del producto', 7, '2025-03-22 06:44:43', '2025-03-22 06:44:43', '2025-03-22 06:44:43'),
(39, 'SALIDA', 76, 22, 20, -2, 'Salida de inventario: S250322005', 7, '2025-03-22 06:45:01', '2025-03-22 06:45:01', '2025-03-22 06:45:01'),
(40, 'ENTRADA', 77, 0, 0, 0, 'Creación inicial del producto', 7, '2025-03-22 06:53:20', '2025-03-22 06:53:20', '2025-03-22 06:53:20'),
(41, 'MODIFICACION', 77, 0, 0, 0, 'Actualización manual de cantidad', 7, '2025-03-22 06:53:53', '2025-03-22 06:53:53', '2025-03-22 06:53:53'),
(42, 'ENTRADA', 77, 0, 12, 12, 'Actualización manual de cantidad', 7, '2025-03-22 06:54:06', '2025-03-22 06:54:06', '2025-03-22 06:54:06'),
(43, 'MODIFICACION', 77, 12, 12, 0, 'Actualización manual de cantidad', 7, '2025-03-22 06:54:16', '2025-03-22 06:54:16', '2025-03-22 06:54:16'),
(44, 'MODIFICACION', 77, 12, 0, -12, 'Actualización manual de cantidad', 7, '2025-03-22 06:54:36', '2025-03-22 06:54:36', '2025-03-22 06:54:36'),
(45, 'ENTRADA', 77, 0, 10, 10, 'Actualización manual de cantidad', 7, '2025-03-22 06:54:56', '2025-03-22 06:54:56', '2025-03-22 06:54:56'),
(46, 'MODIFICACION', 77, 10, 10, 0, 'Actualización manual de cantidad', 7, '2025-03-22 06:59:13', '2025-03-22 06:59:13', '2025-03-22 06:59:13'),
(47, 'MODIFICACION', 3, 50, 50, 0, 'Actualización manual de cantidad', 7, '2025-03-22 08:29:00', '2025-03-22 08:29:00', '2025-03-22 08:29:00'),
(48, 'MODIFICACION', 1, 5, 5, 0, 'Actualización manual de cantidad', 7, '2025-03-22 08:29:45', '2025-03-22 08:29:45', '2025-03-22 08:29:45'),
(49, 'MODIFICACION', 1, 5, 5, 0, 'Actualización manual de cantidad', 7, '2025-03-22 08:33:23', '2025-03-22 08:33:23', '2025-03-22 08:33:23'),
(50, 'ENTRADA', 78, 0, 2, 2, 'Creación inicial del producto', 7, '2025-03-22 20:45:24', '2025-03-22 20:45:24', '2025-03-22 20:45:24'),
(51, 'DESACTIVACION', 78, 2, 0, -2, 'Desactivacion del producto', 7, '2025-03-22 20:45:42', '2025-03-22 20:45:42', '2025-03-22 20:45:42'),
(52, 'ENTRADA', 79, 0, 3, 3, 'Creación inicial del producto', 7, '2025-03-22 21:25:37', '2025-03-22 21:25:37', '2025-03-22 21:25:37'),
(53, 'SALIDA', 79, 3, 0, -3, 'Salida para proyecto: prueba salidas historial (ID: 57)', 7, '2025-03-22 21:28:03', '2025-03-22 21:28:03', '2025-03-22 21:28:03'),
(54, 'ENTRADA', 80, 0, 4, 4, 'Creación inicial del producto', 7, '2025-03-22 21:46:59', '2025-03-22 21:46:59', '2025-03-22 21:46:59'),
(55, 'SALIDA', 80, 4, 0, -4, 'Salida automática por finalización de proyecto: prueba completado salidas historial (ID: 59)', 7, '2025-03-22 21:51:33', '2025-03-22 21:51:33', '2025-03-22 21:51:33');

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
(21, 37, 14, 4, 140.00, '2024-12-06 00:46:33', '2024-12-06 00:46:33'),
(22, 38, 7, 20, 300.00, '2025-03-08 03:27:02', '2025-03-08 03:27:02'),
(23, 39, 6, 5, 175.00, '2025-03-09 03:25:44', '2025-03-09 03:25:44'),
(24, 39, 7, 10, 150.00, '2025-03-09 03:25:44', '2025-03-09 03:25:44'),
(25, 39, 1, 10, 520.00, '2025-03-09 03:25:44', '2025-03-09 03:25:44'),
(26, 39, 3, 5, 225.00, '2025-03-09 03:25:44', '2025-03-09 03:25:44'),
(27, 40, 9, 8, 60.00, '2025-03-09 03:30:31', '2025-03-09 03:30:31'),
(28, 40, 8, 90, 765.00, '2025-03-09 03:30:31', '2025-03-09 03:30:31'),
(29, 41, 1, 10, 520.00, '2025-03-09 03:51:04', '2025-03-09 03:51:04'),
(30, 41, 7, 10, 150.00, '2025-03-09 03:51:04', '2025-03-09 03:51:04'),
(31, 42, 2, 100, 150.00, '2025-03-09 04:35:22', '2025-03-09 04:35:22'),
(32, 42, 3, 30, 1350.00, '2025-03-09 04:35:22', '2025-03-09 04:35:22'),
(33, 43, 3, 20, 900.00, '2025-03-09 04:38:19', '2025-03-09 04:38:19'),
(34, 44, 11, 10, 250.00, '2025-03-09 05:03:42', '2025-03-09 05:03:42'),
(35, 45, 6, 5, 175.00, '2025-03-09 05:19:43', '2025-03-09 05:19:43'),
(36, 45, 14, 5, 175.00, '2025-03-09 05:19:43', '2025-03-09 05:19:43'),
(37, 46, 1, 5, 750.00, '2025-03-10 04:10:58', '2025-03-10 04:10:58'),
(38, 46, 2, 3, 4.50, '2025-03-10 04:10:58', '2025-03-10 04:10:58'),
(39, 48, 9, 10, 75.00, '2025-03-11 02:46:17', '2025-03-11 02:46:17'),
(40, 49, 1, 5, 750.00, '2025-03-11 03:24:40', '2025-03-11 03:24:40'),
(41, 49, 37, 10, 120.00, '2025-03-11 03:24:40', '2025-03-11 03:24:40'),
(42, 50, 24, 5, 2250.00, '2025-03-11 03:37:12', '2025-03-11 03:37:12'),
(43, 50, 30, 5, 2250.00, '2025-03-11 03:37:12', '2025-03-11 03:37:12'),
(44, 51, 55, 1, 100.00, '2025-03-11 19:46:22', '2025-03-11 19:46:22'),
(45, 52, 48, 1, 18.00, '2025-03-11 19:49:26', '2025-03-11 19:49:26'),
(46, 53, 8, 1, 8.50, '2025-03-11 19:51:06', '2025-03-11 19:51:06'),
(47, 54, 46, 1, 8.00, '2025-03-11 20:33:52', '2025-03-11 20:33:52'),
(48, 55, 11, 1, 25.00, '2025-03-11 20:37:37', '2025-03-11 20:37:37'),
(49, 55, 45, 1, 25.00, '2025-03-11 20:37:37', '2025-03-11 20:37:37'),
(50, 56, 47, 1, 120.00, '2025-03-11 21:18:22', '2025-03-11 21:18:22'),
(51, 57, 34, 1, 8.00, '2025-03-11 21:20:46', '2025-03-11 21:20:46'),
(52, 58, 41, 1, 35.00, '2025-03-11 21:25:07', '2025-03-11 21:25:07'),
(53, 59, 44, 1, 85.00, '2025-03-11 21:38:54', '2025-03-11 21:38:54'),
(54, 60, 11, 1, 25.00, '2025-03-12 01:36:07', '2025-03-12 01:36:07'),
(55, 61, 12, 1, 18.00, '2025-03-12 01:36:31', '2025-03-12 01:36:31'),
(56, 62, 17, 1, 8.00, '2025-03-13 03:51:53', '2025-03-13 03:51:53'),
(57, 63, 59, 6, 198.00, '2025-03-20 17:10:18', '2025-03-20 17:10:18'),
(58, 64, 68, 4, 1292.00, '2025-03-22 05:14:43', '2025-03-22 05:14:43'),
(59, 65, 73, 2, 45.00, '2025-03-22 06:06:16', '2025-03-22 06:06:16'),
(60, 69, 2, 7, 10.50, '2025-03-22 06:17:43', '2025-03-22 06:17:43'),
(61, 70, 75, 2, 44.00, '2025-03-22 06:22:24', '2025-03-22 06:22:24'),
(62, 71, 76, 2, 22.00, '2025-03-22 06:45:01', '2025-03-22 06:45:01'),
(63, 72, 77, 5, 50.00, '2025-03-22 07:04:49', '2025-03-22 07:04:49'),
(64, 73, 79, 3, 9.00, '2025-03-22 21:28:03', '2025-03-22 21:28:03'),
(65, 74, 80, 4, 20.00, '2025-03-22 21:51:33', '2025-03-22 21:51:33');

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
(37, 'S241205009', 0, 7, 'Salida por finalización de proyecto: presentacion (ID: 23)', 188.00, '2024-12-06 00:46:33', '2024-12-06 00:46:33'),
(38, 'S250307001', 0, 7, 'Salida por finalización de proyecto: prueba reservas despues de creacion (ID: 26)', 300.00, '2025-03-08 03:27:02', '2025-03-08 03:27:02'),
(39, 'S250308001', 0, 7, 'Salida por finalización de proyecto: Proyecto 1 (ID: 14)', 1070.00, '2025-03-09 03:25:44', '2025-03-09 03:25:44'),
(40, 'S250308002', 0, 7, 'Salida por finalización de proyecto: prueba entregas (ID: 28)', 825.00, '2025-03-09 03:30:31', '2025-03-09 03:30:31'),
(41, 'S250308003', 0, 7, 'Salida por finalización de proyecto: prueba completar proyecto (ID: 29)', 670.00, '2025-03-09 03:51:04', '2025-03-09 03:51:04'),
(42, 'S250309001', 0, 7, 'Salida por finalización de proyecto: prueba completar proyecto (ID: 30)', 1500.00, '2025-03-09 04:35:22', '2025-03-09 04:35:22'),
(43, 'S250309002', 0, 7, 'Salida por finalización de proyecto: test completar proyecto (ID: 31)', 900.00, '2025-03-09 04:38:19', '2025-03-09 04:38:19'),
(44, 'S250309003', 0, 7, 'Salida por finalización de proyecto: prueba completar (ID: 32)', 250.00, '2025-03-09 05:03:42', '2025-03-09 05:03:42'),
(45, 'S250309004', 0, 7, 'Salida por finalización de proyecto: prueba final completar (ID: 33)', 350.00, '2025-03-09 05:19:43', '2025-03-09 05:19:43'),
(46, 'S250310001', 0, 1, 'Observación de prueba', 754.50, '2025-03-10 04:10:58', '2025-03-10 04:10:58'),
(48, 'S250310002', 0, 7, 'Salida por finalización de proyecto: prueba entregas (ID: 34)', 75.00, '2025-03-11 02:46:17', '2025-03-11 02:46:17'),
(49, 'S250310003', 0, 7, 'Salida por finalización de proyecto: prueba refactor (ID: 35)', 870.00, '2025-03-11 03:24:40', '2025-03-11 03:24:40'),
(50, 'S250310004', 0, 7, 'Salida por finalización de proyecto: prueba fix controller (ID: 36)', 4500.00, '2025-03-11 03:37:12', '2025-03-11 03:37:12'),
(51, 'S250311001', 0, 7, 'Salida por proyecto: entregas parciales (ID: 40)', 100.00, '2025-03-11 19:46:22', '2025-03-11 19:46:22'),
(52, 'S250311002', 0, 7, 'Salida por proyecto: entregas parciales (ID: 40)', 18.00, '2025-03-11 19:49:26', '2025-03-11 19:49:26'),
(53, 'S250311003', 0, 7, 'venta ', 8.50, '2025-03-11 19:51:06', '2025-03-11 19:51:06'),
(54, 'S250311004', 0, 7, 'Salida por proyecto: prueba deliver (ID: 41)', 8.00, '2025-03-11 20:33:52', '2025-03-11 20:33:52'),
(55, 'S250311005', 0, 7, 'Salida por finalización de proyecto: test deliver2 (ID: 42)', 50.00, '2025-03-11 20:37:37', '2025-03-11 20:37:37'),
(56, 'S250311006', 0, 7, 'Salida por proyecto: prueba entregas ad (ID: 43)', 120.00, '2025-03-11 21:18:22', '2025-03-11 21:18:22'),
(57, 'S250311007', 0, 7, 'Salida por proyecto: prueba entregas ad (ID: 43)', 8.00, '2025-03-11 21:20:46', '2025-03-11 21:20:46'),
(58, 'S250311008', 0, 7, 'Salida por proyecto: deliver product project test (ID: 44)', 35.00, '2025-03-11 21:25:07', '2025-03-11 21:25:07'),
(59, 'S250311009', 0, 7, 'Salida por proyecto: deliver product project test (ID: 44)', 85.00, '2025-03-11 21:38:54', '2025-03-11 21:38:54'),
(60, 'S250311010', 0, 7, 'Salida por proyecto: pruebas reservas fo a pk (ID: 45)', 25.00, '2025-03-12 01:36:07', '2025-03-12 01:36:07'),
(61, 'S250311011', 0, 7, 'Salida por finalización de proyecto: pruebas reservas fo a pk (ID: 45)', 18.00, '2025-03-12 01:36:31', '2025-03-12 01:36:31'),
(62, 'S250312001', 0, 7, 'venta', 8.00, '2025-03-13 03:51:53', '2025-03-13 03:51:53'),
(63, 'S250320001', 0, 7, 'venta', 198.00, '2025-03-20 17:10:18', '2025-03-20 17:10:18'),
(64, 'S250322001', 0, 7, 'salida prueba historial', 1292.00, '2025-03-22 05:14:43', '2025-03-22 05:14:43'),
(65, 'S250322002', 0, 7, 'prueba integración con historial', 45.00, '2025-03-22 06:06:16', '2025-03-22 06:06:16'),
(69, 'S250322003', 0, 7, 'prueba', 10.50, '2025-03-22 06:16:52', '2025-03-22 06:17:43'),
(70, 'S250322004', 0, 7, 'TEST', 44.00, '2025-03-22 06:21:33', '2025-03-22 06:22:24'),
(71, 'S250322005', 0, 7, '2', 22.00, '2025-03-22 06:45:01', '2025-03-22 06:45:01'),
(72, 'S250322006', 0, 7, 'Salida por finalización de proyecto: mejoras (ID: 56)', 50.00, '2025-03-22 07:04:49', '2025-03-22 07:04:49'),
(73, 'S250322007', 0, 7, 'Salida por proyecto: prueba salidas historial (ID: 57)', 9.00, '2025-03-22 21:28:03', '2025-03-22 21:28:03'),
(74, 'S250322008', 0, 7, 'Salida por finalización de proyecto: prueba completado salidas historial (ID: 59)', 20.00, '2025-03-22 21:51:33', '2025-03-22 21:51:33');

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
  `image` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL,
  `createdAt` date NOT NULL,
  `updatedAt` date NOT NULL,
  `cantidad_reservada` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `descripcion`, `categoria`, `cantidad`, `precio`, `image`, `activo`, `createdAt`, `updatedAt`, `cantidad_reservada`) VALUES
(1, 'Producto Actualizado', 1, 5, 150.00, '1733026863277.png', 1, '2024-11-30', '2025-03-22', 0),
(2, 'Ladrillo 6 Huecos', 1, 840, 1.50, '1733025333790.png', 1, '2024-11-30', '2025-03-22', 0),
(3, 'Arena Fina (bolsa 25kg)', 1, 50, 45.00, '1733025349348.jpg', 1, '2024-11-30', '2025-03-22', 30),
(4, 'Fierro de Construcción 6mm x 12m', 1, 100, 28.50, '1733025364314.jpg', 1, '2024-11-30', '2025-03-08', 15),
(6, 'Cemento Blanco (Bolsa 1kg)', 1, 40, 35.00, '1733026212705.jpg', 1, '2024-11-30', '2025-03-09', 10),
(7, 'Yeso de Construcción (Bolsa 20kg)', 1, 30, 15.00, '1733412427137.png', 1, '2024-11-30', '2025-03-21', 12),
(8, 'Alambre Negro #16 (kg)', 1, 99, 8.50, '1733412506694.jpg', 1, '2024-11-30', '2025-03-11', 0),
(9, 'Clavos 2\" (kg)', 1, 117, 7.50, '1733412551277.jpeg', 1, '2024-11-30', '2025-03-11', 77),
(10, 'Malla de Alambre (m²)', 1, 100, 12.00, '1733412607192.jpeg', 1, '2024-11-30', '2025-03-17', 31),
(11, 'Martillo de Carpintero', 2, 18, 25.00, '1733412663959.jpg', 1, '2024-11-30', '2025-03-12', 0),
(12, 'Alicate Universal', 2, 26, 18.00, '1733413062273.jpg', 1, '2024-11-30', '2025-03-12', 0),
(13, 'Destornillador Phillips Truper', 2, 49, 12.00, '1733413206671.webp', 1, '2024-11-30', '2025-03-17', 1),
(14, 'Serrucho 20\"', 2, 15, 35.00, '1733413292627.jpg', 1, '2024-11-30', '2025-03-17', 2),
(15, 'Nivel de Burbuja 24\"', 2, 29, 28.00, '1733413321048.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(16, 'Flexometro 8m', 2, 44, 15.00, '1733413369166.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(17, 'Espátula 3\"', 2, 29, 8.00, '1733413486390.jpeg', 1, '2024-11-30', '2025-03-13', 0),
(18, 'Llave Ajustable 12\"', 2, 20, 45.00, '1733413556432.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(19, 'Pala Punta Redonda', 2, 27, 38.00, '1733413610101.png', 1, '2024-11-30', '2024-12-05', 0),
(20, 'Cincel de madera', 2, 34, 12.00, '1733413674445.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(21, 'Taladro Percutor Tolsen 750W', 3, 15, 250.00, '1733413788162.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(22, 'Amoladora DeWalt 4½\"', 3, 20, 180.00, '1733413890292.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(23, 'Sierra Circular Truper 7¼\"', 3, 12, 320.00, '1733413956195.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(24, 'Rotomartillo Ingco 800W', 3, 5, 450.00, '1733414012108.jpeg', 1, '2024-11-30', '2025-03-11', 0),
(25, 'Lijadora Orbital', 3, 15, 160.00, '1733414142238.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(26, 'Pistola de Calor', 3, 20, 120.00, '1733414241443.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(27, 'Atornillador Eléctrico BS18Li ', 3, 25, 140.00, '1733414310896.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(28, 'Caladora Eléctrica Skill', 3, 15, 190.00, '1733414360617.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(29, 'Compresora de Aire 25L', 3, 8, 580.00, '', 1, '2024-11-30', '2024-11-30', 0),
(30, 'Soldadora Eléctrica 200A', 3, 5, 450.00, '', 1, '2024-11-30', '2025-03-11', 0),
(31, 'Tubo PVC 4\" Tigre (3m)', 4, 50, 35.00, '1733414615985.jpeg', 1, '2024-11-30', '2024-12-06', 0),
(32, 'Codo PVC 90° 1/2\"', 4, 200, 2.50, '1733414774499.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(33, 'Cable Flexible Domiciliario AWG - CT - Negro (m)', 4, 450, 3.50, '1733415009951.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(34, 'Tomacorriente Doble', 4, 99, 8.00, '1733415061196.jpeg', 1, '2024-11-30', '2025-03-11', 0),
(35, 'Llave de Paso 1/2\"', 4, 60, 18.00, '1733415104039.jpeg', 1, '2024-11-30', '2024-12-05', 3),
(36, 'Interruptor Simple', 4, 100, 7.00, '1733415189362.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(37, 'Unión Universal 1\"', 4, 70, 12.00, '1733415234273.jpeg', 1, '2024-11-30', '2025-03-11', 0),
(38, 'Caja Octogonal PVC', 4, 150, 3.00, '1733415275577.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(39, 'Tubo Corrugado 3/4\" (m)', 4, 200, 2.50, '1733415305502.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(40, 'Cinta Aislante', 4, 100, 4.50, '1733415346688.jpeg', 1, '2024-11-30', '2024-12-06', 3),
(41, 'Casco de Seguridad', 5, 49, 35.00, '1733415378548.jpeg', 1, '2024-11-30', '2025-03-11', 0),
(42, 'Guantes de Cuero (Par)', 5, 100, 15.00, '1733415427153.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(43, 'Lentes de Seguridad', 5, 80, 12.00, '1733415455814.jpeg', 1, '2024-11-30', '2024-12-05', 0),
(44, 'Botas de Seguridad (Par)', 5, 39, 85.00, '', 1, '2024-11-30', '2025-03-11', 0),
(45, 'Chaleco Reflectivo', 5, 59, 25.00, '1733415496937.jpeg', 1, '2024-11-30', '2025-03-11', 0),
(46, 'Máscara para Polvo', 5, 149, 8.00, '1733415547623.jpeg', 1, '2024-11-30', '2025-03-11', 0),
(47, 'Arnés de Seguridad', 5, 19, 120.00, '', 1, '2024-11-30', '2025-03-11', 0),
(48, 'Protector Auditivo', 5, 99, 18.00, '', 1, '2024-11-30', '2025-03-11', 0),
(49, 'Extintor 6kg', 5, 30, 85.00, '', 1, '2024-11-30', '2024-11-30', 0),
(50, 'Botiquín de Primeros Auxilios', 5, 5, 45.00, '', 1, '2024-11-30', '2025-03-01', 0),
(51, 'Prensa C', 2, 2, 15.50, '1733425469505.jpeg', 1, '2024-12-05', '2024-12-05', 0),
(55, 'Nuevo Producto', 1, 9, 100.00, 'nueva-imagen.jpg', 1, '2025-03-10', '2025-03-11', 0),
(56, 'prueba historial', 2, 12, 45.00, '1742483993830.png', 1, '2025-03-20', '2025-03-20', 0),
(57, 'prueba historial', 1, 12, 44.00, '1742484781404.png', 1, '2025-03-20', '2025-03-20', 0),
(58, 'prueba historial2', 1, 121, 33.00, '1742485791887.png', 1, '2025-03-20', '2025-03-20', 0),
(59, 'prueba historial usuario', 1, 130, 33.00, '1742485882400.jpg', 1, '2025-03-20', '2025-03-20', 0),
(62, 'prueba eliminación logica', 1, 21, 12.00, '1742535154170.png', 0, '2025-03-21', '2025-03-21', 0),
(63, 'prueba', 2, 21, 12.00, '1742538201053.png', 0, '2025-03-21', '2025-03-21', 0),
(64, 'eliminacion logica historial', 1, 21, 12.00, '1742538689266.png', 0, '2025-03-21', '2025-03-21', 0),
(65, 'prueba eliminacion logica en historial', 2, 2, 1.00, '1742541213068.png', 1, '2025-03-21', '2025-03-21', 0),
(66, 'prueba eliminacion logica\r\n', 1, 3, 33.00, '1742618592152.jpg', 0, '2025-03-22', '2025-03-22', 0),
(67, 'prueba eliminacion logica', 1, 33, 44.00, '1742619873327.jpeg', 0, '2025-03-22', '2025-03-22', 0),
(68, 'prueba desactivacion', 2, 330, 323.00, '1742620448915.png', 1, '2025-03-22', '2025-03-22', 0),
(69, 'prueba \"DESACTIVACION\"', 1, 22, 22.00, '1742620606672.png', 0, '2025-03-22', '2025-03-22', 0),
(70, 'desactivar', 3, 22, 22.00, '1742620736623.png', 0, '2025-03-22', '2025-03-22', 0),
(71, 'prueba final desactivacion', 4, 33, 33.00, '1742621119761.png', 0, '2025-03-22', '2025-03-22', 0),
(72, 'no imagen', 3, 30, 9.00, NULL, 1, '2025-03-22', '2025-03-22', 0),
(73, 'prueba salidas integradas', 1, 20, 22.50, NULL, 1, '2025-03-22', '2025-03-22', 0),
(74, 'prueba salidas integradas', 2, 22, 21.00, NULL, 0, '2025-03-22', '2025-03-22', 0),
(75, 'SALIDA TEST', 4, 3, 22.00, NULL, 1, '2025-03-22', '2025-03-22', 0),
(76, 'SALIDA', 4, 20, 11.00, NULL, 1, '2025-03-22', '2025-03-22', 0),
(77, 'mejoras', 12, 5, 10.00, NULL, 1, '2025-03-22', '2025-03-22', 0),
(78, 'prueba salida', 1, 2, 2.00, NULL, 0, '2025-03-22', '2025-03-22', 0),
(79, 'prueba salida proyecto', 12, 0, 3.00, NULL, 1, '2025-03-22', '2025-03-22', 0),
(80, 'prueba entrega completa proyecto', 4, 0, 5.00, NULL, 1, '2025-03-22', '2025-03-22', 0);

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
  `costo` decimal(10,2) DEFAULT NULL,
  `prioridad` enum('BAJA','MEDIA','ALTA') DEFAULT 'MEDIA',
  `client_id` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fecha_completado` datetime DEFAULT NULL,
  `motivo_cancelacion` varchar(255) DEFAULT NULL,
  `notas_cierre` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `projects`
--

INSERT INTO `projects` (`id`, `nombre`, `descripcion`, `fecha_inicio`, `fecha_entrega`, `estado`, `direccion`, `costo`, `prioridad`, `client_id`, `createdAt`, `updatedAt`, `fecha_completado`, `motivo_cancelacion`, `notas_cierre`, `activo`) VALUES
(12, 'prueba', 'prueba', '2024-12-03', '2024-12-27', 'EN_PROGRESO', '', 0.00, 'MEDIA', 1, '2024-12-02 04:13:30', '2025-03-22 11:21:47', NULL, NULL, 'fase previa entrega', 1),
(13, 'prueba 2 edit', 'prueba 2 edit', '2024-12-06', '2024-12-13', 'CANCELADO', '', 6000.00, 'MEDIA', 1, '2024-12-02 04:14:51', '2025-03-22 11:21:47', NULL, NULL, 'cancelar prueba', 1),
(14, 'Proyecto 1', 'Construccion', '2024-12-04', '2024-12-20', 'COMPLETADO', '', 0.00, 'MEDIA', 1, '2024-12-03 18:30:24', '2025-03-22 11:21:47', '2025-03-09 03:25:44', NULL, NULL, 1),
(15, 'Prueba 2', 'Construcción ', '2024-12-05', '2024-12-27', 'PLANIFICACION', '', 0.00, 'MEDIA', 1, '2024-12-04 20:59:38', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(16, 'prueba estados reservas', 'test', '2024-12-06', '2024-12-13', 'CANCELADO', '', 0.00, 'MEDIA', 1, '2024-12-05 07:13:39', '2025-03-22 11:21:47', NULL, NULL, 'prueba', 1),
(17, 'prueba 4', 'test', '2024-12-06', '2024-12-12', 'CANCELADO', '', 0.00, 'MEDIA', 1, '2024-12-05 07:18:52', '2025-03-22 11:44:17', NULL, 'Eliminado por usuario', 'cancelacion', 0),
(18, 'prueba cancelacion con reservas', 'prueba cancelación con reservas', '2024-12-06', '2024-12-13', 'CANCELADO', '', 0.00, 'MEDIA', 1, '2024-12-05 16:46:46', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(19, 'prueba estados', 'test', '2024-12-06', '2024-12-12', 'CANCELADO', '', 0.00, 'MEDIA', 1, '2024-12-05 19:20:43', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(20, 'prueba modelo actualizado', '', '2024-12-06', '2024-12-13', 'PLANIFICACION', '', 0.00, 'MEDIA', 1, '2024-12-05 20:42:04', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(21, 'prueba salidas', 'prueba', '2024-12-06', '2024-12-12', 'COMPLETADO', '', 0.00, 'MEDIA', 1, '2024-12-05 22:55:25', '2025-03-22 11:21:47', '2024-12-05 23:33:10', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(22, 'prueba presentacion', 'prueba', '2024-12-06', '2024-12-12', 'CANCELADO', '', 0.00, 'MEDIA', 1, '2024-12-06 00:39:46', '2025-03-22 11:21:47', NULL, NULL, 'Inicio de prueba', 1),
(23, 'presentacion', 'presentacion', '2024-12-06', '2024-12-12', 'COMPLETADO', '', 0.00, 'ALTA', 1, '2024-12-06 00:46:20', '2025-03-22 11:21:47', '2024-12-06 00:46:33', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(24, 'prueba', 'prueba', '2025-03-10', '2025-03-28', 'CANCELADO', '', 0.00, 'MEDIA', 1, '2025-03-08 02:26:29', '2025-03-22 11:21:47', NULL, NULL, 'cancelacion', 1),
(25, 'pruebas reservas', 'reservas', '2025-03-10', '2025-03-14', 'EN_PROGRESO', 'direccion de entrega', 0.00, 'MEDIA', 1, '2025-03-08 02:41:48', '2025-03-22 11:21:47', NULL, NULL, 'inicio de proyecto', 1),
(26, 'prueba reservas despues de creacion', 'prueba reservas despues de creacion', '2025-03-10', '2025-03-31', 'COMPLETADO', 'direccion de entrega', 0.00, 'ALTA', 3, '2025-03-08 03:25:02', '2025-03-22 11:21:47', '2025-03-08 03:27:02', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(27, 'test', 'test', '2025-03-10', '2025-03-17', 'CANCELADO', 'entrega', 0.00, 'MEDIA', 4, '2025-03-08 04:07:19', '2025-03-22 11:46:10', NULL, 'Eliminado por usuario', NULL, 0),
(28, 'prueba entregas', 'prueba entregas', '2025-03-09', '2025-03-28', 'COMPLETADO', '', 825.00, 'MEDIA', 1, '2025-03-09 03:27:08', '2025-03-22 11:21:47', '2025-03-09 03:30:31', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(29, 'prueba completar proyecto', 'prueba completar proyecto', '2025-03-09', '2025-03-14', 'COMPLETADO', '', 670.00, 'MEDIA', 1, '2025-03-09 03:37:21', '2025-03-22 11:21:47', '2025-03-09 03:51:04', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(30, 'prueba completar proyecto', 'prueba completar proyecto', '2025-03-10', '2025-03-21', 'COMPLETADO', '', 1500.00, 'MEDIA', 1, '2025-03-09 04:32:09', '2025-03-22 11:21:47', '2025-03-09 04:35:22', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(31, 'test completar proyecto', 'test completar proyecto', '2025-03-10', '2025-03-21', 'COMPLETADO', '', 900.00, 'MEDIA', 1, '2025-03-09 04:37:48', '2025-03-22 11:21:47', '2025-03-09 04:38:19', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(32, 'prueba completar', 'prueba completar', '2025-03-10', '2025-03-14', 'COMPLETADO', '', 250.00, 'MEDIA', 3, '2025-03-09 05:03:00', '2025-03-22 11:21:47', '2025-03-09 05:03:42', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(33, 'prueba final completar', 'prueba final completar', '2025-03-10', '2025-03-18', 'COMPLETADO', '', 350.00, 'MEDIA', 1, '2025-03-09 05:17:45', '2025-03-22 11:21:47', '2025-03-09 05:19:43', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(34, 'prueba entregas', '', '2025-03-11', '2025-03-19', 'COMPLETADO', '', 75.00, 'MEDIA', 1, '2025-03-11 02:45:41', '2025-03-22 11:21:47', '2025-03-11 02:46:17', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(35, 'prueba refactor', 'prueba refactor', '2025-03-11', '2025-03-17', 'COMPLETADO', '', 870.00, 'MEDIA', 1, '2025-03-11 03:24:15', '2025-03-22 11:21:47', '2025-03-11 03:24:40', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(36, 'prueba fix controller', 'prueba fix controller', '2025-03-11', '2025-03-24', 'COMPLETADO', '', 4500.00, 'MEDIA', 4, '2025-03-11 03:36:48', '2025-03-22 11:21:47', '2025-03-11 03:37:12', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(37, 'prueba entregas individuales', 'entregas individuales', '2025-03-12', '2025-03-25', 'EN_PROGRESO', '', 27.50, 'MEDIA', 3, '2025-03-11 04:17:34', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(38, 'prueba entregas por item', '', '2025-03-12', '2025-03-25', 'EN_PROGRESO', '', 205.00, 'MEDIA', 1, '2025-03-11 04:52:32', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(39, 'prueba entregas parciales', '', '2025-03-12', '2025-03-18', 'EN_PROGRESO', '', 174.00, 'MEDIA', 1, '2025-03-11 05:06:14', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(40, 'entregas parciales', 'entregas parciales', '2025-03-12', '2025-03-18', 'EN_PROGRESO', '', 118.00, 'MEDIA', 1, '2025-03-11 19:45:08', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(41, 'prueba deliver', '', '2025-03-12', '2025-03-18', 'EN_PROGRESO', '', 8.00, 'MEDIA', 1, '2025-03-11 20:32:42', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(42, 'test deliver2', '', '2025-03-12', '2025-03-18', 'COMPLETADO', '', 50.00, 'MEDIA', 1, '2025-03-11 20:37:29', '2025-03-22 11:21:47', '2025-03-11 20:37:37', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(43, 'prueba entregas ad', 'prueba entregas ad', '2025-03-12', '2025-03-18', 'EN_PROGRESO', '', 128.00, 'MEDIA', 3, '2025-03-11 21:17:55', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(44, 'deliver product project test', 'deliver product project test', '2025-03-12', '2025-03-18', 'EN_PROGRESO', '', 120.00, 'MEDIA', 1, '2025-03-11 21:24:44', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(45, 'pruebas reservas fo a pk', '', '2025-03-12', '2025-03-18', 'COMPLETADO', '', 43.00, 'MEDIA', 1, '2025-03-12 01:34:40', '2025-03-22 11:21:47', '2025-03-12 01:36:31', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(46, 'wdawd', 'awdawd', '2025-03-17', '2025-03-24', 'EN_PROGRESO', '', 35.00, 'MEDIA', 1, '2025-03-17 16:00:57', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(47, 'prueba fecha hoy', '', '2025-03-17', '2025-03-24', 'PLANIFICACION', 'awd', 40.00, 'MEDIA', 3, '2025-03-17 16:03:34', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(48, 'prueba fecha hoy 2', 'dawdaw', '2025-03-17', '2025-03-24', 'PLANIFICACION', '', 85.00, 'MEDIA', 3, '2025-03-17 16:25:51', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(49, 'fechahoytest', 'fechahoytest', '2025-03-17', '2025-03-24', 'PLANIFICACION', '', 12.00, 'MEDIA', 1, '2025-03-17 16:38:08', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(50, 'fechahoy', 'awdawd', '2025-03-17', '2025-03-24', 'PLANIFICACION', '', 12.00, 'MEDIA', 3, '2025-03-17 16:44:40', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(51, 'prueba fecha', 'fsef', '2025-03-20', '2025-03-21', 'PLANIFICACION', '', 18.00, 'MEDIA', 1, '2025-03-21 01:07:09', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(52, 'prueba fecha hoy', '', '2025-03-20', '2025-03-27', 'PLANIFICACION', '', 7.50, 'MEDIA', 1, '2025-03-21 01:21:23', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(53, 'fecha hoy prueba', '', '2025-03-20', '2025-03-28', 'PLANIFICACION', '', 15.00, 'MEDIA', 1, '2025-03-21 01:51:22', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(54, 'prueba reservas independietes', 'prueba reservas independietes', '2025-03-20', '2025-03-25', 'PLANIFICACION', '', 25.00, 'MEDIA', 3, '2025-03-21 03:43:13', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(55, 'prueba cliente proyecto', 'prueba cliente proyecto', '2025-03-21', '2025-03-25', 'PLANIFICACION', '', 25.00, 'MEDIA', 9, '2025-03-21 05:58:37', '2025-03-22 11:21:47', NULL, NULL, NULL, 1),
(56, 'mejoras', 'mejoras', '2025-03-22', '2025-03-25', 'COMPLETADO', '', 50.00, 'MEDIA', 11, '2025-03-22 07:02:10', '2025-03-22 11:21:47', '2025-03-22 07:04:49', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(57, 'prueba salidas historial', 'prueba salidas historial', '2025-03-22', '2025-03-25', 'EN_PROGRESO', '', 9.00, 'MEDIA', 11, '2025-03-22 21:27:05', '2025-03-22 21:27:27', NULL, NULL, NULL, 1),
(58, 'prueba entrega completa', 'prueba entrega completa', '2025-03-22', '2025-03-25', 'EN_PROGRESO', 'direccion', 25.00, 'MEDIA', 4, '2025-03-22 21:47:51', '2025-03-22 21:48:46', NULL, NULL, NULL, 1),
(59, 'prueba completado salidas historial', 'prueba completado salidas historial', '2025-03-22', '2025-03-25', 'COMPLETADO', 'prueba completado salidas historial', 20.00, 'MEDIA', 3, '2025-03-22 21:49:53', '2025-03-22 21:51:33', '2025-03-22 21:51:33', NULL, 'Proyecto completado con entrega de productos pendientes', 1),
(60, 'editado', 'editado', '2025-03-22', '2025-03-31', 'PLANIFICACION', 'editado', 45.00, 'MEDIA', 1, '2025-03-23 02:26:57', '2025-03-23 02:43:01', NULL, NULL, NULL, 1);

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
(12, 14, 6, 5, 5, 'ENTREGADO', NULL, NULL, '2024-12-03 18:30:24', '2025-03-09 03:25:44', 0),
(13, 14, 7, 10, 10, 'ENTREGADO', NULL, NULL, '2024-12-03 18:30:24', '2025-03-09 03:25:44', 0),
(14, 14, 1, 10, 10, 'ENTREGADO', NULL, NULL, '2024-12-03 18:30:24', '2025-03-09 03:25:44', 0),
(15, 14, 3, 5, 5, 'ENTREGADO', NULL, NULL, '2024-12-03 18:30:24', '2025-03-09 03:25:44', 0),
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
(44, 23, 14, 4, 4, 'ENTREGADO', NULL, NULL, '2024-12-06 00:46:20', '2024-12-06 00:46:33', 0),
(45, 24, 4, 100, 0, 'CANCELADO', NULL, NULL, '2025-03-08 02:26:29', '2025-03-08 02:37:43', 0),
(46, 24, 6, 200, 0, 'CANCELADO', NULL, NULL, '2025-03-08 02:26:29', '2025-03-08 02:37:43', 0),
(47, 25, 9, 50, 0, 'RESERVADO', '2025-03-12', NULL, '2025-03-08 02:41:48', '2025-03-08 02:41:48', 50),
(48, 25, 3, 10, 0, 'RESERVADO', NULL, NULL, '2025-03-08 02:41:48', '2025-03-08 02:41:48', 10),
(49, 26, 7, 20, 20, 'ENTREGADO', NULL, NULL, '2025-03-08 03:25:02', '2025-03-08 03:27:02', 0),
(50, 27, 2, 50, 0, 'RESERVADO', NULL, NULL, '2025-03-08 04:07:19', '2025-03-08 04:08:05', 50),
(51, 28, 9, 8, 8, 'ENTREGADO', NULL, NULL, '2025-03-09 03:27:08', '2025-03-09 03:30:31', 0),
(52, 28, 8, 90, 90, 'ENTREGADO', NULL, NULL, '2025-03-09 03:27:08', '2025-03-09 03:30:31', 0),
(53, 29, 1, 10, 10, 'ENTREGADO', NULL, NULL, '2025-03-09 03:37:21', '2025-03-09 03:51:04', 0),
(54, 29, 7, 10, 10, 'ENTREGADO', NULL, NULL, '2025-03-09 03:37:21', '2025-03-09 03:51:04', 0),
(55, 30, 2, 100, 100, 'ENTREGADO', NULL, NULL, '2025-03-09 04:32:09', '2025-03-09 04:35:22', 0),
(56, 30, 3, 30, 30, 'ENTREGADO', NULL, NULL, '2025-03-09 04:32:09', '2025-03-09 04:35:22', 0),
(57, 31, 3, 20, 20, 'ENTREGADO', NULL, NULL, '2025-03-09 04:37:48', '2025-03-09 04:38:19', 0),
(58, 32, 11, 10, 10, 'ENTREGADO', NULL, NULL, '2025-03-09 05:03:00', '2025-03-09 05:03:42', 0),
(59, 33, 6, 5, 5, 'ENTREGADO', NULL, NULL, '2025-03-09 05:17:45', '2025-03-09 05:19:43', 0),
(60, 33, 14, 5, 5, 'ENTREGADO', NULL, NULL, '2025-03-09 05:17:45', '2025-03-09 05:19:43', 0),
(61, 34, 9, 10, 10, 'ENTREGADO', NULL, NULL, '2025-03-11 02:45:41', '2025-03-11 02:46:17', 0),
(62, 35, 1, 5, 5, 'ENTREGADO', NULL, NULL, '2025-03-11 03:24:15', '2025-03-11 03:24:40', 0),
(63, 35, 37, 10, 10, 'ENTREGADO', NULL, NULL, '2025-03-11 03:24:15', '2025-03-11 03:24:40', 0),
(64, 36, 24, 5, 5, 'ENTREGADO', NULL, NULL, '2025-03-11 03:36:48', '2025-03-11 03:37:12', 0),
(65, 36, 30, 5, 5, 'ENTREGADO', NULL, NULL, '2025-03-11 03:36:48', '2025-03-11 03:37:12', 0),
(66, 37, 45, 1, 1, 'ENTREGADO', NULL, NULL, '2025-03-11 04:17:34', '2025-03-11 04:17:50', 0),
(67, 37, 39, 1, 1, 'ENTREGADO', NULL, NULL, '2025-03-11 04:17:34', '2025-03-11 05:22:13', 0),
(68, 38, 47, 1, 1, 'ENTREGADO', NULL, NULL, '2025-03-11 04:52:32', '2025-03-11 04:52:55', 0),
(69, 38, 44, 1, 1, 'ENTREGADO', NULL, NULL, '2025-03-11 04:52:32', '2025-03-11 05:20:59', 0),
(70, 39, 12, 7, 4, 'EN_PROCESO', NULL, NULL, '2025-03-11 05:06:14', '2025-03-11 05:10:15', 0),
(71, 39, 20, 4, 2, 'EN_PROCESO', NULL, NULL, '2025-03-11 05:06:14', '2025-03-11 05:22:59', 0),
(72, 40, 55, 1, 1, 'ENTREGADO', NULL, NULL, '2025-03-11 19:45:08', '2025-03-11 19:46:22', 0),
(73, 40, 48, 1, 1, 'ENTREGADO', NULL, NULL, '2025-03-11 19:45:08', '2025-03-11 19:49:26', 0),
(74, 41, 46, 1, 1, 'ENTREGADO', NULL, NULL, '2025-03-11 20:32:42', '2025-03-11 20:33:52', 0),
(75, 42, 11, 1, 1, 'ENTREGADO', NULL, NULL, '2025-03-11 20:37:29', '2025-03-11 20:37:37', 0),
(76, 42, 45, 1, 1, 'ENTREGADO', NULL, NULL, '2025-03-11 20:37:29', '2025-03-11 20:37:37', 0),
(77, 43, 47, 1, 1, 'PENDIENTE', NULL, NULL, '2025-03-11 21:17:55', '2025-03-11 21:18:37', 0),
(78, 43, 34, 1, 1, 'ENTREGADO', NULL, NULL, '2025-03-11 21:17:55', '2025-03-11 21:20:46', 0),
(79, 44, 41, 1, 1, 'ENTREGADO', NULL, NULL, '2025-03-11 21:24:44', '2025-03-11 21:25:07', 0),
(80, 44, 44, 1, 1, 'ENTREGADO', NULL, NULL, '2025-03-11 21:24:44', '2025-03-11 21:38:55', 0),
(81, 45, 11, 1, 1, 'ENTREGADO', NULL, NULL, '2025-03-12 01:34:40', '2025-03-12 01:36:07', 0),
(82, 45, 12, 1, 1, 'ENTREGADO', NULL, NULL, '2025-03-12 01:34:40', '2025-03-12 01:36:31', 0),
(83, 46, 14, 1, 0, 'RESERVADO', NULL, NULL, '2025-03-17 16:00:57', '2025-03-17 16:01:20', 2),
(84, 47, 11, 1, 0, 'PENDIENTE', NULL, NULL, '2025-03-17 16:03:34', '2025-03-17 16:03:34', 0),
(85, 47, 16, 1, 0, 'PENDIENTE', NULL, NULL, '2025-03-17 16:03:34', '2025-03-17 16:03:34', 0),
(86, 48, 49, 1, 0, 'PENDIENTE', NULL, NULL, '2025-03-17 16:25:51', '2025-03-17 16:25:51', 0),
(87, 49, 10, 1, 0, 'RESERVADO', NULL, NULL, '2025-03-17 16:38:08', '2025-03-17 16:38:08', 1),
(88, 50, 13, 1, 0, 'RESERVADO', NULL, NULL, '2025-03-17 16:44:40', '2025-03-17 16:44:40', 1),
(89, 51, 12, 1, 0, 'PENDIENTE', NULL, NULL, '2025-03-21 01:07:09', '2025-03-21 01:07:09', 0),
(90, 52, 9, 1, 0, 'PENDIENTE', NULL, NULL, '2025-03-21 01:21:23', '2025-03-21 01:21:23', 0),
(91, 53, 7, 1, 0, 'RESERVADO', NULL, NULL, '2025-03-21 01:51:22', '2025-03-21 01:52:38', 12),
(92, 54, 11, 1, 0, 'PENDIENTE', NULL, NULL, '2025-03-21 03:43:13', '2025-03-21 03:43:13', 0),
(93, 55, 11, 1, 0, 'PENDIENTE', NULL, NULL, '2025-03-21 05:58:37', '2025-03-21 05:58:37', 0),
(94, 56, 77, 5, 5, 'ENTREGADO', NULL, NULL, '2025-03-22 07:02:10', '2025-03-22 07:04:49', 0),
(95, 57, 79, 3, 3, 'ENTREGADO', NULL, NULL, '2025-03-22 21:27:05', '2025-03-22 21:28:03', 0),
(96, 58, 80, 5, 0, 'PENDIENTE', NULL, NULL, '2025-03-22 21:47:51', '2025-03-22 21:47:51', 0),
(97, 59, 80, 4, 4, 'ENTREGADO', NULL, NULL, '2025-03-22 21:49:53', '2025-03-22 21:51:33', 0),
(98, 60, 72, 5, 0, 'PENDIENTE', NULL, NULL, '2025-03-23 02:26:57', '2025-03-23 02:26:57', 0);

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
(59, 44, 'ENTREGA', 4, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2024-12-06 00:46:33', '2024-12-06 00:46:33'),
(60, 45, 'RESERVA', 50, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-08 02:27:33', '2025-03-08 02:27:33'),
(61, 46, 'RESERVA', 30, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-08 02:27:48', '2025-03-08 02:27:48'),
(62, 45, 'RESERVA', 10, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-08 02:30:11', '2025-03-08 02:30:11'),
(63, 45, 'RESERVA', 0, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-08 02:32:19', '2025-03-08 02:32:19'),
(64, 45, 'CANCELACION', 0, 'CANCELADO', 'CANCELADO', 'Cancelación del proyecto', NULL, '2025-03-08 02:37:43', '2025-03-08 02:37:43'),
(65, 46, 'CANCELACION', 0, 'CANCELADO', 'CANCELADO', 'Cancelación del proyecto', NULL, '2025-03-08 02:37:43', '2025-03-08 02:37:43'),
(66, 47, 'RESERVA', 50, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-08 02:41:48', '2025-03-08 02:41:48'),
(67, 48, 'RESERVA', 10, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-08 02:41:48', '2025-03-08 02:41:48'),
(68, 49, 'RESERVA', 20, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-08 03:25:22', '2025-03-08 03:25:22'),
(69, 49, 'MODIFICACION', 0, 'RESERVADO', 'PENDIENTE', 'Liberación de reserva', NULL, '2025-03-08 03:26:25', '2025-03-08 03:26:25'),
(70, 49, 'ENTREGA', 20, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2025-03-08 03:27:02', '2025-03-08 03:27:02'),
(71, 50, 'RESERVA', 20, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-08 04:07:54', '2025-03-08 04:07:54'),
(72, 50, 'RESERVA', 30, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-08 04:08:05', '2025-03-08 04:08:05'),
(73, 12, 'ENTREGA', 5, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2025-03-09 03:25:44', '2025-03-09 03:25:44'),
(74, 13, 'ENTREGA', 10, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2025-03-09 03:25:44', '2025-03-09 03:25:44'),
(75, 14, 'ENTREGA', 10, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2025-03-09 03:25:44', '2025-03-09 03:25:44'),
(76, 15, 'ENTREGA', 5, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2025-03-09 03:25:44', '2025-03-09 03:25:44'),
(77, 51, 'ENTREGA', 8, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2025-03-09 03:30:31', '2025-03-09 03:30:31'),
(78, 52, 'ENTREGA', 90, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2025-03-09 03:30:31', '2025-03-09 03:30:31'),
(79, 53, 'RESERVA', 10, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-09 03:49:57', '2025-03-09 03:49:57'),
(80, 54, 'RESERVA', 10, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-09 03:50:20', '2025-03-09 03:50:20'),
(81, 53, 'ENTREGA', 10, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2025-03-09 03:51:04', '2025-03-09 03:51:04'),
(82, 54, 'ENTREGA', 10, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2025-03-09 03:51:04', '2025-03-09 03:51:04'),
(83, 56, 'RESERVA', 10, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-09 04:33:24', '2025-03-09 04:33:24'),
(84, 55, 'ENTREGA', 100, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-09 04:35:22', '2025-03-09 04:35:22'),
(85, 56, 'ENTREGA', 30, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-09 04:35:22', '2025-03-09 04:35:22'),
(86, 57, 'RESERVA', 20, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-09 04:37:48', '2025-03-09 04:37:48'),
(87, 57, 'ENTREGA', 20, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-09 04:38:19', '2025-03-09 04:38:19'),
(88, 58, 'RESERVA', 10, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-09 05:03:00', '2025-03-09 05:03:00'),
(89, 58, 'ENTREGA', 10, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-09 05:03:42', '2025-03-09 05:03:42'),
(90, 59, 'ENTREGA', 5, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-09 05:19:43', '2025-03-09 05:19:43'),
(91, 60, 'ENTREGA', 5, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-09 05:19:43', '2025-03-09 05:19:43'),
(92, 61, 'ENTREGA', 10, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-11 02:46:17', '2025-03-11 02:46:17'),
(93, 62, 'ENTREGA', 5, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-11 03:24:40', '2025-03-11 03:24:40'),
(94, 63, 'ENTREGA', 10, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-11 03:24:40', '2025-03-11 03:24:40'),
(95, 64, 'RESERVA', 5, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-11 03:36:48', '2025-03-11 03:36:48'),
(96, 65, 'RESERVA', 5, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-11 03:36:48', '2025-03-11 03:36:48'),
(97, 64, 'ENTREGA', 5, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-11 03:37:12', '2025-03-11 03:37:12'),
(98, 65, 'ENTREGA', 5, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-11 03:37:12', '2025-03-11 03:37:12'),
(99, 66, 'ENTREGA', 1, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2025-03-11 04:17:50', '2025-03-11 04:17:50'),
(100, 68, 'ENTREGA', 1, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2025-03-11 04:52:55', '2025-03-11 04:52:55'),
(101, 70, 'ENTREGA', 1, 'EN_PROCESO', 'EN_PROCESO', NULL, NULL, '2025-03-11 05:07:07', '2025-03-11 05:07:07'),
(102, 70, 'ENTREGA', 2, 'EN_PROCESO', 'EN_PROCESO', NULL, NULL, '2025-03-11 05:07:57', '2025-03-11 05:07:57'),
(103, 70, 'ENTREGA', 1, 'EN_PROCESO', 'EN_PROCESO', NULL, NULL, '2025-03-11 05:10:15', '2025-03-11 05:10:15'),
(104, 71, 'ENTREGA', 1, 'EN_PROCESO', 'EN_PROCESO', NULL, NULL, '2025-03-11 05:12:28', '2025-03-11 05:12:28'),
(105, 69, 'ENTREGA', 1, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2025-03-11 05:20:59', '2025-03-11 05:20:59'),
(106, 67, 'ENTREGA', 1, 'ENTREGADO', 'ENTREGADO', NULL, NULL, '2025-03-11 05:22:13', '2025-03-11 05:22:13'),
(107, 71, 'ENTREGA', 1, 'EN_PROCESO', 'EN_PROCESO', NULL, NULL, '2025-03-11 05:22:59', '2025-03-11 05:22:59'),
(108, 72, 'ENTREGA', 1, 'ENTREGADO', 'ENTREGADO', 'Entrega de productos', NULL, '2025-03-11 19:46:22', '2025-03-11 19:46:22'),
(109, 73, 'ENTREGA', 1, 'ENTREGADO', 'ENTREGADO', 'Entrega de productos', NULL, '2025-03-11 19:49:26', '2025-03-11 19:49:26'),
(110, 74, 'RESERVA', 1, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-11 20:32:42', '2025-03-11 20:32:42'),
(111, 74, 'MODIFICACION', 0, 'RESERVADO', 'PENDIENTE', 'Liberación de reserva', NULL, '2025-03-11 20:33:12', '2025-03-11 20:33:12'),
(112, 74, 'RESERVA', 1, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-11 20:33:31', '2025-03-11 20:33:31'),
(113, 74, 'ENTREGA', 1, 'ENTREGADO', 'ENTREGADO', 'Entrega de productos', NULL, '2025-03-11 20:33:52', '2025-03-11 20:33:52'),
(114, 75, 'RESERVA', 1, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-11 20:37:29', '2025-03-11 20:37:29'),
(115, 76, 'RESERVA', 1, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-11 20:37:29', '2025-03-11 20:37:29'),
(116, 75, 'ENTREGA', 1, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-11 20:37:37', '2025-03-11 20:37:37'),
(117, 76, 'ENTREGA', 1, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-11 20:37:37', '2025-03-11 20:37:37'),
(118, 77, 'RESERVA', 1, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-11 21:17:55', '2025-03-11 21:17:55'),
(119, 78, 'RESERVA', 1, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-11 21:17:55', '2025-03-11 21:17:55'),
(120, 77, 'ENTREGA', 1, 'ENTREGADO', 'ENTREGADO', 'Entrega de productos', NULL, '2025-03-11 21:18:22', '2025-03-11 21:18:22'),
(121, 77, 'RESERVA', 1, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-11 21:18:33', '2025-03-11 21:18:33'),
(122, 77, 'MODIFICACION', 0, 'RESERVADO', 'PENDIENTE', 'Liberación de reserva', NULL, '2025-03-11 21:18:37', '2025-03-11 21:18:37'),
(123, 78, 'ENTREGA', 1, 'ENTREGADO', 'ENTREGADO', 'Entrega de productos', NULL, '2025-03-11 21:20:46', '2025-03-11 21:20:46'),
(124, 79, 'RESERVA', 1, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-11 21:24:44', '2025-03-11 21:24:44'),
(125, 80, 'RESERVA', 1, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-11 21:24:44', '2025-03-11 21:24:44'),
(126, 79, 'ENTREGA', 1, 'ENTREGADO', 'ENTREGADO', 'Entrega de productos', NULL, '2025-03-11 21:25:07', '2025-03-11 21:25:07'),
(127, 80, 'ENTREGA', 1, 'ENTREGADO', 'ENTREGADO', 'Entrega de productos', NULL, '2025-03-11 21:38:55', '2025-03-11 21:38:55'),
(128, 81, 'RESERVA', 1, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-12 01:34:40', '2025-03-12 01:34:40'),
(129, 82, 'RESERVA', 1, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-12 01:34:40', '2025-03-12 01:34:40'),
(130, 81, 'MODIFICACION', 0, 'RESERVADO', 'PENDIENTE', 'Liberación de reserva', NULL, '2025-03-12 01:35:10', '2025-03-12 01:35:10'),
(131, 82, 'MODIFICACION', 0, 'RESERVADO', 'PENDIENTE', 'Liberación de reserva', NULL, '2025-03-12 01:35:13', '2025-03-12 01:35:13'),
(132, 81, 'RESERVA', 1, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-12 01:35:33', '2025-03-12 01:35:33'),
(133, 82, 'RESERVA', 1, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-12 01:35:36', '2025-03-12 01:35:36'),
(134, 81, 'ENTREGA', 1, 'ENTREGADO', 'ENTREGADO', 'Entrega de productos', NULL, '2025-03-12 01:36:07', '2025-03-12 01:36:07'),
(135, 82, 'ENTREGA', 1, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-12 01:36:31', '2025-03-12 01:36:31'),
(136, 83, 'RESERVA', 1, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-17 16:00:57', '2025-03-17 16:00:57'),
(137, 83, 'MODIFICACION', 0, 'RESERVADO', 'PENDIENTE', 'Liberación de reserva', NULL, '2025-03-17 16:01:15', '2025-03-17 16:01:15'),
(138, 83, 'RESERVA', 2, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-17 16:01:20', '2025-03-17 16:01:20'),
(139, 87, 'RESERVA', 1, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-17 16:38:08', '2025-03-17 16:38:08'),
(140, 88, 'RESERVA', 1, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-17 16:44:40', '2025-03-17 16:44:40'),
(141, 91, 'RESERVA', 12, 'RESERVADO', 'RESERVADO', 'Reserva adicional', NULL, '2025-03-21 01:52:38', '2025-03-21 01:52:38'),
(142, 94, 'RESERVA', 5, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-22 07:02:10', '2025-03-22 07:02:10'),
(143, 94, 'ENTREGA', 5, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-22 07:04:49', '2025-03-22 07:04:49'),
(144, 95, 'RESERVA', 3, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-22 21:27:05', '2025-03-22 21:27:05'),
(145, 95, 'ENTREGA', 3, 'ENTREGADO', 'ENTREGADO', 'Entrega de productos', NULL, '2025-03-22 21:28:03', '2025-03-22 21:28:03'),
(146, 97, 'RESERVA', 4, 'PENDIENTE', 'RESERVADO', 'Reserva inicial al crear proyecto', NULL, '2025-03-22 21:49:53', '2025-03-22 21:49:53'),
(147, 97, 'ENTREGA', 4, 'ENTREGADO', 'ENTREGADO', NULL, 7, '2025-03-22 21:51:33', '2025-03-22 21:51:33');

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
  `activo` tinyint(1) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `activo`, `createdAt`, `updatedAt`) VALUES
(1, 'test', 'test@gmail.com', '$2a$10$bUQ3n9L5hBoT1HI1eWF6yeVGndrT6UJ2AlJbCyCFwzzZzEA/06huy', 'administrador', 1, '2024-11-18 20:00:51', '2024-11-18 20:00:51'),
(7, 'Administrador', 'admin@gmail.com', '$2a$10$vSAgQ4p/Ejc7ArHW8isXxuRw/EHeQZbvkDg5InBIzTSFjYaD.ebC2', 'administrador', 1, '2024-12-03 15:58:07', '2024-12-03 16:01:23'),
(8, 'Empleado', 'empleado@gmail.com', '$2a$10$aJlLXMXKI24oa7zhIzAFTuzdMRQ5.2Y0WMEt.VUbLQpT7ZFg9TeTm', 'vendedor', 1, '2024-12-03 15:58:44', '2025-03-23 01:39:45'),
(12, 'testedit', 'testedit@gmail.com', '$2a$10$GwSmOU2IRvBNrCqz8U2KfugtkIjLsfFZXRJxXmVEfjtblTIioswJ2', 'vendedor', 1, '2025-03-07 06:03:25', '2025-03-07 06:04:09'),
(13, 'vendedor', 'vendedor@gmail.com', '$2a$10$bANG8De3SattEswGKyFRMeaMBJhJHI0syqFaBgvEUgugAcUJxnbmG', 'vendedor', 1, '2025-03-07 06:38:40', '2025-03-07 06:38:40'),
(14, 'pruebadelete', 'pruebadelete@gmail.com', '$2a$10$woOK.6oD1jroxAq8wSDrFuVvCwXkAKBY9/onPdOWd4KzJosWjzFCa', 'vendedor', 0, '2025-03-21 06:19:20', '2025-03-21 06:21:33'),
(15, 'prueba relaciones', 'pr@gmail.com', '$2a$10$LlKfd/zT3eAAFc1Fq4rmrudor7N.gB/Mwekewur376ExB3.G3UGK6', 'vendedor', 1, '2025-03-21 06:22:42', '2025-03-22 04:40:19'),
(16, 'mejora usuario edit', 'mejora_usuarioedit@gmail.com', '$2a$10$l1RwO2ALJqrRg2hsicSKlef8buf/bmGmItK6zLqm6xIvi0jCy6UY2', 'vendedor', 0, '2025-03-22 06:56:22', '2025-03-22 07:55:26');

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
-- Indices de la tabla `inventory_histories`
--
ALTER TABLE `inventory_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `inventory_histories`
--
ALTER TABLE `inventory_histories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT de la tabla `inventory_out_products`
--
ALTER TABLE `inventory_out_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT de la tabla `invouts`
--
ALTER TABLE `invouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT de la tabla `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT de la tabla `project_products`
--
ALTER TABLE `project_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT de la tabla `project_product_histories`
--
ALTER TABLE `project_product_histories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=148;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `inventory_histories`
--
ALTER TABLE `inventory_histories`
  ADD CONSTRAINT `inventory_histories_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_histories_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

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
