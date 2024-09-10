const sqlite3 = require('sqlite3').verbose();

// Criar ou abrir o banco de dados SQLite
const db = new sqlite3.Database('pets.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        
        // Criar a tabela 'pets' se não existir
        db.run(`
            CREATE TABLE IF NOT EXISTS pets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                age INTEGER,
                type TEXT,
                owner TEXT,
                image TEXT
            )
        `, (err) => {
            if (err) {
                console.error('Erro ao criar a tabela "pets":', err.message);
            } else {
                console.log('Tabela "pets" criada ou já existe.');
            }
        });

        // Criar a tabela 'users' se não existir
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT
            )
        `, (err) => {
            if (err) {
                console.error('Erro ao criar a tabela "users":', err.message);
            } else {
                console.log('Tabela "users" criada ou já existe.');
            }
        });
    }
});

module.exports = db;
