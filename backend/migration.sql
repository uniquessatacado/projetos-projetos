CREATE DATABASE IF NOT EXISTS projetos;
USE projetos;

CREATE TABLE IF NOT EXISTS `projetos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(255) NOT NULL,
  `cliente_nome` VARCHAR(255) NOT NULL,
  `descricao` TEXT,
  `status` ENUM('rascunho', 'analise', 'em_desenvolvimento', 'concluido') DEFAULT 'rascunho',
  `prazo_estimado_dias` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `funcionalidades` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `projeto_id` INT NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `descricao` TEXT,
  `complexidade` ENUM('simples', 'moderada', 'complexa', 'muito_complexa') NOT NULL,
  `tempo_estimado_horas` INT NOT NULL,
  `categoria` VARCHAR(100),
  `ordem` INT DEFAULT 0,
  FOREIGN KEY (`projeto_id`) REFERENCES `projetos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;