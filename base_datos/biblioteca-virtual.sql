-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         8.0.30 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para auth_db_1
CREATE DATABASE IF NOT EXISTS `auth_db_1` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `auth_db_1`;

-- Volcando estructura para tabla auth_db_1.generos
CREATE TABLE IF NOT EXISTS `generos` (
  `id_genero` int NOT NULL AUTO_INCREMENT,
  `nombre_genero` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `estado_genero` int DEFAULT NULL,
  PRIMARY KEY (`id_genero`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla auth_db_1.generos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla auth_db_1.historial_inicio_sesion
CREATE TABLE IF NOT EXISTS `historial_inicio_sesion` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `fecha_hora` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `dispositivo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id_historial`) USING BTREE,
  KEY `ID_USUARIO` (`id_usuario`) USING BTREE,
  CONSTRAINT `historial_inicio_sesion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla auth_db_1.historial_inicio_sesion: ~0 rows (aproximadamente)

-- Volcando estructura para tabla auth_db_1.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `estado_rol` int DEFAULT NULL,
  PRIMARY KEY (`id_rol`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla auth_db_1.roles: ~0 rows (aproximadamente)
INSERT INTO `roles` (`id_rol`, `nombre_rol`, `estado_rol`) VALUES
	(3, 'Administrador', 1);

-- Volcando estructura para tabla auth_db_1.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT 'N/A',
  `apellido` varchar(100) DEFAULT 'N/A',
  `correo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `contrasena` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `estado_usuario` int DEFAULT NULL,
  `id_rol` int DEFAULT NULL,
  `id_genero` int DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `codigo_otp` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `vencimiento_otp` datetime DEFAULT NULL,
  PRIMARY KEY (`id_usuario`) USING BTREE,
  UNIQUE KEY `CORREO` (`correo`) USING BTREE,
  KEY `ID_ROL` (`id_rol`) USING BTREE,
  KEY `ID_GENERO` (`id_genero`) USING BTREE,
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`id_genero`) REFERENCES `generos` (`id_genero`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla auth_db_1.usuarios: ~5 rows (aproximadamente)
INSERT INTO `usuarios` (`id_usuario`, `nombre`, `apellido`, `correo`, `contrasena`, `estado_usuario`, `id_rol`, `id_genero`, `telefono`, `fecha_registro`, `codigo_otp`, `vencimiento_otp`) VALUES
	(32, 'N/A', 'N/A', 'jerome.jimenez765@gmail.com', '$2b$10$37QI/iiMgrBOs/mWBwqjHeulYtlI1wX0OlgpF9dabPEHPvgNUriHW', NULL, 3, NULL, NULL, '2025-06-10 19:27:34', NULL, NULL),
	(33, 'N/A', 'N/A', 'Juan@gmail.com', '$2b$10$3qSi.VFcjEm6485fAcwVP.Mo7Td5Ugdv7VojJc5.F9vZVRlsc69Py', NULL, 3, NULL, NULL, '2025-06-11 16:30:43', NULL, NULL),
	(36, 'cindy', 'torrez', 'cindy.torrez.lopez@gmail.com', '$2b$10$3LGGC2Vlblavpj8K.iGZVOc2c5OvHQzkLDGTC2g0ezBtNqTl4BgE.', NULL, NULL, NULL, '76545342', '2025-06-12 21:42:40', NULL, NULL),
	(37, 'N/A', 'N/A', 'karcito@gmail.com', '$2b$10$cr5BwhuOqujaLEmSyGH6feeHN13pxaXAK.CJkTB7sLXQ0whGN9jQu', NULL, NULL, NULL, NULL, '2025-06-12 22:35:44', NULL, NULL),
	(38, 'N/A', 'N/A', 'jarroyos@univalle.edu', '$2b$10$Dz13.cr/VxDJHkCqtEuGz.NWUsBeTWvKkr9lQZlWTez3LJdnRvLri', NULL, NULL, NULL, NULL, '2025-06-12 23:37:24', '224719', '2025-06-12 23:47:40'),
	(39, 'inge alfredo', 'arroyo', 'jalfredo.arroyo@gmail.com', '$2b$10$ovIV6nRDGcq9QPH3mluXe.KSE6axMr7cFRByQd4lI0U26m5aG6RGy', NULL, NULL, NULL, '76582514', '2025-06-12 23:56:08', NULL, NULL),
	(40, 'N/A', 'N/A', 'Juan.Perez@gmail.com', '$2b$10$AAppvJS62eJnjHGWFIipOO8yw7mUS48Jxj7PDeiVEOmckJRqKjkUO', NULL, NULL, NULL, NULL, '2025-06-16 03:14:14', NULL, NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
