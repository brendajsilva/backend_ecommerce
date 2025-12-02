-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: db_ecommerce
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `enderecos`
--

DROP TABLE IF EXISTS `enderecos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enderecos` (
  `codEndereco` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `cep` varchar(9) NOT NULL,
  `logradouro` varchar(70) NOT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(70) NOT NULL,
  `localidade` varchar(70) NOT NULL,
  `uf` varchar(2) NOT NULL,
  `numero` varchar(12) NOT NULL,
  `apelido` varchar(50) DEFAULT NULL,
  `is_principal` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`codEndereco`),
  KEY `idUsuario` (`idUsuario`),
  CONSTRAINT `enderecos_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`codUsuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enderecos`
--

LOCK TABLES `enderecos` WRITE;
/*!40000 ALTER TABLE `enderecos` DISABLE KEYS */;
INSERT INTO `enderecos` VALUES (1,3,'88220-000','Rua Francisca Pasarelli','apto401','Casa Branca','PORTO BELO','SC','38','Casa',0,'2025-12-01 10:59:42','2025-12-01 10:59:42');
/*!40000 ALTER TABLE `enderecos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entregas`
--

DROP TABLE IF EXISTS `entregas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entregas` (
  `codEntrega` int NOT NULL AUTO_INCREMENT,
  `idPedido` int NOT NULL,
  `dataEstimada` date DEFAULT NULL,
  `dataEntrega` datetime DEFAULT NULL,
  `codigoRastreio` varchar(50) DEFAULT NULL,
  `transportadora` varchar(50) DEFAULT NULL,
  `statusEntrega` enum('AGUARDANDO_ENVIO','EM_TRANSITO','SAIU_PARA_ENTREGA','ENTREGUE','EXTRAVIADO','DEVOLVIDO') NOT NULL DEFAULT 'AGUARDANDO_ENVIO',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`codEntrega`),
  UNIQUE KEY `idPedido` (`idPedido`),
  UNIQUE KEY `codigoRastreio` (`codigoRastreio`),
  CONSTRAINT `entregas_ibfk_1` FOREIGN KEY (`idPedido`) REFERENCES `pedidos` (`codPedido`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregas`
--

LOCK TABLES `entregas` WRITE;
/*!40000 ALTER TABLE `entregas` DISABLE KEYS */;
/*!40000 ALTER TABLE `entregas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estoques`
--

DROP TABLE IF EXISTS `estoques`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estoques` (
  `codEstoque` int NOT NULL AUTO_INCREMENT,
  `idProduto` int NOT NULL,
  `quantidade_atual` int DEFAULT '0',
  `quantidade_minima` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`codEstoque`),
  UNIQUE KEY `idProduto` (`idProduto`),
  CONSTRAINT `estoques_ibfk_1` FOREIGN KEY (`idProduto`) REFERENCES `produtos` (`codProduto`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estoques`
--

LOCK TABLES `estoques` WRITE;
/*!40000 ALTER TABLE `estoques` DISABLE KEYS */;
INSERT INTO `estoques` VALUES (1,1,10,2,'2025-11-28 10:22:49','2025-11-28 10:22:49'),(2,2,10,2,'2025-11-28 10:22:49','2025-11-28 10:22:49'),(3,3,10,2,'2025-11-28 10:22:49','2025-11-28 10:22:49'),(4,4,10,2,'2025-11-28 10:22:49','2025-11-28 10:22:49'),(5,5,10,2,'2025-11-28 10:22:49','2025-11-28 10:22:49');
/*!40000 ALTER TABLE `estoques` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itens_pedidos`
--

DROP TABLE IF EXISTS `itens_pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itens_pedidos` (
  `codItemPedido` int NOT NULL AUTO_INCREMENT,
  `idPedido` int NOT NULL,
  `idProduto` int NOT NULL,
  `quantidade` int NOT NULL DEFAULT '1',
  `precoUnitario` decimal(10,2) NOT NULL,
  `valorTotalItem` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`codItemPedido`),
  UNIQUE KEY `itens_pedidos_id_pedido_id_produto` (`idPedido`,`idProduto`),
  KEY `idProduto` (`idProduto`),
  CONSTRAINT `itens_pedidos_ibfk_1` FOREIGN KEY (`idPedido`) REFERENCES `pedidos` (`codPedido`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `itens_pedidos_ibfk_2` FOREIGN KEY (`idProduto`) REFERENCES `produtos` (`codProduto`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itens_pedidos`
--

LOCK TABLES `itens_pedidos` WRITE;
/*!40000 ALTER TABLE `itens_pedidos` DISABLE KEYS */;
/*!40000 ALTER TABLE `itens_pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `codPedido` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `idEndereco` int DEFAULT NULL,
  `dataPedido` datetime NOT NULL,
  `status` enum('PENDENTE_PAGAMENTO','PROCESSANDO_PAGAMENTO','PAGO','SEPARACAO_ESTOQUE','ENVIADO','ENTREGUE','CANCELADO') NOT NULL DEFAULT 'PENDENTE_PAGAMENTO',
  `valorSubtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `valorFrete` decimal(10,2) NOT NULL DEFAULT '0.00',
  `valorTotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `metodoPagamento` enum('CARTAO_CREDITO','PIX','BOLETO','DEBITO_ONLINE','CARTEIRA_DIGITAL') DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`codPedido`),
  KEY `idUsuario` (`idUsuario`),
  KEY `idEndereco` (`idEndereco`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`codUsuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`idEndereco`) REFERENCES `enderecos` (`codEndereco`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produtos`
--

DROP TABLE IF EXISTS `produtos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produtos` (
  `codProduto` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text,
  `modelo` varchar(50) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `imagem_url` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`codProduto`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produtos`
--

LOCK TABLES `produtos` WRITE;
/*!40000 ALTER TABLE `produtos` DISABLE KEYS */;
INSERT INTO `produtos` VALUES (1,'BMW S1000RR','Superbike alemã com motor 4 cilindros em linha de 999cc, 207 HP e 113 Nm de torque. Equipada com ABS, controle de tração, quickshifter e suspensão ajustável. Peso: 197kg.','S1000RR',82000.00,'/frontend/images/bmws1000rr.png',1,'2025-11-28 10:22:49','2025-11-28 10:22:49'),(2,'Ducati Diavel V4','Power cruiser italiana com motor V4 Granturismo de 1158cc, 168 HP e 127 Nm de torque. Design agressivo, suspensão ajustável e freios Brembo. Peso: 218kg.','Diavel V4',95000.00,'/frontend/images/DucatiDiavel.png',1,'2025-11-28 10:22:49','2025-11-28 10:22:49'),(3,'Ducati Panigale V4S','Superbike italiana com motor V4 de 1103cc, 214 HP e 124 Nm de torque. Equipada com winglets aerodinâmicos, Öhlins ajustável e quickshifter. Peso: 198kg.','Panigale V4S',125000.00,'/frontend/images/ducativ4s.png',1,'2025-11-28 10:22:49','2025-11-28 10:22:49'),(4,'Kawasaki Ninja H2R','Hyperbike japonesa com motor 4 cilindros supercharged de 998cc, 310 HP e 165 Nm de torque. Aceleração de 0-100km/h em 2.5s. Peso: 216kg.','Ninja H2R',135000.00,'/frontend/images/h2r.png',1,'2025-11-28 10:22:49','2025-11-28 10:22:49'),(5,'Kawasaki Z1000','Naked sport japonesa com motor 4 cilindros em linha de 1043cc, 142 HP e 111 Nm de torque. Equipada com ABS, controle de tração e quickshifter. Peso: 221kg.','Z1000',78000.00,'/frontend/images/z1000.png',1,'2025-11-28 10:22:49','2025-11-28 10:22:49');
/*!40000 ALTER TABLE `produtos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `codUsuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(80) NOT NULL,
  `nome_completo` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `cpf` varchar(14) NOT NULL,
  `identidade` varchar(20) DEFAULT NULL,
  `tipo_usuario` enum('CLIENTE','ADMIN') NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`codUsuario`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `cpf` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin','Administrador do Sistema','admin@motostore.com','$2b$10$LHFlrCM9G/YM.IjWN/57muAcRNrHpD/z88Gz9NVhfYEKZRDpV7oeq','(11) 99999-9999','00000000000',NULL,'ADMIN','2025-11-28 10:22:49','2025-11-28 10:22:49'),(2,'Brenda','Brenda Julya de Souza Freitas da Silva','admin@performace.com','$2b$10$cEY326VFowJ0hahDXJSJ8u3CFa.3CWkI3PXBM2/LTWeQBog.VSyP6','47984065226','057.072.670-00',NULL,'CLIENTE','2025-11-28 10:23:31','2025-11-28 10:23:31'),(3,'prisciladsouza578@gmail.com','PRISCILA DE SOUZA','prisciladsouza578@gmail.com','$2b$10$lRR3jCrgMaMWB./uc0f1q.K.EittOC5kznXCvCUwxaB.r9.Gc3gZq','+5547996414038','013.911.990-65',NULL,'CLIENTE','2025-12-01 10:46:14','2025-12-01 10:46:14');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-02  9:39:05
