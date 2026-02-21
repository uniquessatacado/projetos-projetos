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

function addColumnIfMissing($pdo, $table, $column, $definition) {
    $stmt = $pdo->query("SHOW COLUMNS FROM \`$table\` LIKE '$column'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE \`$table\` ADD \`$column\` $definition");
    }
}

function initTables($pdo) {
    // Projetos
    $pdo->exec("CREATE TABLE IF NOT EXISTS projetos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cliente_nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        status VARCHAR(50) DEFAULT 'aguardando_inicio',
        prazo_entrega DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    addColumnIfMissing($pdo, 'projetos', 'started_at', 'TIMESTAMP NULL');
    addColumnIfMissing($pdo, 'projetos', 'finished_at', 'TIMESTAMP NULL');

    // Funcionalidades
    $pdo->exec("CREATE TABLE IF NOT EXISTS funcionalidades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        projeto_id INT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        complexidade VARCHAR(50) NOT NULL,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB");

    addColumnIfMissing($pdo, 'funcionalidades', 'descricao', 'TEXT');
    addColumnIfMissing($pdo, 'funcionalidades', 'observacoes', 'TEXT');
    addColumnIfMissing($pdo, 'funcionalidades', 'status', "VARCHAR(50) DEFAULT 'pendente'");
    addColumnIfMissing($pdo, 'funcionalidades', 'ordem', 'INT DEFAULT 0');
    addColumnIfMissing($pdo, 'funcionalidades', 'data_programada', 'DATE');

    // Outras Tabelas
    $pdo->exec("CREATE TABLE IF NOT EXISTS templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    $pdo->exec("CREATE TABLE IF NOT EXISTS configuracoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chave VARCHAR(50) UNIQUE NOT NULL,
        valor TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");
}

$path = isset($_GET['path']) ? $_GET['path'] : '';
$method = $_SERVER['REQUEST_METHOD'];
$pathParts = explode('/', $path);
$resource = $pathParts[0];
$id = isset($pathParts[1]) ? $pathParts[1] : null;
$input = json_decode(file_get_contents('php://input'), true);

try {
    $pdo = getPdo();
    
    switch ($resource) {
        case 'projetos':
            if ($method === 'GET') {
                if ($id) {
                    $stmt = $pdo->prepare("SELECT * FROM projetos WHERE id = ?");
                    $stmt->execute([$id]);
                    $res = $stmt->fetch(PDO::FETCH_ASSOC);
                    echo json_encode($res ?: new stdClass());
                } else {
                    $stmt = $pdo->query("SELECT * FROM projetos ORDER BY id DESC");
                    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
                }
            } elseif ($method === 'POST') {
                if ($id) {
                    $fields = []; $params = [];
                    foreach($input as $k => $v) { $fields[] = "\`$k\` = ?"; $params[] = $v; }
                    $params[] = $id;
                    $stmt = $pdo->prepare("UPDATE projetos SET " . implode(', ', $fields) . " WHERE id = ?");
                    $stmt->execute($params);
                    echo json_encode(['success' => true]);
                } else {
                    $stmt = $pdo->prepare("INSERT INTO projetos (nome, cliente_nome, descricao, prazo_entrega) VALUES (?, ?, ?, ?)");
                    $stmt->execute([$input['nome'], $input['cliente_nome'], $input['descricao'] ?? '', $input['prazo_entrega'] ?? null]);
                    echo json_encode(['id' => $pdo->lastInsertId()]);
                }
            }
            break;

        case 'funcionalidades':
            if ($method === 'GET') {
                $projeto_id = $_GET['projeto_id'] ?? 0;
                $stmt = $pdo->prepare("SELECT * FROM funcionalidades WHERE projeto_id = ? ORDER BY ordem ASC, id ASC");
                $stmt->execute([$projeto_id]);
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            } elseif ($method === 'POST') {
                if ($id) {
                    $fields = []; $params = [];
                    foreach($input as $k => $v) { $fields[] = "\`$k\` = ?"; $params[] = $v; }
                    $params[] = $id;
                    $stmt = $pdo->prepare("UPDATE funcionalidades SET " . implode(', ', $fields) . " WHERE id = ?");
                    $stmt->execute($params);
                    echo json_encode(['success' => true]);
                } else {
                    $stmt = $pdo->prepare("INSERT INTO funcionalidades (projeto_id, titulo, complexidade, descricao, ordem) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([$input['projeto_id'], $input['titulo'], $input['complexidade'], $input['descricao'] ?? '', $input['ordem'] ?? 0]);
                    echo json_encode(['id' => $pdo->lastInsertId()]);
                }
            } elseif ($method === 'DELETE' && $id) {
                $stmt = $pdo->prepare("DELETE FROM funcionalidades WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true]);
            }
            break;

        case 'templates':
            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT * FROM templates ORDER BY id DESC");
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            } elseif ($method === 'POST') {
                $stmt = $pdo->prepare("INSERT INTO templates (nome, descricao) VALUES (?, ?)");
                $stmt->execute([$input['nome'], $input['descricao'] ?? '']);
                echo json_encode(['id' => $pdo->lastInsertId()]);
            } elseif ($method === 'DELETE' && $id) {
                $stmt = $pdo->prepare("DELETE FROM templates WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true]);
            }
            break;

        case 'configuracoes':
            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT * FROM configuracoes");
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            } elseif ($method === 'POST') {
                $stmt = $pdo->prepare("INSERT INTO configuracoes (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)");
                $stmt->execute([$input['chave'], $input['valor']]);
                echo json_encode(['success' => true]);
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint não encontrado']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>`;