-- =============================================================================
-- ACTUALIZACIÓN DE ESQUEMA - 2025-09-19
-- Agrega las columnas necesarias para la funcionalidad de rechazo parcial
-- y seguimiento de requisiciones.
-- =============================================================================

-- Asegúrate de estar usando la base de datos correcta
-- USE tu_base_de_datos;

ALTER TABLE `requisicion`
ADD COLUMN `estado` VARCHAR(20) NOT NULL DEFAULT 'pendiente' AFTER `imagenes`,
ADD COLUMN `comentarioRechazo` TEXT NULL DEFAULT NULL AFTER `estado`,
ADD COLUMN `intentosRevision` INT NOT NULL DEFAULT 0 AFTER `comentarioRechazo`,
ADD COLUMN `fechaUltimoRechazo` TIMESTAMP NULL DEFAULT NULL AFTER `intentosRevision`,
ADD COLUMN `fechaUltimaModificacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `fechaUltimoRechazo`;

-- =============================================================================
-- NOTAS:
-- 1. Este script asume que la tabla 'requisicion' ya existe.
-- 2. Se ha añadido `ON UPDATE CURRENT_TIMESTAMP` a `fechaUltimaModificacion` 
--    para que se actualice automáticamente cada vez que se modifica una fila.
-- 3. Si ya tienes una columna 'estado', este script podría fallar. 
--    En ese caso, elimina la primera línea `ADD COLUMN 'estado' ...` y vuelve a ejecutarlo.
-- =============================================================================

