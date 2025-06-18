<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Chatbot Biblioteca Virtual</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f3f3f3;
            padding: 2rem;
            display: flex;
            justify-content: center;
        }
        .chat-container {
            background-color: #fff;
            padding: 2rem;
            border-radius: 8px;
            width: 100%;
            max-width: 600px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        input[type="text"] {
            width: 100%;
            padding: 0.7rem;
            margin-bottom: 1rem;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        button {
            padding: 0.7rem 1.5rem;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .respuesta {
            margin-top: 1rem;
            padding: 1rem;
            background-color: #e9f5ff;
            border: 1px solid #b3e5fc;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <h2>Chatbot Biblioteca</h2>
        <form id="chat-form">
            <input type="text" id="pregunta" placeholder="Escribe tu pregunta..." required>
            <button type="submit">Enviar</button>
        </form>
        <div id="respuesta" class="respuesta" style="display: none;"></div>
    </div>

    <script>
        document.getElementById('chat-form').addEventListener('submit', async function(e) {
            e.preventDefault();

            const pregunta = document.getElementById('pregunta').value.trim();
            const respuestaDiv = document.getElementById('respuesta');
            respuestaDiv.style.display = 'none';
            respuestaDiv.innerText = '';

            if (!pregunta) return;

            try {
                const res = await fetch('chatbot.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pregunta })
                });

                const data = await res.json();
                respuestaDiv.innerText = data.respuesta;
                respuestaDiv.style.display = 'block';
            } catch (err) {
                respuestaDiv.innerText = 'Error al conectar con el chatbot.';
                respuestaDiv.style.display = 'block';
            }
        });
    </script>
</body>
</html>
