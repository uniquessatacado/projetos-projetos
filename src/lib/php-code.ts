export const PHP_API_CODE = `<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

if (!extension_loaded('pdo_mysql')) {
    http_response_code(500);
    echo json_encode(['error' => 'A extensao PDO MySQL nao esta instalada ou habilitada no PHP.']);
    exit;
}

$host = '172.22.0.2';
$db   = 'projetos'; 
$user = 'root';
$pass = 'root123'; 

try {
    $pdo = new PDO("mysql:host=$host;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS \`$db\`");
    $pdo->exec("USE \`$db\`");

    $pdo->exec("CREATE TABLE IF NOT EXISTS projetos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cliente_nome VARCHAR(255) NOT NULL,
        descricao LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    $pdo->exec("CREATE TABLE IF NOT EXISTS funcionalidades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        projeto_id INT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descricao LONGTEXT,
        complexidade VARCHAR(50) NOT NULL,
        categoria VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB");

    $pdo->exec("CREATE TABLE IF NOT EXISTS templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS knowledge_base (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    $pdo->exec("CREATE TABLE IF NOT EXISTS configuracoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chave VARCHAR(50) UNIQUE NOT NULL,
        valor TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro de Banco de Dados: ' . $e->getMessage()]);
    exit;
}

$path = isset($_GET['path']) ? $_GET['path'] : '';
$method = $_SERVER['REQUEST_METHOD'];
$parts = explode('/', trim($path, '/'));
$res = $parts[0];
$id = $parts[1] ?? null;
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch ($res) {
        case 'projetos':
            if ($method === 'GET') {
                if ($id) {
                    $s = $pdo->prepare("SELECT * FROM projetos WHERE id = ?");
                    $s->execute([$id]);
                    echo json_encode($s->fetch(PDO::FETCH_ASSOC) ?: new stdClass());
                } else {
                    echo json_encode($pdo->query("SELECT * FROM projetos ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC));
                }
            } elseif ($method === 'POST') {
                if ($id) {
                    $pdo->prepare("UPDATE projetos SET nome = ?, cliente_nome = ?, descricao = ? WHERE id = ?")
                        ->execute([$input['nome'], $input['cliente_nome'], $input['descricao'] ?? '', $id]);
                } else {
                    $pdo->prepare("INSERT INTO projetos (nome, cliente_nome, descricao) VALUES (?, ?, ?)")
                        ->execute([$input['nome'], $input['cliente_nome'], $input['descricao'] ?? '']);
                }
                echo json_encode(['success' => true]);
            } elseif ($method === 'DELETE' && $id) {
                $pdo->prepare("DELETE FROM projetos WHERE id = ?")->execute([$id]);
                echo json_encode(['success' => true]);
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
                    $pdo->prepare("UPDATE funcionalidades SET titulo = ?, descricao = ?, complexidade = ?, categoria = ? WHERE id = ?")
                        ->execute([$input['titulo'], $input['descricao'] ?? '', $input['complexidade'], $input['categoria'] ?? '', $id]);
                } else {
                    $pdo->prepare("INSERT INTO funcionalidades (projeto_id, titulo, descricao, complexidade, categoria) VALUES (?, ?, ?, ?, ?)")
                        ->execute([$input['projeto_id'], $input['titulo'], $input['descricao'] ?? '', $input['complexidade'], $input['categoria'] ?? '']);
                }
                echo json_encode(['success' => true]);
            } elseif ($method === 'DELETE' && $id) {
                $pdo->prepare("DELETE FROM funcionalidades WHERE id = ?")->execute([$id]);
                echo json_encode(['success' => true]);
            }
            break;

        case 'templates':
            if ($method === 'GET') {
                echo json_encode($pdo->query("SELECT * FROM templates ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC));
            } elseif ($method === 'POST') {
                if ($id) {
                    $pdo->prepare("UPDATE templates SET nome = ?, descricao = ? WHERE id = ?")->execute([$input['nome'], $input['descricao'] ?? '', $id]);
                } else {
                    $pdo->prepare("INSERT INTO templates (nome, descricao) VALUES (?, ?)")->execute([$input['nome'], $input['descricao'] ?? '']);
                }
                echo json_encode(['success' => true]);
            } elseif ($method === 'DELETE' && $id) {
                $pdo->prepare("DELETE FROM templates WHERE id = ?")->execute([$id]);
                echo json_encode(['success' => true]);
            }
            break;
            
        case 'knowledge_base':
            if ($method === 'GET') {
                echo json_encode($pdo->query("SELECT * FROM knowledge_base ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC));
            } elseif ($method === 'POST') {
                if ($id) {
                    $pdo->prepare("UPDATE knowledge_base SET nome = ?, descricao = ? WHERE id = ?")->execute([$input['nome'], $input['descricao'] ?? '', $id]);
                } else {
                    $pdo->prepare("INSERT INTO knowledge_base (nome, descricao) VALUES (?, ?)")->execute([$input['nome'], $input['descricao'] ?? '']);
                }
                echo json_encode(['success' => true]);
            } elseif ($method === 'DELETE' && $id) {
                $pdo->prepare("DELETE FROM knowledge_base WHERE id = ?")->execute([$id]);
                echo json_encode(['success' => true]);
            }
            break;

        case 'configuracoes':
            if ($method === 'GET') {
                echo json_encode($pdo->query("SELECT * FROM configuracoes")->fetchAll(PDO::FETCH_ASSOC));
            } elseif ($method === 'POST') {
                $pdo->prepare("INSERT INTO configuracoes (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)")
                    ->execute([$input['chave'], $input['valor']]);
                echo json_encode(['success' => true]);
            }
            break;
        
        default:
            http_response_code(404);
            echo json_encode(['error' => "Endpoint nao encontrado: " . htmlspecialchars($res)]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro Interno no Servidor: ' . $e->getMessage()]);
}
?>`;