<?php
// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/mosaic_error.log');

require_once __DIR__ . '/autoload/DatabaseConnection.php';
header('Content-Type: application/json');

// Get the requested art style
$artStyle = isset($_GET['style']) ? $_GET['style'] : 'Synthetic_Cubism';

// Validate the style parameter to prevent directory traversal attacks
$validStyles = ['Synthetic_Cubism', 'Impressionism', 'Pop_Art'];
if (!in_array($artStyle, $validStyles)) {
    echo json_encode(['error' => 'Invalid art style']);
    exit;
}

// Define the cache file location, including the style information
$cacheFile = __DIR__ . "/{$artStyle}_cache.json";

// Check if the cache exists and return it
if (!empty($cacheFile) && file_exists($cacheFile)) {
    echo file_get_contents($cacheFile);
    exit;
}

// Define the image directory based on the selected style
$imageDir = __DIR__ . "/ArtStyle/{$artStyle}/";

// Ensure the directory exists
if (!is_dir($imageDir)) {
    echo json_encode(['error' => 'Image directory not found']);
    exit;
}

// Scan the directory to get image files
$imageFiles = array_filter(scandir($imageDir), function($file) use ($imageDir) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    return in_array($ext, ['jpg', 'jpeg', 'png']) && is_file($imageDir . "/" . $file);
});

// Process images and calculate average color
$imageData = [];
foreach ($imageFiles as $file) {
    $filePath = "/Frame/ArtStyle/{$artStyle}/" . $file;
    $fullPath = $imageDir . "/" . $file;

    $image = imagecreatefromjpeg($fullPath);
    if (!$image) continue;

    $width = imagesx($image);
    $height = imagesy($image);
    $r = $g = $b = $count = 0;

    for ($y = 0; $y < $height; $y++) {
        for ($x = 0; $x < $width; $x++) {
            $rgb = imagecolorat($image, $x, $y);
            $r += ($rgb >> 16) & 0xFF;
            $g += ($rgb >> 8) & 0xFF;
            $b += $rgb & 0xFF;
            $count++;
        }
    }
    imagedestroy($image);

    $imageData[] = [
        'file_path' => $filePath,
        'file_r' => round($r / $count),
        'file_g' => round($g / $count),
        'file_b' => round($b / $count)
    ];
}

// Save to cache
if (!empty($cacheFile) && is_writable(__DIR__)) {
    file_put_contents($cacheFile, json_encode($imageData, JSON_PRETTY_PRINT));
}

// Return JSON response
echo json_encode($imageData, JSON_PRETTY_PRINT);
?>
