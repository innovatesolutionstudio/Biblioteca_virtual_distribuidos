<?php
// Mostrar errores en desarrollo
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Forzar siempre salida JSON
header('Content-Type: application/json');

// Manejador global de errores fatales
register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(500);
        echo json_encode(['respuesta' => '❌ Error fatal: ' . $error['message']]);
    }
});

require __DIR__ . '/vendor/autoload.php';
use Kreait\Firebase\Factory;

// Leer y validar JSON recibido
$inputRaw = file_get_contents("php://input");
$input = json_decode($inputRaw, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    $respuesta = ['respuesta' => '❌ Error en el formato del JSON recibido.'];
    error_log("📤 Respuesta JSON enviada: " . json_encode($respuesta));
    echo json_encode($respuesta);
    exit;
}

$pregunta = trim($input['pregunta'] ?? '');

if (empty($pregunta)) {
    http_response_code(400);
    $respuesta = ['respuesta' => '❌ No se recibió ninguna pregunta.'];
    error_log("📤 Respuesta JSON enviada: " . json_encode($respuesta));
    echo json_encode($respuesta);
    exit;
}

// Verifica si es una pregunta sobre libros
function esPreguntaDeLibro($pregunta) {
    $patrones = [
        '/¿tienen.*libro/i',
        '/¿existe.*(libro|biblioteca)/i',
        '/¿está.*(disponible|libro)/i',
        '/¿puedo.*(leer|buscar|consultar)/i',
        '/libro/i',
        '/biblioteca/i'
    ];
    foreach ($patrones as $patron) {
        if (preg_match($patron, $pregunta)) return true;
    }
    return false;
}

// Si es pregunta de libro, consultar microservicio
if (esPreguntaDeLibro($pregunta)) {
    $ch = curl_init('http://preguntalb-service:4100/consultar-libro');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['pregunta' => $pregunta]),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT => 10
    ]);

    $respuestaLibros = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        http_response_code(502);
        $respuesta = ['respuesta' => '❌ Error al consultar libros: ' . $error];
        error_log("📤 Respuesta JSON enviada: " . json_encode($respuesta));
        echo json_encode($respuesta);
        exit;
    }

    $json = json_decode($respuestaLibros, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(502);
        $respuesta = ['respuesta' => '❌ Respuesta inválida del microservicio de libros.'];
        error_log("📤 Respuesta JSON enviada: " . json_encode($respuesta));
        echo json_encode($respuesta);
        exit;
    }

    $respuesta = ['respuesta' => $json['resultado'] ?? 'ℹ️ No hay respuesta del microservicio'];
    error_log("📤 Respuesta JSON enviada: " . json_encode($respuesta));
    echo json_encode($respuesta);
    exit;
}

// Pregunta general a Cohere
function consultarCohere($pregunta) {
    $apiKey = 'ExqGxevtAKkfSgZchLSIgkZUcU3lASAucNEB5xWP';
    $prompt = <<<TXT
Eres un asistente experto multilingüe especializado en todo lo relacionado con Bolivia.

Tu tarea es la siguiente:
Toda respuesta debe estar en español.
Solo debes responder si la pregunta está relacionada con Bolivia.
✅ Temas permitidos:
Historia de Bolivia, líderes, geografía, cultura, economía, política...
❌ Si no es sobre Bolivia, responde:
Lo siento, solo puedo responder preguntas relacionadas con la historia o la realidad de Bolivia.
Ahora responde esta pregunta:
$pregunta
dame la respuesta en castellano no en ingles o en otra idioma solo castellano 
TXT;

    $data = [
        'model' => 'command',
        'prompt' => $prompt,
        'max_tokens' => 200,
        'temperature' => 0.7
    ];

    $headers = [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ];

    $ch = curl_init('https://api.cohere.ai/v1/generate');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 15
    ]);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) return "❌ Error al conectar con Cohere: $error";

    $json = json_decode($response, true);
    return $json['generations'][0]['text'] ?? '⚠️ No se pudo obtener respuesta de la IA.';
}

// Ejecutar consulta general
$respuestaIA = consultarCohere($pregunta);
$respuesta = ['respuesta' => $respuestaIA];
error_log("📤 Respuesta JSON enviada: " . json_encode($respuesta));
echo json_encode($respuesta);
