-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 06, 2026 at 04:38 AM
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
(25, 7, 'order', 'Your Order #10 has been received', 10, 1, '2026-03-06 02:43:54');

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
  `refunded_amount` decimal(10,3) DEFAULT 0.000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `guest_email`, `status`, `subtotal`, `discount`, `total`, `name`, `email`, `phone`, `address`, `city`, `payment_method`, `created_at`, `updated_at`, `refunded_amount`) VALUES
(1, 2, 'omxn12@gmail.com', 'paid', 47.500, 0.000, 47.500, 'Azzam Alkalbani', 'omxn12@gmail.com', '90625671', 'Muscat', 'Muscat', 'thawani', '2026-03-05 19:36:59', '2026-03-05 19:48:58', 0.000),
(2, 2, 'omxn12@gmail.com', 'paid', 43.000, 0.000, 43.000, 'Azzam Alkalbani', 'omxn12@gmail.com', '90625671', 'Ibri', 'Ibri', 'thawani', '2026-03-05 19:48:14', '2026-03-05 19:48:55', 0.000),
(3, 1, NULL, 'paid', 228.000, 0.000, 228.000, 'Admin', 'admin@jihadstore.com', '90625671', 'muscat', 'Muscat', 'thawani', '2026-03-05 22:54:33', '2026-03-05 22:54:33', 0.000),
(4, 2, NULL, 'shipped', 71.500, 0.000, 71.500, 'Ahmed Ali', 'azzam224411@gmail.com', '90625671', 'sdfsdfsdfsdf', 'Muscat', 'thawani', '2026-03-05 23:12:25', '2026-03-05 23:19:05', 0.000),
(5, 2, NULL, 'paid', 22.000, 0.000, 22.000, 'Ahmed Ali', 'azzam224411@gmail.com', '', '', 'asd', 'thawani', '2026-03-05 23:19:54', '2026-03-05 23:19:54', 0.000),
(6, 5, NULL, 'refunded', 18.500, 0.000, 18.500, 'omx qn', 'azzam224499@gmail.com', '4444444444444444', 'sdfsdf', 'dsfsdf', 'thawani', '2026-03-05 23:35:37', '2026-03-06 00:30:45', 18.000),
(7, 5, NULL, 'processing', 12.000, 10.000, 2.000, 'omx qn', 'azzam224499@gmail.com', '4444444444444444', 'sdfsdf', 'dsfsdf', 'thawani', '2026-03-06 00:34:51', '2026-03-06 00:34:51', 0.000),
(8, 5, NULL, 'processing', 18.500, 10.000, 8.500, 'omx qn', 'azzam224499@gmail.com', '4444444444444444', 'sdfsdf', 'dsfsdf', 'thawani', '2026-03-06 00:35:24', '2026-03-06 00:35:24', 0.000),
(9, 5, NULL, 'processing', 35.000, 20.000, 15.000, 'omx qn', 'azzam224499@gmail.com', '4444444444444444', 'sdfsdf', 'ws', 'thawani', '2026-03-06 01:30:13', '2026-03-06 01:30:13', 0.000),
(10, 7, NULL, 'refunded', 28.500, 2.000, 26.500, 'Ahmed ali', 'dr.jiihad@gmail.com', '95656565', 'asdasdasd', 'Muscat', 'thawani', '2026-03-06 02:41:30', '2026-03-06 02:44:29', 0.000);

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
  `image` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `name`, `price`, `quantity`, `fabric_type`, `fabric_length`, `neck_size`, `neckline`, `stitch`, `stitch_price`, `accessories`, `accessories_price`, `tailor_measurements`, `image`) VALUES
(1, 1, '003', 'Premium Abaya — Midnight Blue', 47.500, 1, 'Nida Fabric', '123', '55', 'Classic Round', 0, 0.000, '[\"Matching Hijab\",\"Belt (Embroidered)\",\"Crystal Brooch\"]', 12.500, '{}', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80'),
(2, 2, '003', 'Premium Abaya — Midnight Blue', 43.000, 1, 'Nida Fabric', '123', '22', 'Classic Round', 0, 0.000, '[\"Matching Hijab\",\"Crystal Brooch\"]', 8.000, '{}', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80'),
(3, 3, '005', 'Sport Thobe — Slim Fit', 18.500, 5, 'Polyester Blend', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'),
(4, 3, '007', 'Luxury Bisht — Gold Trim', 85.000, 1, 'Wool Blend', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80'),
(5, 3, '002', 'Classic White Kandura', 22.000, 1, 'Egyptian Cotton', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600&q=80'),
(6, 3, '001', 'Royal Embroidered Thobe', 28.500, 1, 'Egyptian Cotton', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80'),
(7, 4, '002', 'Classic White Kandura', 22.000, 1, 'Egyptian Cotton', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600&q=80'),
(8, 4, '003', 'Premium Abaya — Midnight Blue', 49.500, 1, 'Crepe', '123', '22', 'Classic Round', 1, 5.000, '[\"Matching Hijab\",\"Belt (Embroidered)\"]', 9.500, '{\"Chest\":\"33\",\"Waist\":\"42\",\"Hips\":\"43\",\"Shoulder Width\":\"42\",\"Sleeve Length\":\"42\",\"Total Length\":\"432\"}', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80'),
(9, 5, '002', 'Classic White Kandura', 22.000, 1, 'Egyptian Cotton', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600&q=80'),
(10, 6, '005', 'Sport Thobe — Slim Fit', 18.500, 1, 'Polyester Blend', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'),
(11, 7, '006', 'Kids Thobe — Celebration', 12.000, 1, 'Egyptian Cotton', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=600&q=80'),
(12, 8, '005', 'Sport Thobe — Slim Fit', 18.500, 1, 'Polyester Blend', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'),
(13, 9, '003', 'Premium Abaya — Midnight Blue', 35.000, 1, 'Nida Fabric', NULL, NULL, 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80'),
(14, 10, '001', 'Royal Embroidered Thobe', 28.500, 1, 'Egyptian Cotton', '22', '22', 'Classic Round', 0, 0.000, '[\"None\"]', 0.000, '{}', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `price`, `old_price`, `images`, `badges`, `rating`, `reviews`, `sold`, `availability`, `description`, `details`, `fabric_types`, `neckline_shapes`, `stitch_price`, `accessories`, `shipping_note`, `most_selling`, `specs`, `stock`, `created_at`, `updated_at`) VALUES
('001', 'Royal Embroidered Thobe', 'Thobes', 28.500, 38.000, '[\"https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80\"]', '[\"sale\"]', 4.80, 124, 890, 'available', 'Crafted from premium Egyptian cotton with intricate hand-embroidered collar details.', 'Tailored fit with reinforced stitching. Gold thread collar embroidery imported from Egypt.', '[\"Egyptian Cotton\",\"Premium Linen\",\"Silk Blend\",\"Polyester\"]', '[{\"name\":\"Classic Round\",\"image\":\"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70\"},{\"name\":\"Mandarin Collar\",\"image\":\"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=70\"},{\"name\":\"V-Neck\",\"image\":\"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&q=70\"}]', 4.500, '[{\"name\":\"None\",\"price\":0},{\"name\":\"Embroidered Belt\",\"price\":3.5},{\"name\":\"Cufflinks (Gold)\",\"price\":4.0},{\"name\":\"Cufflinks (Silver)\",\"price\":2.5},{\"name\":\"Traditional Cap\",\"price\":2.0}]', 'Free shipping on orders above 10 OMR', 1, '[{\"label\":\"Material\",\"value\":\"Egyptian Cotton 100%\"},{\"label\":\"Care\",\"value\":\"Dry clean only\"},{\"label\":\"Origin\",\"value\":\"Made in Oman\"},{\"label\":\"Sizes\",\"value\":\"XS – 3XL\"}]', 99, '2026-03-05 19:17:41', '2026-03-06 02:41:30'),
('002', 'Classic White Kandura', 'Thobes', 22.000, NULL, '[\"https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600&q=80\"]', '[\"new\"]', 4.60, 87, 540, 'available', 'A timeless white kandura with a modern slim fit.', 'Hidden button placket and premium quality fabric.', '[\"Egyptian Cotton\",\"Linen Mix\",\"Polyester Cotton\"]', '[{\"name\":\"Classic Round\",\"image\":\"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70\"},{\"name\":\"Mandarin Collar\",\"image\":\"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=70\"}]', 3.500, '[{\"name\":\"None\",\"price\":0},{\"name\":\"Embroidered Belt\",\"price\":3.5},{\"name\":\"Traditional Cap\",\"price\":2.0},{\"name\":\"Cufflinks (Gold)\",\"price\":4.0}]', 'Ships within 2-3 business days', 1, '[{\"label\":\"Material\",\"value\":\"Linen Mix 60/40\"},{\"label\":\"Care\",\"value\":\"Machine wash cold\"},{\"label\":\"Origin\",\"value\":\"Made in UAE\"},{\"label\":\"Sizes\",\"value\":\"S – 4XL\"}]', 100, '2026-03-05 19:17:41', '2026-03-05 19:17:41'),
('003', 'Premium Abaya — Midnight Blue', 'Abayas', 35.000, 45.000, '[\"https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80\"]', '[\"sale\",\"norefund\"]', 4.90, 211, 1250, 'available', 'Elegant midnight blue abaya with subtle shimmer thread.', 'Wrinkle-resistant. Silver embroidery detailing along the cuffs.', '[\"Nida Fabric\",\"Crepe\",\"Chiffon\",\"Velvet\"]', '[{\"name\":\"Classic Round\",\"image\":\"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70\"},{\"name\":\"V-Neck\",\"image\":\"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&q=70\"}]', 5.000, '[{\"name\":\"None\",\"price\":0},{\"name\":\"Matching Hijab\",\"price\":5.0},{\"name\":\"Crystal Brooch\",\"price\":3.0},{\"name\":\"Belt (Embroidered)\",\"price\":4.5},{\"name\":\"Cuffs (Lace)\",\"price\":2.5}]', 'Express delivery available', 1, '[{\"label\":\"Material\",\"value\":\"Nida + Chiffon\"},{\"label\":\"Care\",\"value\":\"Dry clean recommended\"},{\"label\":\"Origin\",\"value\":\"Made in Saudi Arabia\"},{\"label\":\"Sizes\",\"value\":\"XS – 2XL\"}]', 99, '2026-03-05 19:17:41', '2026-03-06 01:30:13'),
('007', 'Luxury Bisht — Gold Trim', 'Bishts', 85.000, NULL, '[\"https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80\"]', '[\"norefund\"]', 5.00, 34, 112, 'available', 'An exquisite bisht with hand-stitched gold trim.', 'Made-to-order by master craftsmen.', '[\"Wool Blend\",\"Premium Cashmere\"]', '[{\"name\":\"Classic Round\",\"image\":\"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70\"}]', 15.000, '[{\"name\":\"None\",\"price\":0},{\"name\":\"Gold Agal\",\"price\":12.0},{\"name\":\"Silver Agal\",\"price\":8.0}]', 'Custom made — 7 to 14 days delivery', 0, '[{\"label\":\"Material\",\"value\":\"Wool Blend 70/30\"},{\"label\":\"Care\",\"value\":\"Dry clean only\"},{\"label\":\"Origin\",\"value\":\"Made in Kuwait\"},{\"label\":\"Sizes\",\"value\":\"S – 3XL (Custom)\"}]', 100, '2026-03-05 19:17:41', '2026-03-05 19:17:41'),
('009', 'a', 'Bishts', 10.000, NULL, '[\"/uploads/1772761448442-h55xxjyobnv.png\"]', '[\"new\"]', 4.50, 0, 0, 'available', 'تست', '', '[\"Wool Blend\",\"Premium Cashmere\"]', '[{\"name\":\"Classic Round\",\"image\":\"https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70\"}]', 6.000, '[{\"name\":\"None\",\"price\":0}]', '', 1, '[{\"label\":\"Material\",\"value\":\"Wool Blend 70/30\"},{\"label\":\"Care\",\"value\":\"Dry clean only\"},{\"label\":\"Origin\",\"value\":\"Made in Kuwait\"},{\"label\":\"Sizes\",\"value\":\"S – 3XL (Custom)\"}]', 100, '2026-03-06 01:44:37', '2026-03-06 01:53:00'),
('010', 'Abaya 1', 'Abayas', 5.000, NULL, '[\"/uploads/1772765377347-zz89h1jdam.jpg\"]', '[\"norefund\",\"limited\"]', 4.50, 0, 0, 'available', 'Test Abaya', '', '[\"Silk\",\"Nailon\"]', '[\"Classic Round\",\"V-Neck\"]', 0.000, '[{\"name\":\"Hijab\",\"price\":3}]', '', 1, '[]', 10, '2026-03-06 02:50:44', '2026-03-06 02:53:52');

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
(1, 'Admin', 'admin@jihadstore.com', '$2b$10$owsxCPJkDGsSOkueC9xoUOqQYm6SKpOP98zW6cFtpw/iq3gB3zLVa', 'admin', NULL, NULL, NULL, '2026-03-05 19:17:41', '2026-03-05 23:27:22', '717007', '2026-03-05 19:37:22'),
(2, 'Ahmed Ali', 'azzam224411@gmail.com', '$2b$10$owsxCPJkDGsSOkueC9xoUOqQYm6SKpOP98zW6cFtpw/iq3gB3zLVa', 'super_admin', NULL, NULL, NULL, '2026-03-05 20:00:13', '2026-03-06 00:28:54', NULL, NULL),
(3, 'Azzam Alkalbani', 'omxn12@gmail.com', '$2b$10$owsxCPJkDGsSOkueC9xoUOqQYm6SKpOP98zW6cFtpw/iq3gB3zLVa', 'customer', '90625671', 'Muscat', NULL, '2026-03-05 19:47:17', '2026-03-05 20:02:23', NULL, NULL),
(5, 'omx qn', 'azzam224499@gmail.com', 'passwordless', 'customer', '4444444444444444', 'sdfsdf', NULL, '2026-03-05 23:34:39', '2026-03-05 23:35:05', NULL, NULL),
(6, 'azzaam224411', 'azzaam224411@gmail.com', 'passwordless', 'customer', NULL, NULL, NULL, '2026-03-06 00:13:12', '2026-03-06 00:13:12', '309904', '2026-03-05 20:23:12'),
(7, 'Ahmed ali', 'dr.jiihad@gmail.com', 'passwordless', 'customer', '95656565', 'asdasdasd', NULL, '2026-03-06 02:36:24', '2026-03-06 02:36:55', NULL, NULL);

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
(8, 'OMAN2', 2.000, 1, '2026-03-06 02:41:17', 'fixed', '2026-03-07 02:39:00', 0, 0, 1);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `voucher_redemptions`
--
ALTER TABLE `voucher_redemptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
