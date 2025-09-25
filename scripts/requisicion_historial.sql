-- =============================================================================
-- SCRIPT: Crear tabla de historial para requisiciones
-- Fecha: 2025-09-19
-- =============================================================================

-- Ajusta el nombre de la base de datos si es necesario:
-- USE tu_base_de_datos;

CREATE TABLE IF NOT EXISTS `requisicion_historial` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `requisicion_id` INT NOT NULL,
  `estado` VARCHAR(20) NOT NULL,
  `comentario` TEXT NULL,
  `usuario` VARCHAR(255) NULL,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_historial_requisicion_id` (`requisicion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Opcional: poblar con eventos iniciales a partir de la tabla principal (si existen columnas)
-- INSERT INTO requisicion_historial (requisicion_id, estado, comentario)
-- SELECT requisicion_id, estado, comentario_rechazo FROM requisicion;
