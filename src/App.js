import React, { useState } from 'react';
import './App.css';

function App() {
  const [registros, setRegistros] = useState([]);
  const [formulario, setFormulario] = useState({
    tipo: 'entrada',
    transportadora: '',
    placa: '',
    motorista: '',
    cpf: '',
    temAjudante: false,
    ajudante: '',
    cpfAjudante: '',
    operacao: '',
    cliente: '',
    assinatura: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario({
      ...formulario,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const novoRegistro = {
      ...formulario,
      dataHora: new Date().toLocaleString('pt-BR'),
      id: Date.now()
    };
    setRegistros([novoRegistro, ...registros]);

    // Limpar formulário
    setFormulario({
      tipo: 'entrada',
      transportadora: '',
      placa: '',
      motorista: '',
      cpf: '',
      temAjudante: false,
      ajudante: '',
      cpfAjudante: '',
      operacao: '',
      cliente: '',
      assinatura: ''
    });

    alert('Registro salvo com sucesso!');
  };

  const exportarCSV = () => {
    if (registros.length === 0) {
      alert('Não há registros para exportar');
      return;
    }

    const headers = ['Data/Hora', 'Tipo', 'Transportadora', 'Placa', 'Motorista', 'CPF', 'Ajudante', 'CPF Ajudante', 'Operação', 'Cliente'];
    const csvContent = [
      headers.join(','),
      ...registros.map(r => [
        r.dataHora,
        r.tipo,
        r.transportadora,
        r.placa,
        r.motorista,
        r.cpf,
        r.ajudante || '-',
        r.cpfAjudante || '-',
        r.operacao,
        r.cliente
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = \`registros_\${new Date().toISOString().split('T')[0]}.csv\`;
    link.click();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚛 Controle de Acesso - Caminhoneiros</h1>
      </header>

      <main className="container">
        <div className="form-card">
          <h2>Novo Registro</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tipo de Registro:</label>
              <select name="tipo" value={formulario.tipo} onChange={handleChange} required>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>

            <div className="form-group">
              <label>Transportadora:</label>
              <input
                type="text"
                name="transportadora"
                value={formulario.transportadora}
                onChange={handleChange}
                placeholder="Nome da transportadora"
                required
              />
            </div>

            <div className="form-group">
              <label>Placa do Caminhão:</label>
              <input
                type="text"
                name="placa"
                value={formulario.placa}
                onChange={handleChange}
                placeholder="ABC-1234"
                required
              />
            </div>

            <div className="form-group">
              <label>Nome do Motorista:</label>
              <input
                type="text"
                name="motorista"
                value={formulario.motorista}
                onChange={handleChange}
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="form-group">
              <label>CPF do Motorista:</label>
              <input
                type="text"
                name="cpf"
                value={formulario.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="temAjudante"
                  checked={formulario.temAjudante}
                  onChange={handleChange}
                />
                Possui Ajudante?
              </label>
            </div>

            {formulario.temAjudante && (
              <>
                <div className="form-group">
                  <label>Nome do Ajudante:</label>
                  <input
                    type="text"
                    name="ajudante"
                    value={formulario.ajudante}
                    onChange={handleChange}
                    placeholder="Nome completo"
                  />
                </div>

                <div className="form-group">
                  <label>CPF do Ajudante:</label>
                  <input
                    type="text"
                    name="cpfAjudante"
                    value={formulario.cpfAjudante}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Tipo de Operação:</label>
              <select name="operacao" value={formulario.operacao} onChange={handleChange} required>
                <option value="">Selecione...</option>
                <option value="carga">Carga</option>
                <option value="descarga">Descarga</option>
                <option value="manutencao">Manutenção</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div className="form-group">
              <label>Cliente/Destino:</label>
              <input
                type="text"
                name="cliente"
                value={formulario.cliente}
                onChange={handleChange}
                placeholder="Nome do cliente ou destino"
                required
              />
            </div>

            <div className="form-group">
              <label>Assinatura Digital:</label>
              <input
                type="text"
                name="assinatura"
                value={formulario.assinatura}
                onChange={handleChange}
                placeholder="Digite seu nome como assinatura"
                required
              />
            </div>

            <button type="submit" className="btn-submit">
              Registrar {formulario.tipo === 'entrada' ? 'Entrada' : 'Saída'}
            </button>
          </form>
        </div>

        <div className="registros-section">
          <div className="registros-header">
            <h2>Registros ({registros.length})</h2>
            {registros.length > 0 && (
              <button onClick={exportarCSV} className="btn-export">
                📥 Exportar CSV
              </button>
            )}
          </div>

          {registros.length === 0 ? (
            <p className="empty-message">Nenhum registro ainda. Faça o primeiro cadastro!</p>
          ) : (
            <div className="registros-list">
              {registros.map((registro) => (
                <div key={registro.id} className={\`registro-card \${registro.tipo}\`}>
                  <div className="registro-header">
                    <span className="registro-tipo">
                      {registro.tipo === 'entrada' ? '🟢 ENTRADA' : '🔴 SAÍDA'}
                    </span>
                    <span className="registro-data">{registro.dataHora}</span>
                  </div>
                  <div className="registro-body">
                    <p><strong>Transportadora:</strong> {registro.transportadora}</p>
                    <p><strong>Placa:</strong> {registro.placa}</p>
                    <p><strong>Motorista:</strong> {registro.motorista} (CPF: {registro.cpf})</p>
                    {registro.ajudante && (
                      <p><strong>Ajudante:</strong> {registro.ajudante} (CPF: {registro.cpfAjudante})</p>
                    )}
                    <p><strong>Operação:</strong> {registro.operacao}</p>
                    <p><strong>Cliente:</strong> {registro.cliente}</p>
                    <p><strong>Assinatura:</strong> {registro.assinatura}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;