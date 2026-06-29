import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.POSTGRES_URL);

async function initDB() {
  try {
    console.log('Conectando ao Neon...');

    // Criação da tabela de usuários
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'cliente',
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Tabela "users" verificada/criada.');

    // Inserção de usuários de teste
    await sql`
      INSERT INTO users (name, email, password, role)
      VALUES 
        ('Administrador Hub', 'admin@hub.com', 'admin', 'administrador'),
        ('Marcelo Barudi', 'marcelobarudi71@gmail.com', '123456', 'administrador'),
        ('Cliente Teste', 'cliente@empresa.com', '123456', 'cliente')
      ON CONFLICT (email) DO NOTHING;
    `;
    console.log('Usuários de teste inseridos.');

    // Criação da tabela de chamados (tickets)
    await sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id VARCHAR(20) PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        cat_id VARCHAR(50) NOT NULL,
        priority VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pendente',
        description TEXT,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP
      );
    `;
    console.log('Tabela "tickets" verificada/criada.');

    // Inserção de chamados de teste
    await sql`
      INSERT INTO tickets (id, subject, category, cat_id, priority, status, description, user_id)
      VALUES 
        ('#TK-2045', 'Servidor de arquivos inacessível no setor financeiro', 'Informática/TI', 'it', 'Crítica', 'Em Progresso', 'O servidor de arquivos não responde desde as 10h da manhã.', 1),
        ('#TK-2046', 'Manutenção preventiva no gerador principal', 'Elétrica', 'electric', 'Alta', 'Pendente', 'Agendamento de manutenção periódica para evitar falhas.', 2)
      ON CONFLICT (id) DO NOTHING;
    `;
    console.log('Chamados de teste inseridos.');

  } catch (err) {
    console.error('Erro ao criar tabelas no Neon:', err);
  } finally {
    console.log('Processo finalizado.');
  }
}

initDB();
