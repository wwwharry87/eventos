const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
// Teste de rota
app.get('/', (req, res) => {
  res.send('API rodando!');
});
app.post('/api/funcionario-cpf', async (req, res) => {
    const { cpf } = req.body;
  
    const funcionarioResult = await pool.query(
      'SELECT * FROM funcionarios WHERE cpf = $1',
      [cpf]
    );
  
    if (funcionarioResult.rows.length === 0) {
      return res.status(404).json({ mensagem: 'CPF não cadastrado.' });
    }
  
    const funcionario = funcionarioResult.rows[0];
  
    // Verifica se hoje é aniversário
    const hoje = new Date();
    const nascimento = new Date(funcionario.data_nascimento);
    const aniversariante =
      hoje.getDate() === nascimento.getDate() && hoje.getMonth() === nascimento.getMonth();
  
    res.json({
      nome: funcionario.nome,
      qrcode_id: funcionario.qrcode_id,
      aniversariante,
      data_nascimento: funcionario.data_nascimento,
    });
  });
  

  app.post('/api/frequencia', async (req, res) => {
    const { qrcode_id, tipo } = req.body; // tipo pode ser 'entrada' ou 'saida'
  
    // Buscar funcionário pelo qrcode_id
    const funcionarioResult = await pool.query(
      'SELECT * FROM funcionarios WHERE qrcode_id = $1',
      [qrcode_id]
    );
  
    if (funcionarioResult.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Funcionário não encontrado.' });
    }
  
    const funcionario = funcionarioResult.rows[0];
  
    // Salvar registro de frequência
    const registroResult = await pool.query(
      'INSERT INTO frequencias (funcionario_id, tipo) VALUES ($1, $2) RETURNING *',
      [funcionario.id, tipo]
    );
  
    res.json({
      nome: funcionario.nome,
      tipo,
      data_hora: registroResult.rows[0].data_hora,
    });
  });

  app.get('/api/checar-frequencia', async (req, res) => {
    const { cpf, tipo } = req.query;
    const funcionarioResult = await pool.query('SELECT id FROM funcionarios WHERE cpf = $1', [cpf]);
    if (funcionarioResult.rows.length === 0) {
      return res.json({ confirmada: false });
    }
    const funcionario_id = funcionarioResult.rows[0].id;
    const freq = await pool.query(
      'SELECT * FROM frequencias WHERE funcionario_id = $1 AND tipo = $2',
      [funcionario_id, tipo]
    );
    res.json({ confirmada: freq.rows.length > 0 });
  });
  
  
app.listen(4000, () => {
  console.log('Servidor backend rodando na porta 4000');
});
