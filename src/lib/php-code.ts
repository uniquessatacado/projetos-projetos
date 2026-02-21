export const PHP_API_CODE = `<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// CONFIGURAÇÕES OBRIGATÓRIAS
$host = '172.22.0.2';
$db   = 'projetos'; 
$user = 'root';
$pass = 'root123'; 

function getPdo() {
    global $host, $db, $user, $pass;
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        initTables($pdo);
        return $pdo;
    } catch (PDOException $e) {
        try {
            $pdo = new PDO("mysql:host=$host;charset=utf8", $user, $pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS \`$db\`");
            $pdo->exec("USE \`$db\`");
            initTables($pdo);
            return $pdo;
        } catch (PDOException $e2) {
            http_response_code(500);
            echo json_encode(['error' => 'Falha na conexão: ' . $e2->getMessage()]);
            exit;
        }
    }
}

function initTables($pdo) {
    // Projetos - Esquema Estático
    $pdo->exec("CREATE TABLE IF NOT EXISTS projetos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cliente_nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    // Funcionalidades - Esquema Estático
    $pdo->exec("CREATE TABLE IF NOT EXISTS funcionalidades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        projeto_id INT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        complexidade VARCHAR(50) NOT NULL,
        categoria VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB");

    // Templates
    $pdo->exec("CREATE TABLE IF NOT EXISTS templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    // Configurações
    $pdo->exec("CREATE TABLE IF NOT EXISTS configuracoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chave VARCHAR(50) UNIQUE NOT NULL,
        valor TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");
}

$path = isset($_GET['path']) ? $_GET['path'] : '';
$method = $_SERVER['REQUEST_METHOD'];
$parts = explode('/', $path);
$res = $parts[0];
$id = $parts[1] ?? null;
$input = json_decode(file_get_contents('php://input'), true);

try {
    $pdo = getPdo();
    
    switch ($res) {
        case 'projetos':
            if ($method === 'GET') {
                if ($id) {
                    $s = $pdo->prepare("SELECT * FROM projetos WHERE id = ?");
                    $s->execute([$id]);
                    echo json_encode($s->fetch(PDO::FETCH_ASSOC) ?: new stdClass());
                } else {
                    $s = $pdo->query("SELECT * FROM projetos ORDER BY id DESC");
                    echo json_encode($s->fetchAll(PDO::FETCH_ASSOC));
                }
            } elseif ($method === 'POST') {
                if ($id) {
                    $stmt = $pdo->prepare("UPDATE projetos SET nome = ?, cliente_nome = ?, descricao = ? WHERE id = ?");
                    $stmt->execute([$input['nome'], $input['cliente_nome'], $input['descricao'] ?? '', $id]);
                } else {
                    $stmt = $pdo->prepare("INSERT INTO projetos (nome, cliente_nome, descricao) VALUES (?, ?, ?)");
                    $stmt->execute([$input['nome'], $input['cliente_nome'], $input['descricao'] ?? '']);
                    echo json_encode(['id' => $pdo->lastInsertId()]);
                }
            }
            break;

        case 'funcionalidades':
            if ($method === 'GET') {
                $pid = $_GET['projeto_id'] ?? 0;
                $s = $pdo->prepare("SELECT * FROM funcionalidades WHERE projeto_id = ? ORDER BY id ASC");
                $s->execute([$pid]);
                echo json_encode($s->fetchAll(PDO::FETCH_ASSOC));
            } elseif ($method === 'POST') {
                if ($id) {
                    $stmt = $pdo->prepare("UPDATE funcionalidades SET titulo = ?, descricao = ?, complexidade = ?, categoria = ? WHERE id = ?");
                    $stmt->execute([$input['titulo'], $input['descricao'] ?? '', $input['complexidade'], $input['categoria'] ?? '', $id]);
                } else {
                    $stmt = $pdo->prepare("INSERT INTO funcionalidades (projeto_id, titulo, descricao, complexidade, categoria) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([$input['projeto_id'], $input['titulo'], $input['descricao'] ?? '', $input['complexidade'], $input['categoria'] ?? '']);
                    echo json_encode(['id' => $pdo->lastInsertId()]);
                }
            } elseif ($method === 'DELETE' && $id) {
                $pdo->prepare("DELETE FROM funcionalidades WHERE id = ?")->execute([$id]);
                echo json_encode(['success' => true]);
            }
            break;

        case 'templates':
            if ($method === 'GET') {
                echo json_encode($pdo->query("SELECT * FROM templates ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC));
            } elseif ($method === 'POST') {
                $pdo->prepare("INSERT INTO templates (nome, descricao) VALUES (?, ?)")->execute([$input['nome'], $input['descricao'] ?? '']);
                echo json_encode(['id' => $pdo->lastInsertId()]);
            }
            break;

        case 'configuracoes':
            if ($method === 'GET') {
                echo json_encode($pdo->query("SELECT * FROM configuracoes")->fetchAll(PDO::FETCH_ASSOC));
            } elseif ($method === 'POST') {
                $pdo->prepare("INSERT INTO configuracoes (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)")->execute([$input['chave'], $input['valor']]);
                echo json_encode(['success' => true]);
            }
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>`;