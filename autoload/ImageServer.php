<?php
class ImageServer
{
    private $table;

    public function __construct($table)
    {
        $this->table = $table;
    }

    public function upload($file, $uploadDir)
    {
        $filePath = $uploadDir . '/' . basename($file['name']);

        if (!in_array($file['type'], ['image/jpeg', 'image/png'])) {
            return ['success' => false, 'error' => 'Invalid file type.'];
        }

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            return ['success' => false, 'error' => 'Failed to move uploaded file.'];
        }

        $this->store([
            'filepath' => $filePath,
            'type' => $file['type'],
            'title' => basename($file['name']),
        ]);

        return ['success' => true, 'filepath' => $filePath];
    }

    private function store($data)
    {
        global $f3;
        $mapper = new DB\SQL\Mapper($f3->get('DB'), $this->table);
        $mapper->filepath = $data['filepath'];
        $mapper->type = $data['type'];
        $mapper->title = $data['title'];
        $mapper->save();
    }

    public function getAllImages()
    {
        global $f3;
        $mapper = new DB\SQL\Mapper($f3->get('DB'), $this->table);
        return $mapper->find();
    }
}
