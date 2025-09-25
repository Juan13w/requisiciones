-- Add estado column to requisicion table if it doesn't exist
ALTER TABLE `requisicion` 
ADD COLUMN IF NOT EXISTS `estado` VARCHAR(20) NOT NULL DEFAULT 'pendiente' 
AFTER `cantidad`;

-- Update existing rows to have a default estado
UPDATE `requisicion` SET `estado` = 'pendiente' WHERE `estado` IS NULL;

-- Verify the table structure
DESCRIBE `requisicion`;
