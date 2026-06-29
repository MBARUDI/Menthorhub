import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.POSTGRES_URL);

async function run() {
  try {
    await sql`UPDATE users SET role = 'cliente' WHERE email = 'marcelobarudi71@gmail.com'`;
    console.log('Permissões de Marcelo Barudi alteradas para cliente!');
  } catch (error) {
    console.error('Erro:', error);
  }
}

run();
