-- Le Relais Web — table utilisateurs (auth)
-- À exécuter sur votre base MySQL (Hostinger phpMyAdmin ou drizzle-kit push).

CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `prenom` VARCHAR(80) NOT NULL,
  `nom_famille` VARCHAR(80) NULL,
  `nom_enseigne` VARCHAR(120) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `mot_de_passe` VARCHAR(255) NOT NULL,
  `secteur_activite` VARCHAR(120) NULL,
  `role` ENUM('client','admin') NOT NULL DEFAULT 'client',
  `paiement_confirme` BOOLEAN NOT NULL DEFAULT FALSE,
  `date_inscription` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
