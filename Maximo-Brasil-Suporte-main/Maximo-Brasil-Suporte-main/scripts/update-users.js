import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.POSTGRES_URL);

async function run() {
  try {
    console.log('Atualizando banco de dados...');
    
    // Adicionar a coluna allowed_categories se não existir
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_categories VARCHAR(255)`;
    
    // Voltar marcelobarudi71@gmail.com para administrador
    await sql`UPDATE users SET role = 'administrador', allowed_categories = NULL WHERE email = 'marcelobarudi71@gmail.com'`;
    
    // Garantir que o admin seja administrador
    await sql`UPDATE users SET role = 'administrador', allowed_categories = NULL WHERE email = 'admin@hub.com'`;

    // Inserir os usuários de teste para cada categoria
    await sql`
      INSERT INTO users (name, email, password, role, allowed_categories)
      VALUES 
        ('Administrador Master', 'admin', 'admin', 'administrador', NULL),
        ('Técnico TI', 'ti@hub.com', '123456', 'técnico', 'Informática/TI'),
        ('Técnico Elétrica', 'eletrica@hub.com', '123456', 'técnico', 'Elétrica'),
        ('Técnico Predial', 'predial@hub.com', '123456', 'técnico', 'Predial/Civil'),
        ('Agente Segurança', 'seguranca@hub.com', '123456', 'técnico', 'Segurança'),
        ('Técnico Telecom', 'telecom@hub.com', '123456', 'técnico', 'Telecom')
      ON CONFLICT (email) DO UPDATE 
      SET allowed_categories = EXCLUDED.allowed_categories, role = 'técnico';
    `;
    
    console.log('Banco de dados atualizado com novos usuários e coluna allowed_categories!');
  } catch (error) {
    console.error('Erro:', error);
  }
}

run();
