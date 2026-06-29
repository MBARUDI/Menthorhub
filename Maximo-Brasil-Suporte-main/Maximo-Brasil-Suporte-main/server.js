import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const sql = neon(process.env.POSTGRES_URL);

sql`CREATE TABLE IF NOT EXISTS ticket_materiais (
  id SERIAL PRIMARY KEY,
  ticket_id VARCHAR(50) NOT NULL,
  quantidade INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

sql`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS valor_total DECIMAL(10,2)`;

// --- ROTAS DA API ---

// 1. Rota de Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Busca o usuário. Dica: Em um ambiente real, NUNCA grave senhas em texto puro!
    const users = await sql`
      SELECT id, name, email, role, avatar 
      FROM users 
      WHERE email = ${email} AND password = ${password}
    `;

    if (users.length > 0) {
      res.json({ success: true, user: users[0] });
    } else {
      res.status(401).json({ success: false, message: 'E-mail ou senha incorretos' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ success: false, message: 'Erro interno no servidor' });
  }
});

// 2. Buscar todos os chamados
app.get('/api/tickets', async (req, res) => {
  const { userId } = req.query;
  
  try {
    if (!userId) {
      return res.status(400).json({ error: 'userId é obrigatório' });
    }

    const users = await sql`SELECT role, allowed_categories FROM users WHERE id = ${userId}`;
    if (users.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    const user = users[0];
    const isAdmin = user.role.toLowerCase() === 'administrador';
    
    let tickets;
    if (isAdmin) {
      tickets = await sql`
        SELECT id, subject, category, cat_id as "catId", priority, status, description, user_id, created_at, closed_at, valor_total 
        FROM tickets 
        ORDER BY created_at DESC
      `;
    } else {
      const categories = user.allowed_categories ? user.allowed_categories.split(',') : [];
      
      if (categories.length > 0) {
        tickets = await sql`
          SELECT id, subject, category, cat_id as "catId", priority, status, description, user_id, created_at, closed_at, valor_total 
          FROM tickets 
          WHERE user_id = ${userId} OR category = ANY(${categories})
          ORDER BY created_at DESC
        `;
      } else {
        tickets = await sql`
          SELECT id, subject, category, cat_id as "catId", priority, status, description, user_id, created_at, closed_at, valor_total 
          FROM tickets 
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
        `;
      }
    }
    
    res.json(tickets);
  } catch (error) {
    console.error('Erro ao buscar chamados:', error);
    res.status(500).json({ error: 'Erro ao buscar chamados' });
  }
});

// 3. Criar um novo chamado
app.post('/api/tickets', async (req, res) => {
  const { id, subject, category, catId, priority, status, description, user_id } = req.body;
  
  try {
    await sql`
      INSERT INTO tickets (id, subject, category, cat_id, priority, status, description, user_id)
      VALUES (${id}, ${subject}, ${category}, ${catId}, ${priority}, ${status}, ${description}, ${user_id})
    `;
    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Erro ao criar chamado:', error);
    res.status(500).json({ error: 'Erro ao criar chamado' });
  }
});

// 4. Atualizar status de um chamado
app.put('/api/tickets/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, materiais, valorTotal } = req.body;
  
  try {
    const closed_at = status === 'Concluído' ? new Date().toISOString() : null;
    await sql`
      UPDATE tickets 
      SET status = ${status}, closed_at = ${closed_at}, valor_total = ${valorTotal}
      WHERE id = ${id}
    `;
    
    if (status === 'Concluído' && materiais && materiais.length > 0) {
      for (const material of materiais) {
        await sql`
          INSERT INTO ticket_materiais (ticket_id, quantidade, descricao, preco_unitario, subtotal)
          VALUES (${id}, ${material.quantidade}, ${material.descricao}, ${material.precoUnitario}, ${material.subtotal})
        `;
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar chamado:', error);
    res.status(500).json({ error: 'Erro ao atualizar chamado' });
  }
});

// 4.1 Buscar materiais de um ticket
app.get('/api/tickets/:id/materiais', async (req, res) => {
  const { id } = req.params;
  try {
    const materiais = await sql`
      SELECT quantidade, descricao, preco_unitario, subtotal
      FROM ticket_materiais
      WHERE ticket_id = ${id}
      ORDER BY id ASC
    `;
    res.json(materiais);
  } catch (error) {
    console.error('Erro ao buscar materiais:', error);
    res.status(500).json({ error: 'Erro ao buscar materiais' });
  }
});

// 5. Excluir um chamado
app.delete('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM tickets WHERE id = ${id}`;
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir chamado:', error);
    res.status(500).json({ error: 'Erro ao excluir chamado' });
  }
});

// 6. Buscar todos os usuários
app.get('/api/users', async (req, res) => {
  try {
    const usersList = await sql`
      SELECT id, name, email, role, allowed_categories 
      FROM users 
      ORDER BY name ASC
    `;
    res.json(usersList);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// 7. Excluir um usuário
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM users WHERE id = ${id}`;
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

// 8. Atualizar cargo do usuário
app.put('/api/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    await sql`UPDATE users SET role = ${role} WHERE id = ${id}`;
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// 9. Criar um novo usuário
app.post('/api/users', async (req, res) => {
  const { name, email, password, role, allowed_categories } = req.body;
  try {
    await sql`
      INSERT INTO users (name, email, password, role, allowed_categories)
      VALUES (${name}, ${email}, ${password}, ${role}, ${allowed_categories})
    `;
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário, verifique se o email já existe.' });
  }
});

// 10. Editar usuário completo
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, allowed_categories } = req.body;
  try {
    if (password && password.trim() !== '') {
      await sql`
        UPDATE users 
        SET name = ${name}, email = ${email}, password = ${password}, role = ${role}, allowed_categories = ${allowed_categories}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE users 
        SET name = ${name}, email = ${email}, role = ${role}, allowed_categories = ${allowed_categories}
        WHERE id = ${id}
      `;
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao editar usuário:', error);
    res.status(500).json({ error: 'Erro ao editar usuário' });
  }
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`API Server rodando na porta ${PORT}`);
  });
}

export default app;
