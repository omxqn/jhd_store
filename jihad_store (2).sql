-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 25, 2026 at 11:46 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jihad_store`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `name_ar` varchar(200) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `sort_order`, `is_active`, `name_ar`, `image_url`) VALUES
(1, 'Thobes', 1, 1, 'ثياب', 'https://tse1.mm.bing.net/th/id/OIP.nVMzJiYWuMJsFjyUWRKGQQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3'),
(2, 'Abayas', 2, 1, 'عبايات', 'https://tse1.mm.bing.net/th/id/OIP.nVMzJiYWuMJsFjyUWRKGQQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3'),
(3, 'Bishts', 3, 1, 'بشوت', 'https://tse1.mm.bing.net/th/id/OIP.nVMzJiYWuMJsFjyUWRKGQQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3'),
(4, 'Kids', 4, 1, 'أطفال', 'https://tse1.mm.bing.net/th/id/OIP.nVMzJiYWuMJsFjyUWRKGQQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3'),
(9, 'Accessories', 5, 1, 'إكسسوارات', 'https://tse1.mm.bing.net/th/id/OIP.nVMzJiYWuMJsFjyUWRKGQQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3'),
(10, 'كولكشن العيد', 10, 1, NULL, 'https://cdn.files.salla.network/homepage/345024266/24602d38-7121-45a4-b1e1-91e89b524705.webp'),
(11, 'حـُب', 11, 1, NULL, 'https://cdn.files.salla.network/homepage/345024266/97a10aa2-e8f9-46f7-8232-2f9d6a7399a4.webp'),
(12, 'هدايا رمضانية', 12, 1, NULL, 'https://cdn.files.salla.network/homepage/345024266/f85a03ec-b725-4b8b-9415-7f40d93dca04.webp'),
(13, 'بوكيهات', 13, 1, NULL, 'https://cdn.files.salla.network/homepage/345024266/ef720203-7e8d-4bf5-9613-bf59af0f421a.webp'),
(14, 'الباقات الكبيرة', 14, 1, NULL, 'https://cdn.files.salla.network/homepage/345024266/abba7411-42ed-42ee-8bad-da80bbf00c20.webp'),
(15, 'هدايا التخرج', 15, 1, NULL, 'https://cdn.files.salla.network/homepage/345024266/536e9dc3-7306-48ab-8294-9368603bceef.webp'),
(16, 'مـــريلة', 16, 1, NULL, 'https://cdn.files.salla.network/homepage/345024266/3813a63c-e971-483b-b3b8-cdce0375af45.webp'),
(17, 'كروت الإهداء', 17, 1, NULL, 'https://cdn.files.salla.network/homepage/345024266/88bec2c5-1af2-49a1-80c0-2322306d2518.webp'),
(18, 'تشوكلت', 18, 1, NULL, 'https://cdn.files.salla.network/homepage/345024266/47f1b2ff-776e-44eb-9e2f-41b4ec17016e.webp'),
(19, 'مق وأكواب', 19, 1, NULL, 'https://cdn.files.salla.network/homepage/345024266/3d480338-3a60-475f-a76a-eaf4083d82a1.webp'),
(20, 'فايبي', 20, 1, NULL, 'https://cdn.files.salla.network/homepage/345024266/0478f71f-e122-462c-956a-4d4ccee3a275.webp'),
(21, 'فازات', 21, 1, NULL, 'https://cdn.files.salla.network/homepage/345024266/f9893909-8bee-445f-a57b-e700122fe80d.webp');

-- --------------------------------------------------------

--
-- Table structure for table `neckline_shapes`
--

CREATE TABLE `neckline_shapes` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `neckline_shapes`
--

INSERT INTO `neckline_shapes` (`id`, `name`, `image_url`, `sort_order`, `created_at`) VALUES
(1, 'Classic Round', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70', 1, '2026-03-06 02:13:31'),
(2, 'Mandarin Collar', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=70', 1, '2026-03-06 02:20:44'),
(3, 'V-Neck', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&q=70', 2, '2026-03-06 02:21:13');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `type` enum('order','announcement') NOT NULL,
  `message` text NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `message`, `order_id`, `read`, `created_at`) VALUES
(1, 2, 'order', 'Your Order #2 has been paid', 2, 1, '2026-03-05 19:48:14'),
(2, 1, 'order', 'Your Order #3 has been paid', 3, 0, '2026-03-05 22:54:33'),
(3, 2, 'order', 'Your Order #4 has been paid', 4, 1, '2026-03-05 23:12:25'),
(4, 2, 'order', 'Your Order #4 is being processed', 4, 1, '2026-03-05 23:14:06'),
(5, 2, 'order', 'Your Order #4 has been shipped', 4, 1, '2026-03-05 23:17:50'),
(6, 2, 'order', 'Your Order #4 is being processed', 4, 1, '2026-03-05 23:18:16'),
(7, 2, 'order', 'Your Order #4 has been shipped', 4, 1, '2026-03-05 23:19:05'),
(8, 2, 'order', 'Your Order #5 has been paid', 5, 1, '2026-03-05 23:19:54'),
(9, 5, 'order', 'Your Order #6 has been paid', 6, 0, '2026-03-05 23:35:37'),
(10, 5, 'order', 'Your Order #6 is being processed', 6, 0, '2026-03-06 00:14:53'),
(11, 5, 'order', 'Your Order #6 is being processed', 6, 0, '2026-03-06 00:15:02'),
(12, 5, 'order', 'Your Order #6 has been refunded', 6, 0, '2026-03-06 00:15:30'),
(13, 5, 'order', 'Your Order #6 has been refunded', 6, 0, '2026-03-06 00:29:49'),
(14, 5, 'order', 'Your Order #6 has been refunded', 6, 0, '2026-03-06 00:29:55'),
(15, 5, 'order', 'Your Order #6 has been refunded', 6, 0, '2026-03-06 00:30:45'),
(16, 1, 'order', 'New Premium Order #7 from omx qn', 7, 0, '2026-03-06 00:34:55'),
(17, 2, 'order', 'New Premium Order #7 from omx qn', 7, 0, '2026-03-06 00:34:58'),
(18, 1, 'order', 'New Premium Order #8 from omx qn', 8, 0, '2026-03-06 00:35:29'),
(19, 2, 'order', 'New Premium Order #8 from omx qn', 8, 0, '2026-03-06 00:35:31'),
(20, 1, 'order', 'New Premium Order #9 from omx qn', 9, 0, '2026-03-06 01:30:18'),
(21, 2, 'order', 'New Premium Order #9 from omx qn', 9, 0, '2026-03-06 01:30:20'),
(22, 1, 'order', 'New Premium Order #10 from Ahmed ali', 10, 0, '2026-03-06 02:41:35'),
(23, 2, 'order', 'New Premium Order #10 from Ahmed ali', 10, 0, '2026-03-06 02:41:38'),
(24, 7, 'order', 'Your Order #10 has been shipped', 10, 1, '2026-03-06 02:43:07'),
(25, 7, 'order', 'Your Order #10 has been received', 10, 1, '2026-03-06 02:43:54'),
(26, 1, 'order', 'New Premium Order #11 from Ahmed Ali', 11, 0, '2026-03-07 11:19:59'),
(27, 2, 'order', 'New Premium Order #11 from Ahmed Ali', 11, 0, '2026-03-07 11:20:01'),
(28, 1, 'order', 'New Premium Order #15 from omxqn12', 15, 0, '2026-03-11 19:47:23'),
(29, 3, 'order', 'New Premium Order #15 from omxqn12', 15, 1, '2026-03-11 19:47:27'),
(30, 7, 'order', 'New Premium Order #15 from omxqn12', 15, 0, '2026-03-11 19:47:30'),
(31, 1, 'order', 'New Premium Order #16 from aasdasd', 16, 0, '2026-03-11 20:00:25'),
(32, 3, 'order', 'New Premium Order #16 from aasdasd', 16, 1, '2026-03-11 20:00:28'),
(33, 7, 'order', 'New Premium Order #16 from aasdasd', 16, 0, '2026-03-11 20:00:31'),
(34, 1, 'order', 'New Premium Order #17 from asdasd', 17, 0, '2026-03-11 20:16:16'),
(35, 3, 'order', 'New Premium Order #17 from asdasd', 17, 1, '2026-03-11 20:16:19'),
(36, 7, 'order', 'New Premium Order #17 from asdasd', 17, 0, '2026-03-11 20:16:21'),
(37, 1, 'order', 'New Premium Order #18 from Azzam Alkalbani', 18, 0, '2026-03-11 20:34:41'),
(38, 3, 'order', 'New Premium Order #18 from Azzam Alkalbani', 18, 1, '2026-03-11 20:34:44'),
(39, 7, 'order', 'New Premium Order #18 from Azzam Alkalbani', 18, 0, '2026-03-11 20:34:47'),
(40, 1, 'order', 'New Premium Order #19 from Azzam Alkalbani', 19, 0, '2026-03-11 21:29:07'),
(41, 3, 'order', 'New Premium Order #19 from Azzam Alkalbani', 19, 1, '2026-03-11 21:29:10'),
(42, 7, 'order', 'New Premium Order #19 from Azzam Alkalbani', 19, 0, '2026-03-11 21:29:13'),
(43, 1, 'order', 'New Premium Order #20 from Azzam Alkalbani', 20, 0, '2026-03-11 21:36:44'),
(44, 3, 'order', 'New Premium Order #20 from Azzam Alkalbani', 20, 1, '2026-03-11 21:36:47'),
(45, 7, 'order', 'New Premium Order #20 from Azzam Alkalbani', 20, 0, '2026-03-11 21:36:49'),
(46, 1, 'order', 'New Premium Order #21 from Azzam Alkalbani', 21, 0, '2026-03-11 22:00:44'),
(47, 3, 'order', 'New Premium Order #21 from Azzam Alkalbani', 21, 1, '2026-03-11 22:00:47'),
(48, 7, 'order', 'New Premium Order #21 from Azzam Alkalbani', 21, 0, '2026-03-11 22:00:49'),
(49, 3, 'order', 'Your Order #21 has been shipped', 21, 1, '2026-03-25 13:48:06'),
(50, 3, 'order', 'Your Order #20 has been shipped', 20, 1, '2026-03-25 14:36:05'),
(51, 3, '', 'Staff replied to your support ticket #10: اهلا', NULL, 1, '2026-03-25 14:45:40'),
(52, 3, '', 'Staff replied to your support ticket #10: اهلا', NULL, 1, '2026-03-25 14:52:26'),
(53, 3, '', 'Staff replied to your support ticket #9: عندي مشكلة', NULL, 1, '2026-03-25 14:59:57'),
(54, 3, '', 'Staff replied to your support ticket #9: عندي مشكلة', NULL, 1, '2026-03-25 15:04:06'),
(55, 3, '', 'Staff replied to your support ticket #11: werfwef', NULL, 1, '2026-03-25 15:11:13'),
(56, 3, '', 'Staff replied to your support ticket #12: test', NULL, 1, '2026-03-25 20:08:16'),
(57, 3, '', 'Staff replied to your support ticket #12: test', NULL, 1, '2026-03-25 20:08:31'),
(58, 3, '', 'Staff replied to your support ticket #12: test', NULL, 1, '2026-03-25 20:08:38'),
(59, 3, '', 'Staff replied to your support ticket #12: test', NULL, 1, '2026-03-25 20:08:43'),
(60, 3, '', 'Staff replied to your support ticket #12: test', NULL, 1, '2026-03-25 20:08:48'),
(61, 3, '', 'Staff replied to your support ticket #12: test', NULL, 1, '2026-03-25 20:55:05'),
(62, 3, '', 'Staff replied to your support ticket #12: test', NULL, 1, '2026-03-25 20:55:17');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `guest_email` varchar(200) DEFAULT NULL,
  `status` enum('refunded','paid','processing','shipped','delivered') DEFAULT 'paid',
  `subtotal` decimal(10,3) NOT NULL,
  `discount` decimal(10,3) DEFAULT 0.000,
  `total` decimal(10,3) NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(200) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `payment_method` varchar(30) DEFAULT 'thawani',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `refunded_amount` decimal(10,3) DEFAULT 0.000,
  `shipping_fee` decimal(10,3) DEFAULT 0.000,
  `voucher_code` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `guest_email`, `status`, `subtotal`, `discount`, `total`, `name`, `email`, `phone`, `address`, `city`, `payment_method`, `created_at`, `updated_at`, `refunded_amount`, `shipping_fee`, `voucher_code`) VALUES
(1, 2, 'omxn12@gmail.com', 'paid', 47.500, 0.000, 47.500, 'Azzam Alkalbani', 'omxn12@gmail.com', '90625671', 'Muscat', 'Muscat', 'thawani', '2026-03-05 19:36:59', '2026-03-05 19:48:58', 0.000, 0.000, NULL),
(2, 2, 'omxn12@gmail.com', 'paid', 43.000, 0.000, 43.000, 'Azzam Alkalbani', 'omxn12@gmail.com', '90625671', 'Ibri', 'Ibri', 'thawani', '2026-03-05 19:48:14', '2026-03-05 19:48:55', 0.000, 0.000, NULL),
(3, 1, NULL, 'paid', 228.000, 0.000, 228.000, 'Admin', 'admin@jihadstore.com', '90625671', 'muscat', 'Muscat', 'thawani', '2026-03-05 22:54:33', '2026-03-05 22:54:33', 0.000, 0.000, NULL),
(4, 2, NULL, 'shipped', 71.500, 0.000, 71.500, 'Ahmed Ali', 'azzam224411@gmail.com', '90625671', 'sdfsdfsdfsdf', 'Muscat', 'thawani', '2026-03-05 23:12:25', '2026-03-05 23:19:05', 0.000, 0.000, NULL),
(5, 2, NULL, 'paid', 22.000, 0.000, 22.000, 'Ahmed Ali', 'azzam224411@gmail.com', '', '', 'asd', 'thawani', '2026-03-05 23:19:54', '2026-03-05 23:19:54', 0.000, 0.000, NULL),
(6, 5, NULL, 'refunded', 18.500, 0.000, 18.500, 'omx qn', 'azzam224499@gmail.com', '4444444444444444', 'sdfsdf', 'dsfsdf', 'thawani', '2026-03-05 23:35:37', '2026-03-06 00:30:45', 18.000, 0.000, NULL),
(7, 5, NULL, 'processing', 12.000, 10.000, 2.000, 'omx qn', 'azzam224499@gmail.com', '4444444444444444', 'sdfsdf', 'dsfsdf', 'thawani', '2026-03-06 00:34:51', '2026-03-06 00:34:51', 0.000, 0.000, NULL),
(8, 5, NULL, 'processing', 18.500, 10.000, 8.500, 'omx qn', 'azzam224499@gmail.com', '4444444444444444', 'sdfsdf', 'dsfsdf', 'thawani', '2026-03-06 00:35:24', '2026-03-06 00:35:24', 0.000, 0.000, NULL),
(9, 5, NULL, 'processing', 35.000, 20.000, 15.000, 'omx qn', 'azzam224499@gmail.com', '4444444444444444', 'sdfsdf', 'ws', 'thawani', '2026-03-06 01:30:13', '2026-03-06 01:30:13', 0.000, 0.000, NULL),
(10, 7, NULL, 'refunded', 28.500, 2.000, 26.500, 'Ahmed ali', 'dr.jiihad@gmail.com', '95656565', 'asdasdasd', 'Muscat', 'thawani', '2026-03-06 02:41:30', '2026-03-06 02:44:29', 0.000, 0.000, NULL),
(11, 2, NULL, 'processing', 28.500, 0.000, 28.500, 'Ahmed Ali', 'azzam224411@gmail.com', '888', 'gfhgfhgg', 'muscat', 'thawani', '2026-03-07 11:19:54', '2026-03-07 11:19:54', 0.000, 0.000, NULL),
(12, 3, NULL, 'processing', 5.000, 0.000, 5.000, 'Ahmed Ali', 'omxn12@gmail.com', '', '', 's', 'thawani', '2026-03-10 16:31:11', '2026-03-11 20:31:53', 0.000, 0.000, NULL),
(13, 2, NULL, 'processing', 22.000, 0.000, 22.000, 'Ahmed Ali', 'azzam224411@gmail.com', '', '', 'y', 'thawani', '2026-03-10 16:33:12', '2026-03-10 16:33:12', 0.000, 0.000, NULL),
(14, 2, NULL, 'processing', 35.000, 0.000, 35.000, 'Ahmed Ali', 'azzam224411@gmail.com', '', '', 'hh', 'thawani', '2026-03-10 16:59:56', '2026-03-10 16:59:56', 0.000, 0.000, NULL),
(15, 8, NULL, 'processing', 28.500, 0.000, 28.500, 'omxqn12', 'omxqn12@gmail.com', '', '', 'c', 'thawani', '2026-03-11 19:47:18', '2026-03-11 19:47:18', 0.000, 0.000, NULL),
(16, 8, NULL, 'processing', 22.000, 0.000, 22.000, 'aasdasd', 'omxqn12@gmail.com', '90625671', 'dfsdfsdf', 'Muscat', 'thawani', '2026-03-11 20:00:20', '2026-03-11 20:00:20', 0.000, 0.000, NULL),
(17, 8, NULL, 'processing', 10.000, 0.000, 10.000, 'asdasd', 'omxqn12@gmail.com', '959595', 'asdasd', 'sad', 'thawani', '2026-03-11 20:16:11', '2026-03-11 20:16:11', 0.000, 0.000, NULL),
(18, 3, NULL, 'processing', 57.000, 0.000, 61.000, 'Azzam Alkalbani', 'omxqn12@gmail.com', '90625671', 'rrrrrrrrrrrrrrrrrrrrrrrrr', 'Muscat', 'thawani', '2026-03-11 20:34:36', '2026-03-11 20:34:36', 0.000, 4.000, NULL),
(19, 3, NULL, 'processing', 30.000, 20.000, 12.000, 'Azzam Alkalbani', 'omxqn12@gmail.com', '90625671', 'Muscat', 'Muscat', 'thawani', '2026-03-11 21:29:02', '2026-03-11 21:29:02', 0.000, 0.000, NULL),
(20, 3, NULL, 'shipped', 33.500, 20.000, 15.500, 'Azzam Alkalbani', 'omxqn12@gmail.com', '90625671', 'Muscat', 's', 'thawani', '2026-03-11 21:36:38', '2026-03-25 14:36:05', 0.000, 0.000, '3XOOW81DQ4MO'),
(21, 3, NULL, 'shipped', 15.000, 20.000, 0.000, 'Azzam Alkalbani', 'omxqn12@gmail.com', '90625671', 'Muscat', 'ss', 'thawani', '2026-03-11 22:00:39', '2026-03-25 13:48:06', 0.000, 2.000, 'DMDJ02EUREDT');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` varchar(20) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `price` decimal(10,3) NOT NULL,
  `quantity` int(11) NOT NULL,
  `fabric_type` varchar(100) DEFAULT NULL,
  `fabric_length` varchar(20) DEFAULT NULL,
  `neck_size` varchar(20) DEFAULT NULL,
  `neckline` varchar(100) DEFAULT NULL,
  `stitch` tinyint(1) DEFAULT 0,
  `stitch_price` decimal(10,3) DEFAULT 0.000,
  `accessories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`accessories`)),
  `accessories_price` decimal(10,3) DEFAULT 0.000,
  `tailor_measurements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tailor_measurements`)),
  `image` varchar(500) DEFAULT NULL,
  `shipping_cost` decimal(10,3) DEFAULT 0.000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `name`, `price`, `quantity`, `fabric_type`, `fabric_length`, `neck_size`, `neckline`, `stitch`, `stitch_price`, `accessories`, `accessories_price`, `tailor_measurements`, `image`, `shipping_cost`) VALUES
(1, 1, '003', 'Premium Abaya — Midnight Blue', 47.500, 1, 'Nida Fabric', '123', '55', 'Classic Round', 0, 0.000, '[\"Matching Hijab\",\"Belt (Embroidered)\",\"Crystal Brooch\"]', 12.500, '{}', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80', 0.000),
(2, 2, '003', 'Premium Abaya — Midnight Blue', 43.000, 1, 'Nida Fabric', '123', '22', 'Classic Round', 0, 0.000, '[\"Matching Hijab\",\"Crystal Brooch\"]', 8.000, '{}', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80', 0.000),
(3, 3, '005', 'Sport Thobe — Slim Fit', 18.500, 5, 'Polyester Blend', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80', 0.000),
(4, 3, '007', 'Luxury Bisht — Gold Trim', 85.000, 1, 'Wool Blend', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80', 0.000),
(5, 3, '002', 'Classic White Kandura', 22.000, 1, 'Egyptian Cotton', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600&q=80', 0.000),
(6, 3, '001', 'Royal Embroidered Thobe', 28.500, 1, 'Egyptian Cotton', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80', 0.000),
(7, 4, '002', 'Classic White Kandura', 22.000, 1, 'Egyptian Cotton', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600&q=80', 0.000),
(8, 4, '003', 'Premium Abaya — Midnight Blue', 49.500, 1, 'Crepe', '123', '22', 'Classic Round', 1, 5.000, '[\"Matching Hijab\",\"Belt (Embroidered)\"]', 9.500, '{\"Chest\":\"33\",\"Waist\":\"42\",\"Hips\":\"43\",\"Shoulder Width\":\"42\",\"Sleeve Length\":\"42\",\"Total Length\":\"432\"}', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80', 0.000),
(9, 5, '002', 'Classic White Kandura', 22.000, 1, 'Egyptian Cotton', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600&q=80', 0.000),
(10, 6, '005', 'Sport Thobe — Slim Fit', 18.500, 1, 'Polyester Blend', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80', 0.000),
(11, 7, '006', 'Kids Thobe — Celebration', 12.000, 1, 'Egyptian Cotton', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=600&q=80', 0.000),
(12, 8, '005', 'Sport Thobe — Slim Fit', 18.500, 1, 'Polyester Blend', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80', 0.000),
(13, 9, '003', 'Premium Abaya — Midnight Blue', 35.000, 1, 'Nida Fabric', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80', 0.000),
(14, 10, '001', 'Royal Embroidered Thobe', 28.500, 1, 'Egyptian Cotton', '22', '22', 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80', 0.000),
(15, 11, '001', 'Royal Embroidered Thobe', 28.500, 1, 'Egyptian Cotton', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80', 0.000),
(16, 12, '010', 'Abaya 1', 5.000, 1, 'Silk', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', '/uploads/1772765377347-zz89h1jdam.jpg', 0.000),
(17, 13, '002', 'Classic White Kandura', 22.000, 1, 'Egyptian Cotton', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600&q=80', 0.000),
(18, 14, '003', 'Premium Abaya — Midnight Blue', 35.000, 1, 'Nida Fabric', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80', 0.000),
(19, 15, '001', 'Royal Embroidered Thobe', 28.500, 1, 'Egyptian Cotton', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80', 0.000),
(20, 16, '002', 'Classic White Kandura', 22.000, 1, 'Egyptian Cotton', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600&q=80', 0.000),
(21, 17, '009', 'a', 10.000, 1, 'Wool Blend', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', '/uploads/1772761448442-h55xxjyobnv.png', 0.000),
(22, 18, '001', 'Royal Embroidered Thobe', 28.500, 2, 'Egyptian Cotton', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80', 2.000),
(23, 19, '011', 'Test Item', 15.000, 2, 'Default', NULL, NULL, 'Default', 0, 0.000, '[\"None\"]', 0.000, '{}', '/uploads/1773261891542-g8s9w03omnw.jpeg', 2.000),
(24, 20, '010', 'Abaya 1', 5.000, 1, 'Default', NULL, NULL, 'Default', 0, 0.000, '[\"None\"]', 0.000, '{}', '/uploads/1772765377347-zz89h1jdam.jpg', 2.000),
(25, 20, '001', 'Royal Embroidered Thobe', 28.500, 1, 'Default', NULL, NULL, 'Default', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80', 2.000),
(26, 21, '011', 'Test Item', 15.000, 1, 'Default', NULL, NULL, 'Default', 0, 0.000, '[\"None\"]', 0.000, '{}', '/uploads/1773261891542-g8s9w03omnw.jpeg', 2.000);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(20) NOT NULL,
  `name` varchar(200) NOT NULL,
  `category` varchar(100) NOT NULL,
  `price` decimal(10,3) NOT NULL,
  `old_price` decimal(10,3) DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'array of URLs' CHECK (json_valid(`images`)),
  `badges` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '["sale","norefund","oos","new"]' CHECK (json_valid(`badges`)),
  `rating` decimal(3,2) DEFAULT 4.50,
  `reviews` int(11) DEFAULT 0,
  `sold` int(11) DEFAULT 0,
  `availability` enum('available','out-of-stock','coming-soon') DEFAULT 'available',
  `description` text DEFAULT NULL,
  `details` text DEFAULT NULL,
  `fabric_types` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'array of strings' CHECK (json_valid(`fabric_types`)),
  `neckline_shapes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '[{name,image}]' CHECK (json_valid(`neckline_shapes`)),
  `stitch_price` decimal(10,3) DEFAULT 0.000,
  `accessories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '[{name,price}]' CHECK (json_valid(`accessories`)),
  `shipping_note` varchar(200) DEFAULT NULL,
  `most_selling` tinyint(1) DEFAULT 0,
  `specs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '[{label,value}]' CHECK (json_valid(`specs`)),
  `stock` int(11) DEFAULT 100,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `shipping_cost` decimal(10,3) DEFAULT 2.000,
  `sizes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sizes`)),
  `colors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`colors`)),
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `is_premade` tinyint(1) DEFAULT 0,
  `weight` decimal(10,3) DEFAULT 0.000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `price`, `old_price`, `images`, `badges`, `rating`, `reviews`, `sold`, `availability`, `description`, `details`, `fabric_types`, `neckline_shapes`, `stitch_price`, `accessories`, `shipping_note`, `most_selling`, `specs`, `stock`, `created_at`, `updated_at`, `shipping_cost`, `sizes`, `colors`, `options`, `is_premade`, `weight`) VALUES
('001', 'Royal Embroidered Thobe', 'Thobes', 28.500, 38.000, '[\"https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80\"]', '[\"sale\"]', 4.80, 124, 890, 'available', 'Crafted from premium Egyptian cotton with intricate hand-embroidered collar details.', 'Tailored fit with reinforced stitching. Gold thread collar embroidery imported from Egypt.', '[\"Egyptian Cotton\",\"Premium Linen\",\"Silk Blend\",\"Polyester\"]', '[{\"name\":\"Classic Round\",\"image\":\"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70\"},{\"name\":\"Mandarin Collar\",\"image\":\"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=70\"},{\"name\":\"V-Neck\",\"image\":\"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&q=70\"}]', 4.500, '[{\"name\":\"None\",\"price\":0},{\"name\":\"Embroidered Belt\",\"price\":3.5},{\"name\":\"Cufflinks (Gold)\",\"price\":4.0},{\"name\":\"Cufflinks (Silver)\",\"price\":2.5},{\"name\":\"Traditional Cap\",\"price\":2.0}]', 'Free shipping on orders above 10 OMR', 1, '[{\"label\":\"Material\",\"value\":\"Egyptian Cotton 100%\"},{\"label\":\"Care\",\"value\":\"Dry clean only\"},{\"label\":\"Origin\",\"value\":\"Made in Oman\"},{\"label\":\"Sizes\",\"value\":\"XS – 3XL\"}]', 94, '2026-03-05 19:17:41', '2026-03-11 21:36:38', 2.000, NULL, NULL, NULL, 0, 0.000),
('002', 'Classic White Kandura', 'Thobes', 22.000, NULL, '[\"https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600&q=80\"]', '[\"new\"]', 4.60, 87, 540, 'available', 'A timeless white kandura with a modern slim fit.', 'Hidden button placket and premium quality fabric.', '[\"Egyptian Cotton\",\"Linen Mix\",\"Polyester Cotton\"]', '[{\"name\":\"Classic Round\",\"image\":\"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70\"},{\"name\":\"Mandarin Collar\",\"image\":\"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=70\"}]', 3.500, '[{\"name\":\"None\",\"price\":0},{\"name\":\"Embroidered Belt\",\"price\":3.5},{\"name\":\"Traditional Cap\",\"price\":2.0},{\"name\":\"Cufflinks (Gold)\",\"price\":4.0}]', 'Ships within 2-3 business days', 1, '[{\"label\":\"Material\",\"value\":\"Linen Mix 60/40\"},{\"label\":\"Care\",\"value\":\"Machine wash cold\"},{\"label\":\"Origin\",\"value\":\"Made in UAE\"},{\"label\":\"Sizes\",\"value\":\"S – 4XL\"}]', 98, '2026-03-05 19:17:41', '2026-03-11 20:00:20', 2.000, NULL, NULL, NULL, 0, 0.000),
('003', 'Premium Abaya — Midnight Blue', 'Abayas', 35.000, 45.000, '[\"https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80\"]', '[\"sale\",\"norefund\"]', 4.90, 211, 1250, 'available', 'Elegant midnight blue abaya with subtle shimmer thread.', 'Wrinkle-resistant. Silver embroidery detailing along the cuffs.', '[\"Nida Fabric\",\"Crepe\",\"Chiffon\",\"Velvet\"]', '[{\"name\":\"Classic Round\",\"image\":\"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70\"},{\"name\":\"V-Neck\",\"image\":\"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&q=70\"}]', 5.000, '[{\"name\":\"None\",\"price\":0},{\"name\":\"Matching Hijab\",\"price\":5.0},{\"name\":\"Crystal Brooch\",\"price\":3.0},{\"name\":\"Belt (Embroidered)\",\"price\":4.5},{\"name\":\"Cuffs (Lace)\",\"price\":2.5}]', 'Express delivery available', 1, '[{\"label\":\"Material\",\"value\":\"Nida + Chiffon\"},{\"label\":\"Care\",\"value\":\"Dry clean recommended\"},{\"label\":\"Origin\",\"value\":\"Made in Saudi Arabia\"},{\"label\":\"Sizes\",\"value\":\"XS – 2XL\"}]', 98, '2026-03-05 19:17:41', '2026-03-10 16:59:56', 2.000, NULL, NULL, NULL, 0, 0.000),
('007', 'Luxury Bisht — Gold Trim', 'Bishts', 85.000, NULL, '[\"https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80\"]', '[\"norefund\"]', 5.00, 34, 112, 'available', 'An exquisite bisht with hand-stitched gold trim.', 'Made-to-order by master craftsmen.', '[\"Wool Blend\",\"Premium Cashmere\"]', '[{\"name\":\"Classic Round\",\"image\":\"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70\"}]', 15.000, '[{\"name\":\"None\",\"price\":0},{\"name\":\"Gold Agal\",\"price\":12.0},{\"name\":\"Silver Agal\",\"price\":8.0}]', 'Custom made — 7 to 14 days delivery', 0, '[{\"label\":\"Material\",\"value\":\"Wool Blend 70/30\"},{\"label\":\"Care\",\"value\":\"Dry clean only\"},{\"label\":\"Origin\",\"value\":\"Made in Kuwait\"},{\"label\":\"Sizes\",\"value\":\"S – 3XL (Custom)\"}]', 100, '2026-03-05 19:17:41', '2026-03-05 19:17:41', 2.000, NULL, NULL, NULL, 0, 0.000),
('009', 'a', 'Bishts', 10.000, NULL, '[\"/uploads/1772761448442-h55xxjyobnv.png\"]', '[\"new\"]', 4.50, 0, 0, 'available', 'تست', '', '[\"Wool Blend\",\"Premium Cashmere\"]', '[{\"name\":\"Classic Round\",\"image\":\"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70\"}]', 6.000, '[{\"name\":\"None\",\"price\":0}]', '', 1, '[{\"label\":\"Material\",\"value\":\"Wool Blend 70/30\"},{\"label\":\"Care\",\"value\":\"Dry clean only\"},{\"label\":\"Origin\",\"value\":\"Made in Kuwait\"},{\"label\":\"Sizes\",\"value\":\"S – 3XL (Custom)\"}]', 99, '2026-03-06 01:44:37', '2026-03-11 20:16:11', 2.000, NULL, NULL, NULL, 0, 0.000),
('010', 'Abaya 1', 'Abayas', 5.000, NULL, '[\"/uploads/1772765377347-zz89h1jdam.jpg\"]', '[\"norefund\",\"limited\"]', 4.50, 0, 0, 'available', 'Test Abaya', '', '[\"Silk\",\"Nailon\"]', '[\"Classic Round\",\"V-Neck\"]', 0.000, '[{\"name\":\"Hijab\",\"price\":3}]', '', 1, '[]', 8, '2026-03-06 02:50:44', '2026-03-11 21:36:38', 2.000, NULL, NULL, NULL, 0, 0.000),
('011', 'Test Item', 'Thobes', 15.000, NULL, '[\"/uploads/1773261891542-g8s9w03omnw.jpeg\"]', '[]', 4.50, 0, 0, 'out-of-stock', 'test Item', '', '[]', '[]', 0.000, '[{\"name\":\"None\",\"price\":0}]', '', 1, '[{\"label\":\"Test\",\"value\":\"100% test\"}]', 97, '2026-03-11 20:45:00', '2026-03-25 13:49:14', 2.000, NULL, NULL, '[]', 1, 0.000);

-- --------------------------------------------------------

--
-- Table structure for table `shipping_rates`
--

CREATE TABLE `shipping_rates` (
  `id` int(11) NOT NULL,
  `country` varchar(50) DEFAULT NULL,
  `rate_per_kg` decimal(10,3) DEFAULT 0.000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `target` varchar(50) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `support_tickets`
--

INSERT INTO `support_tickets` (`id`, `user_id`, `target`, `label`, `subject`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 'general', '', 'عندي مشكلة', 'open', '2026-03-25 14:41:56', '2026-03-25 14:41:56'),
(2, 3, 'general', '', 'عندي مشكلة', 'open', '2026-03-25 14:42:45', '2026-03-25 14:42:45'),
(3, 3, 'general', '', 'عندي مشكلة', 'open', '2026-03-25 14:42:46', '2026-03-25 14:42:46'),
(4, 3, 'general', '', 'عندي مشكلة', 'open', '2026-03-25 14:42:47', '2026-03-25 14:42:47'),
(5, 3, 'general', '', 'عندي مشكلة', 'open', '2026-03-25 14:42:47', '2026-03-25 14:42:47'),
(6, 3, 'general', '', 'عندي مشكلة', 'open', '2026-03-25 14:42:48', '2026-03-25 14:42:48'),
(7, 3, 'general', '', 'عندي مشكلة', 'open', '2026-03-25 14:42:49', '2026-03-25 14:42:49'),
(8, 3, 'general', '', 'عندي مشكلة', 'open', '2026-03-25 14:43:29', '2026-03-25 14:43:29'),
(9, 3, 'general', '', 'عندي مشكلة', 'open', '2026-03-25 14:43:31', '2026-03-25 15:05:00'),
(10, 3, 'general', '', 'اهلا', 'closed', '2026-03-25 14:44:04', '2026-03-25 14:59:11'),
(11, 3, 'general', '', 'werfwef', 'awaiting', '2026-03-25 15:09:41', '2026-03-25 15:11:16'),
(12, 3, 'general', '', 'test', 'open', '2026-03-25 15:12:52', '2026-03-25 21:00:16');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_messages`
--

CREATE TABLE `ticket_messages` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) DEFAULT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `sender_type` varchar(10) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticket_messages`
--

INSERT INTO `ticket_messages` (`id`, `ticket_id`, `sender_id`, `sender_type`, `message`, `created_at`) VALUES
(1, 9, 3, 'user', 'السلام عليكم ورحمة الله معي مشكلة حاب استفسر عنها', '2026-03-25 14:43:31'),
(2, 10, 3, 'user', ' POST /api/support 500 in 45ms (compile: 1842µs, render: 43ms)\nSupport API Error: Error: Unknown column \'sender_id\' in \'field list\'\n    at query (lib\\db.ts:19:31)\n    at createTicket (app\\api\\support\\route.ts:30:20)\n  17 | // Helper: execute a query and return typed rows\n  18 | export async function query<T = unknown>(sql: string, values?: unknown[]): Promise<T[]> {\n> 19 |     const [rows] = await pool.execute(sql, values);\n     |                               ^\n  20 |     return rows as T[];\n  21 | }\n  22 | {\n  code: \'ER_BAD_FIELD_ERROR\',\n  errno: 1054,\n  sql: \"INSERT INTO ticket_messages (ticket_id, sender_id, sender_type, message) VALUES (?, ?, \'user\', ?)\",\n  sqlState: \'42S22\',\n  sqlMessage: \"Unknown column \'sender_id\' in \'field list\'\"', '2026-03-25 14:44:04'),
(3, 10, 3, 'admin', 'كيف ممكن اخدمك\n', '2026-03-25 14:45:40'),
(4, 10, 3, 'user', 'ddd', '2026-03-25 14:48:53'),
(5, 10, 3, 'admin', 'ff', '2026-03-25 14:52:26'),
(6, 10, 3, 'user', 'ddd', '2026-03-25 14:52:47'),
(7, 9, 3, 'user', 'السلام عليكم\n', '2026-03-25 14:59:35'),
(8, 9, 3, 'admin', 'ايوة اخوي تفضل', '2026-03-25 14:59:57'),
(9, 9, 3, 'user', '.\n', '2026-03-25 15:01:46'),
(10, 9, 3, 'admin', 'p', '2026-03-25 15:04:06'),
(11, 9, 3, 'user', 'k', '2026-03-25 15:05:00'),
(12, 11, 3, 'user', 'sdfsdf', '2026-03-25 15:09:41'),
(13, 11, 3, 'admin', 'ff', '2026-03-25 15:11:13'),
(14, 12, 3, 'user', 'test', '2026-03-25 15:12:52'),
(15, 12, 3, 'user', 'اهلا', '2026-03-25 20:03:55'),
(16, 12, 3, 'user', 'hgmm', '2026-03-25 20:04:54'),
(17, 12, 3, 'user', 'اهلا وسهلا', '2026-03-25 20:07:45'),
(18, 12, 3, 'admin', 'السلام عليكم كيف اخدمك', '2026-03-25 20:08:16'),
(19, 12, 3, 'admin', 'بب', '2026-03-25 20:08:31'),
(20, 12, 3, 'admin', 'ب', '2026-03-25 20:08:38'),
(21, 12, 3, 'admin', 'يبليبل', '2026-03-25 20:08:43'),
(22, 12, 3, 'admin', 'ل', '2026-03-25 20:08:48'),
(23, 12, 3, 'user', 'ss', '2026-03-25 20:35:43'),
(24, 12, 3, 'user', 'ss', '2026-03-25 20:35:44'),
(25, 12, 3, 'user', 'ss', '2026-03-25 20:35:45'),
(26, 12, 3, 'user', 's', '2026-03-25 20:35:46'),
(27, 12, 3, 'user', 's', '2026-03-25 20:35:47'),
(28, 12, 3, 'user', 's', '2026-03-25 20:35:48'),
(29, 12, 3, 'user', 's', '2026-03-25 20:35:49'),
(30, 12, 3, 'user', 's', '2026-03-25 20:35:50'),
(31, 12, 3, 'user', 's', '2026-03-25 20:35:50'),
(32, 12, 3, 'user', 's', '2026-03-25 20:35:51'),
(33, 12, 3, 'user', 's', '2026-03-25 20:35:53'),
(34, 12, 3, 'user', 's', '2026-03-25 20:35:54'),
(35, 12, 3, 'user', 's', '2026-03-25 20:35:55'),
(36, 12, 3, 'user', 'dddddddddddd', '2026-03-25 20:37:29'),
(37, 12, 3, 'user', 'd', '2026-03-25 20:37:29'),
(38, 12, 3, 'user', 'dd\nD\nDD\nD\nD', '2026-03-25 20:37:32'),
(39, 12, 3, 'user', 'k', '2026-03-25 20:46:41'),
(40, 12, 3, 'admin', 'ssssssssssssss', '2026-03-25 20:55:05'),
(41, 12, 3, 'admin', 'ssssssssss\nSsssssssssss\nSssssssssss', '2026-03-25 20:55:17'),
(42, 12, 3, 'user', 'sssssssssssssssssssssssssssssssssssssssssssssssssssss', '2026-03-25 20:59:08'),
(43, 12, 3, 'user', 'asdasdasd\nASDASd\nASDASD\nASDAsd', '2026-03-25 21:00:13'),
(44, 12, 3, 'user', 'sdasdasd', '2026-03-25 21:00:14'),
(45, 12, 3, 'user', 'asdasd', '2026-03-25 21:00:15'),
(46, 12, 3, 'user', 'asdasd', '2026-03-25 21:00:16');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(200) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('customer','admin','super_admin') DEFAULT 'customer',
  `phone` varchar(30) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `otp` varchar(6) DEFAULT NULL,
  `otp_expires` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `address`, `city`, `created_at`, `updated_at`, `otp`, `otp_expires`) VALUES
(1, 'Admin', 'admin@jihadstore.com', '$2b$10$owsxCPJkDGsSOkueC9xoUOqQYm6SKpOP98zW6cFtpw/iq3gB3zLVa', 'super_admin', NULL, NULL, NULL, '2026-03-05 19:17:41', '2026-03-10 16:41:53', '717007', '2026-03-05 19:37:22'),
(2, 'Ahmed Ali', 'azzam224411@gmail.com', '$2b$10$owsxCPJkDGsSOkueC9xoUOqQYm6SKpOP98zW6cFtpw/iq3gB3zLVa', 'customer', NULL, NULL, NULL, '2026-03-05 20:00:13', '2026-03-10 16:43:52', NULL, NULL),
(3, 'Azzam Alkalbani', 'omxqn12@gmail.com', 'passwordless', 'super_admin', '90625671', 'Muscat', NULL, '2026-03-05 19:47:17', '2026-03-25 21:37:51', NULL, NULL),
(5, 'omx qn', 'azzam224499@gmail.com', 'passwordless', 'customer', '4444444444444444', 'sdfsdf', NULL, '2026-03-05 23:34:39', '2026-03-10 16:43:40', NULL, NULL),
(7, 'Ahmed ali', 'dr.jiihad@gmail.com', 'passwordless', 'admin', '95656565', 'asdasdasd', NULL, '2026-03-06 02:36:24', '2026-03-10 16:43:35', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vouchers`
--

CREATE TABLE `vouchers` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `discount_amount` decimal(10,3) NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `discount_type` enum('fixed','percentage') DEFAULT 'fixed',
  `expires_at` timestamp NULL DEFAULT NULL,
  `new_user_only` tinyint(1) DEFAULT 0,
  `is_public` tinyint(1) DEFAULT 1,
  `max_uses_per_user` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vouchers`
--

INSERT INTO `vouchers` (`id`, `code`, `discount_amount`, `active`, `created_at`, `discount_type`, `expires_at`, `new_user_only`, `is_public`, `max_uses_per_user`) VALUES
(1, 'OMAN2024', 5.000, 1, '2026-03-05 19:17:41', 'fixed', NULL, 0, 1, 1),
(2, 'SAVE10', 10.000, 1, '2026-03-05 19:17:41', 'fixed', NULL, 0, 1, 1),
(3, 'WELCOME', 3.000, 1, '2026-03-05 19:17:41', 'fixed', NULL, 0, 1, 1),
(4, 'EID25', 25.000, 1, '2026-03-05 19:17:41', 'fixed', NULL, 0, 1, 1),
(5, 'MLINBQYC7ECY', 1.000, 0, '2026-03-06 00:02:28', 'fixed', NULL, 0, 0, 1),
(6, 'DMDJ02EUREDT', 20.000, 1, '2026-03-06 00:32:46', 'fixed', NULL, 0, 1, 1),
(7, '3XOOW81DQ4MO', 20.000, 1, '2026-03-06 01:29:23', 'fixed', NULL, 0, 0, 1),
(8, 'OMAN2', 2.000, 1, '2026-03-06 02:41:17', 'fixed', '2026-03-07 02:39:00', 0, 0, 1),
(9, 'G0UXD354TV7L', 1.000, 0, '2026-03-11 21:41:43', 'fixed', NULL, 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `voucher_redemptions`
--

CREATE TABLE `voucher_redemptions` (
  `id` int(11) NOT NULL,
  `voucher_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `redeemed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `voucher_redemptions`
--

INSERT INTO `voucher_redemptions` (`id`, `voucher_id`, `user_id`, `order_id`, `redeemed_at`) VALUES
(1, 7, 3, 20, '2026-03-11 21:36:38'),
(2, 6, 3, 21, '2026-03-11 22:00:39');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `neckline_shapes`
--
ALTER TABLE `neckline_shapes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `shipping_rates`
--
ALTER TABLE `shipping_rates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `country` (`country`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ticket_messages`
--
ALTER TABLE `ticket_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `vouchers`
--
ALTER TABLE `vouchers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `voucher_redemptions`
--
ALTER TABLE `voucher_redemptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `voucher_id` (`voucher_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `order_id` (`order_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `neckline_shapes`
--
ALTER TABLE `neckline_shapes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `shipping_rates`
--
ALTER TABLE `shipping_rates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `ticket_messages`
--
ALTER TABLE `ticket_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `voucher_redemptions`
--
ALTER TABLE `voucher_redemptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `voucher_redemptions`
--
ALTER TABLE `voucher_redemptions`
  ADD CONSTRAINT `voucher_redemptions_ibfk_1` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`),
  ADD CONSTRAINT `voucher_redemptions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `voucher_redemptions_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
