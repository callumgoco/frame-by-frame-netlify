<?php

$home = '/home/'.get_current_user();

$f3 = require($home.'/AboveWebRoot/fatfree-master/lib/base.php');

$f3->set('AUTOLOAD', 'autoload/;'.$home.'/AboveWebRoot/autoload/');
$f3->set('UI', $home.'/public_html/Frame/templates/');
$f3->set('UPLOADS', $home.'/public_html/Frame/uploads/');
$f3->set('DEBUG', 3);

$db = DatabaseConnection::connect();
$f3->set('DB', $db);

$f3->route('GET /dbtest', function($f3) {
    $db = $f3->get('DB');
    if ($db) {
        echo "Database connection is successful!";
    } else {
        echo "Database connection failed.";
    }
});

$f3->route('GET /', function() {
    // Render loading.html first
    echo Template::instance()->render('loading.html');
});

$f3->route('GET /main', function() {
    // After loading, redirect to uploads.html
    echo Template::instance()->render('uploads.html');
});

$f3->route('POST /upload',
    function($f3)
    {
    $db = $f3->get('DB');
    $uploadsDir = $f3->get('UPLOADS');

    if (!isset($_FILES['image'])) {
        echo json_encode(['success' => false, 'error' => 'No file uploaded.']);
        return;
    }

    $filename = basename($_FILES['image']['name']);
    $imagePath = $uploadsDir . $filename;

    if (move_uploaded_file($_FILES['image']['tmp_name'], $imagePath)) {
        $fileInfo = [
            'file_path' => "/Frame/uploads/" . $filename,
            'timestamp' => time(),
            'result_path' => null,
            'user_id' => 1,
            'file_size' => filesize($imagePath),
            'status' => 'pending',
            'file_type' => mime_content_type($imagePath)
        ];

        $stmt = $db->prepare("
            INSERT INTO uploads (file_path, timestamp, result_path, user_id, file_size, status, file_type)
            VALUES (:file_path, :timestamp, :result_path, :user_id, :file_size, :status, :file_type)
        ");
        $stmt->execute($fileInfo);

        echo json_encode(['success' => true, 'message' => 'File uploaded successfully!', 'file' => $fileInfo['file_path']]);
    } else {
        echo json_encode(['success' => false, 'error' => 'File upload failed.']);
    }
});

$f3->route('GET /all-comments', function($f3) {
    $db = $f3->get('DB');

    // 查询所有 `comment` 字段
    $stmt = $db->prepare("SELECT comment FROM comments");
    try {
        $stmt = $db->prepare("SELECT comment FROM comments ORDER BY id DESC");
        $stmt->execute();
        $comments = $stmt->fetchAll(PDO::FETCH_COLUMN); // 只获取 comment 字段

        echo json_encode(['success' => true, 'comments' => $comments]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => 'Database query failed: ' . $e->getMessage()]);
    }
});

$f3->route('POST /submit-comment', function($f3) {
    $db = $f3->get('DB');

    $comment = isset($_POST['comment']) ? trim($_POST['comment']) : '';
    $imagePath = isset($_POST['imagePath']) ? trim($_POST['imagePath']) : '';

    if (empty($comment)) {
        echo json_encode(['success' => false, 'error' => 'Comment cannot be empty']);
        return;
    }

    try {
        $stmt = $db->prepare("SELECT MAX(id) as max_id FROM comments");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $nextId = ($result['max_id'] ?? 0) + 1;

        $stmt = $db->prepare("
            INSERT INTO comments (id, comment, image_path, timestamp, user_id) 
            VALUES (:id, :comment, :image_path, :timestamp, :user_id)
        ");

        $result = $stmt->execute([
            ':id' => $nextId,
            ':comment' => $comment,
            ':image_path' => $imagePath,
            ':timestamp' => time(),
            ':user_id' => 1
        ]);

        if ($result) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to insert comment']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
});

$f3->route('GET /test', function() {
    echo "F3 routing is working!";
});

$f3->run();