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

// Consulta por CPF (login do funcionário)
app.post('/api/funcionario-cpf', async (req, res) => {
  const { cpf } = req.body;

  try {
    const funcionarioResult = await pool.query(
      'SELECT * FROM funcionarios WHERE cpf = $1',
      [cpf]
    );

    if (funcionarioResult.rows.length === 0) {
      return res.status(404).json({ mensagem: 'CPF não encontrado.' });
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
      cpf: funcionario.cpf  // <-- CPF SEMPRE enviado
    });
  } catch (err) {
    res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
});

// Checa se a frequência já foi registrada
app.get('/api/checar-frequencia', async (req, res) => {
  const { cpf, tipo } = req.query;

  try {
    const funcionarioResult = await pool.query(
      'SELECT * FROM funcionarios WHERE cpf = $1',
      [cpf]
    );
    if (funcionarioResult.rows.length === 0) {
      return res.json({ confirmada: false });
    }
    const funcionario = funcionarioResult.rows[0];

    const freqResult = await pool.query(
      'SELECT * FROM frequencias WHERE funcionario_id = $1 AND tipo = $2',
      [funcionario.id, tipo]
    );
    res.json({ confirmada: freqResult.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ confirmada: false });
  }
});

// Registro de frequência (entrada/saida)
app.post('/api/frequencia', async (req, res) => {
  const { qrcode_id, tipo } = req.body; // tipo pode ser 'entrada' ou 'saida'

  try {
    // Buscar funcionário pelo qrcode_id
    const funcionarioResult = await pool.query(
      'SELECT * FROM funcionarios WHERE qrcode_id = $1',
      [qrcode_id]
    );

    if (funcionarioResult.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Funcionário não encontrado.' });
    }

    const funcionario = funcionarioResult.rows[0];

    // Checa se já existe registro para esse funcionário e tipo
    const freqResult = await pool.query(
      'SELECT * FROM frequencias WHERE funcionario_id = $1 AND tipo = $2',
      [funcionario.id, tipo]
    );

    if (freqResult.rows.length > 0) {
      return res.status(400).json({
        mensagem: "Frequência já registrada para este funcionário.",
        nome: funcionario.nome,
        tipo,
        data_hora: freqResult.rows[0].data_hora,
      });
    }

    // Horário do Brasil (America/Belem)
    const dataHoraBrasil = new Date().toLocaleString("pt-BR", { 
      timeZone: "America/Belem" 
    });
    // Converter para formato compatível com Postgres (YYYY-MM-DD HH:mm:ss)
    function formatarDataParaPostgres(dataBR) {
      const [date, time] = dataBR.split(", ");
      const [dia, mes, ano] = date.split("/");
      return `${ano}-${mes}-${dia} ${time}`;
    }
    const dataHoraFormatada = formatarDataParaPostgres(dataHoraBrasil);

    // Salva registro se não existe ainda
    const registroResult = await pool.query(
      'INSERT INTO frequencias (funcionario_id, tipo, data_hora) VALUES ($1, $2, $3) RETURNING *',
      [funcionario.id, tipo, dataHoraFormatada]
    );

    res.json({
      nome: funcionario.nome,
      tipo,
      data_hora: registroResult.rows[0].data_hora,
    });
  } catch (err) {
    res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
});

app.listen(4000, () => {
  console.log('Servidor backend rodando na porta 4000');
});
