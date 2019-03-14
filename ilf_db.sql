-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le :  mer. 13 mars 2019 à 21:19
-- Version du serveur :  5.7.23
-- Version de PHP :  7.2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `ilf_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `customers`
--

DROP TABLE IF EXISTS `customers`;
CREATE TABLE IF NOT EXISTS `customers` (
  `Customer_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Customer_Surname` varchar(255) NOT NULL,
  `Customer_Name` varchar(255) NOT NULL,
  `Customer_Mail` varchar(255) NOT NULL,
  `Customer_SIRET` varchar(255) NOT NULL,
  PRIMARY KEY (`Customer_ID`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `customers`
--

INSERT INTO `customers` (`Customer_ID`, `Customer_Surname`, `Customer_Name`, `Customer_Mail`, `Customer_SIRET`) VALUES
(1, 'Robert Piolo', 'Carrefour', 'Robert.Piolo@gmail.com', '45132133500023'),
(2, 'Frederic Bellon', 'Auchan', 'Frederic.Bellon@gmail.com', '41040946000756');

-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `LTA_ID` int(11) NOT NULL,
  `Customer` varchar(255) NOT NULL,
  `Provider` varchar(255) NOT NULL,
  `Description` varchar(255) NOT NULL DEFAULT 'Aucun commentaire',
  `Attachment` varchar(255) NOT NULL DEFAULT 'Aucune pièce jointe',
  `Current_State` varchar(255) NOT NULL DEFAULT 'En cours',
  `Date_Purchase` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Delivery` timestamp NOT NULL
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `orders`
--

INSERT INTO `orders` (`LTA_ID`, `Customer`, `Provider`, `Description`, `Attachment`, `Current_State`, `Date_Purchase`, `Delivery`) VALUES
(14349768, 'Auchan', 'Disgroup', 'Aucun commentaire', './file/test.pdf', 'Erreur', '2019-02-20 23:00:00', '2019-02-27 23:00:00'),
(89289292, 'Carrefour', 'Disgroup', 'Aucun commentaire', './file/test.pdf', 'Fini', '2019-02-11 23:00:00', '2019-02-18 23:00:00'),
(60242105, 'Carrefour', 'Metro', 'Aucun commentaire', './file/test.pdf', 'Fini', '2019-01-17 23:00:00', '2019-01-24 23:00:00'),
(43482201, 'Auchan', 'Metro', 'Aucun commentaire', './file/test.pdf', 'En cours', '2019-03-07 23:00:00', '2019-03-14 23:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `orders_track`
--

DROP TABLE IF EXISTS `orders_track`;
CREATE TABLE IF NOT EXISTS `orders_track` (
  `LTA_ID` int(11) NOT NULL,
  `Next_State` int(11) NOT NULL,
  `Status` varchar(255) NOT NULL DEFAULT 'En cours',
  `Date_State` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `orders_track`
--

INSERT INTO `orders_track` (`LTA_ID`, `Next_State`, `Status`, `Date_State`) VALUES
(89289292, 4, 'En cours', '2019-02-16 00:00:00'),
(60242105, 1, 'En cours', '2019-01-19 00:00:00'),
(89289292, 1, 'En cours', '2019-02-13 00:00:00'),
(43482201, 0, 'En cours', '2019-03-08 00:00:00'),
(14349768, 2, 'En cours', '2019-02-23 00:00:00'),
(14349768, 1, 'En cours', '2019-02-22 00:00:00'),
(14349768, 3, 'Erreur', '2019-02-24 00:00:00'),
(60242105, 5, 'En cours', '2019-01-23 00:00:00'),
(14349768, 0, 'En cours', '2019-02-21 00:00:00'),
(43482201, 4, 'En cours', '2019-03-12 00:00:00'),
(43482201, 1, 'En cours', '2019-03-09 00:00:00'),
(43482201, 2, 'En cours', '2019-03-10 00:00:00'),
(60242105, 4, 'En cours', '2019-01-22 00:00:00'),
(60242105, 2, 'En cours', '2019-01-20 00:00:00'),
(89289292, 0, 'En cours', '2019-02-12 00:00:00'),
(60242105, 3, 'En cours', '2019-01-21 00:00:00'),
(60242105, 0, 'En cours', '2019-01-18 00:00:00'),
(89289292, 2, 'En cours', '2019-02-14 00:00:00'),
(43482201, 3, 'En cours', '2019-03-11 00:00:00'),
(60242105, 6, 'Fini', '2019-01-25 00:00:00'),
(89289292, 6, 'Fini', '2019-02-19 00:00:00'),
(89289292, 3, 'En cours', '2019-02-15 00:00:00'),
(89289292, 5, 'En cours', '2019-02-17 00:00:00'),
(43482201, 5, 'En cours', '2019-03-13 00:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `providers`
--

DROP TABLE IF EXISTS `providers`;
CREATE TABLE IF NOT EXISTS `providers` (
  `Provider_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Provider_Surname` varchar(255) NOT NULL,
  `Provider_Name` varchar(255) NOT NULL,
  `Provider_Mail` varchar(255) NOT NULL,
  `Provider_SIRET` varchar(255) NOT NULL,
  PRIMARY KEY (`Provider_ID`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `providers`
--

INSERT INTO `providers` (`Provider_ID`, `Provider_Surname`, `Provider_Name`, `Provider_Mail`, `Provider_SIRET`) VALUES
(1, 'Thierry Leboucq', 'Disgroup', 'Thierry.Leboucq@gmail.com', '69920093700034'),
(2, 'Philippe Palazzi', 'Metro', 'Philippe .Palazzi@gmail.com', '39931561300014');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
