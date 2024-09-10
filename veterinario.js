// Importamos o módulo Express, que nos ajuda a criar um servidor web de maneira fácil
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger_output.json');
// Criamos uma nova aplicação Express
const app = express();
// Importar a configuração do banco de dados
const db = require('./database');

// Configuração do Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 8000; // Usa a variável de ambiente PORT se disponível, caso contrário, usa 8000.


// Definimos a porta em que o servidor irá rodar
const port = $PORT;

// Usamos o middleware CORS para permitir requisições de qualquer origem
app.use(cors());

// Middleware para analisar o corpo da requisição como JSON
app.use(express.json());

// Define uma chave secreta para o JWT
const JWT_SECRET = 'your_secret_key';

// Middleware para proteger rotas
const authenticateToken = (req, res, next) => {
  // Obtém o cabeçalho de autorização
  const authHeader = req.headers['authorization'];
  // Extrai o token do cabeçalho de autorização
  const token = authHeader && authHeader.split(' ')[1];
  
  // Se não houver token, retorna 401 (não autorizado)
  if (token == null) return res.sendStatus(401);

  // Verifica se o token é válido
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Se o token não for válido, retorna 403 (proibido)
    req.user = user; // Adiciona o usuário decodificado ao objeto da requisição
    next(); // Continua para a próxima função de middleware ou rota
  });
};

// Rota para registrar um novo usuário
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  // Verifica se username e password foram fornecidos
  if (!username || !password) {
    return res.status(400).json({ error: 'Por favor, forneça username e password' });
  }

  try {
    // Cria um hash da senha usando argon2
    const hashedPassword = await argon2.hash(password);
    
    // Insere o novo usuário no banco de dados
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
      if (err) {
        console.error('Erro ao registrar usuário:', err.message);
        return res.status(500).json({ error: 'Erro ao registrar usuário' });
      }
      res.status(201).json({ message: 'Usuário registrado com sucesso' });
    });
  } catch (hashErr) {
    console.error('Erro ao criar hash da senha:', hashErr.message);
    res.status(500).json({ error: 'Erro ao criar hash da senha' });
  }
});

// Rota para login de um usuário
app.post('/login', async (req, res) => {
  // Extrai username e password do corpo da requisição
  const { username, password } = req.body;

  // Verifica se username e password foram fornecidos
  if (!username || !password) {
    return res.status(400).json({ error: 'Por favor, forneça username e password' });
  }

  // Busca o usuário no banco de dados com base no username fornecido
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      // Se houver um erro ao buscar o usuário, loga o erro e retorna uma resposta de erro 500
      console.error('Erro ao buscar usuário:', err.message);
      return res.status(500).json({ error: 'Erro ao buscar usuário' });
    }

    // Verifica se o usuário foi encontrado
    if (!user) {
      // Se o usuário não for encontrado, loga a mensagem e retorna uma resposta de erro 401
      console.error('Usuário não encontrado');
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Loga o usuário encontrado para fins de debug
    console.log('Usuário encontrado:', user);

    try {
      // Verifica se a senha fornecida corresponde ao hash armazenado no banco de dados
      const isPasswordValid = await argon2.verify(user.password, password);
      console.log('Senha válida:', isPasswordValid);

      // Se a senha for inválida, retorna uma resposta de erro 401
      if (!isPasswordValid) {
        console.error('Senha inválida');
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Se a senha for válida, gera um token JWT para o usuário autenticado
      const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      console.log('Token gerado:', token);

      // Retorna o token JWT no corpo da resposta
      res.json({ token });
    } catch (verifyErr) {
      // Se houver um erro ao verificar a senha, loga o erro e retorna uma resposta de erro 500
      console.error('Erro ao verificar senha:', verifyErr.message);
      res.status(500).json({ error: 'Erro ao verificar senha' });
    }
  });
});


// Rota para listar todos os pets
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar users' });
      return;
    }
    res.json(rows);
  });
});

// Rota para listar todos os pets
app.get('/pets', authenticateToken, (req, res) => {
  db.all('SELECT * FROM pets', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar pets' });
      return;
    }
    res.json(rows);
  });
});

// Rota para cadastrar um novo pet
app.post('/pets', authenticateToken, (req, res) => {
  const { name, age, type, owner } = req.body; // Pegamos os dados do corpo da requisição
  db.run('INSERT INTO pets(name, age, type, owner) VALUES (?, ?, ?, ?)', [name, age, type, owner],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Erro ao adicionar o pet' });
        return;
      }
      res.status(201).json({ id: this.lastID, name, age, type, owner, image: null });
    }
  );
});

// Rota para atualizar informações sobre um pet
app.put('/pets/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id, 10); // Pegamos o ID da URL e o transformamos em um número
  const { name, age, type, owner } = req.body; // Pegamos os dados do corpo da requisição

  db.run('UPDATE pets SET name = ?, age = ?, type = ?, owner = ? WHERE id = ?', [name, age, type, owner, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: 'Erro ao atualizar pet' });
        return;
      }
      if (this.changes > 0) {
        res.json({ id, name, age, type, owner });
      } else {
        res.status(404).json({ error: 'Pet não encontrado' });
      }
    }
  );
});

// Rota para deletar informações sobre um pet
app.delete('/pets/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id, 10); // Pegamos o ID da URL e o transformamos em um número

  db.run('DELETE FROM pets WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Erro ao deletar o pet' });
      return;
    }
    if (this.changes > 0) {
      res.json({ message: 'Pet deletado com sucesso' });
    } else {
      res.status(404).json({ error: 'Pet não encontrado' });
    }
  });
});

// Rota para encontrar informações sobre um pet
app.get('/pets/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id, 10); // Pegamos o ID da URL e o transformamos em um número

  db.get('SELECT * FROM pets WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao buscar pet' });
      return;
    }

    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Pet não encontrado' });
    }
  });
});

// Rota para cadastrar uma nova imagem para um pet
app.post('/pets/:id/image', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id, 10); // Pegamos o ID da URL e o transformamos em um número
  const { image } = req.body;

  db.run('UPDATE pets SET image = ? WHERE id = ?', [image, id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Erro ao atualizar imagem do pet' });
      return;
    }
    if (this.changes > 0) {
      res.json({ id, image });
    } else {
      res.status(404).json({ error: 'Pet não encontrado' });
    }
  });
});

// Iniciamos o servidor e fazemos com que ele escute na porta definida

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});


