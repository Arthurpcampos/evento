'use client';

import { useState } from 'react';
import axios from 'axios';
// import Link from 'next/link'; 
import { Save, Calendar, MapPin, Tag, MessageSquare, Loader2, AlertTriangle, ArrowLeft, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

// --- 1. CONFIGURAÇÃO E CONSTANTES ---

const API_ENDPOINT = 'http://localhost:8080/api/v1/evento';

const EVENTO_TIPOS = [
  'CONGRESSO',
    'TREINAMENTO',
    'WORKSHOP',
    'IMERSÃO',
    'REUNIÃO',
    'HACKATON',
    'STARTUP'
];

const initialFormState = {
  nome: '',
  descricao: '',
  tipo: EVENTO_TIPOS[0],
  local: '',
  dataInicio: '', 
  dataFinal: '',  
  linkEvento: '',
  linkImagem: '',
};

// --- 2. COMPONENTES AUXILIARES (MOVIDOS PARA FORA) ---

// InputField extraído para evitar perda de foco ao renderizar
const InputField = ({ label, name, value, onChange, error, type = 'text', icon: Icon, required, placeholder, ...props }) => (
  <div className="relative mb-6">
    <label htmlFor={name} className="mb-2 block text-sm font-medium text-gray-300">
      {label} {required && <span className="text-purple-400">*</span>}
    </label>
    <div className="relative group">
      <Icon className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-300 ${error ? 'text-red-400' : 'text-gray-500 group-focus-within:text-purple-400'}`} />
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full appearance-none rounded-xl border bg-slate-900/50 py-3 pl-10 pr-4 text-white placeholder-gray-600 shadow-sm backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
            error 
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20 hover:border-white/20'
          }`}
          rows="3"
          {...props}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full appearance-none rounded-xl border bg-slate-900/50 py-3 pl-10 pr-4 text-white placeholder-gray-600 shadow-sm backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
            error 
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20 hover:border-white/20'
          }`}
          {...props}
        />
      )}
    </div>
    {error && <p className="mt-1 text-xs font-medium text-red-400 animate-pulse">{error}</p>}
  </div>
);

// SelectField extraído
const SelectField = ({ label, name, value, onChange, error, icon: Icon, required }) => (
  <div className="relative mb-6">
    <label htmlFor={name} className="mb-2 block text-sm font-medium text-gray-300">
      {label} {required && <span className="text-purple-400">*</span>}
    </label>
    <div className="relative group">
      <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 pointer-events-none z-10 group-focus-within:text-purple-400 transition-colors" />
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full appearance-none rounded-xl border bg-slate-900/50 py-3 pl-10 pr-4 text-white shadow-sm backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 ${
          error 
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
            : 'border-white/10 focus:border-purple-500 focus:ring-purple-500/20 hover:border-white/20'
        }`}
        required
      >
        {EVENTO_TIPOS.map(tipo => (
          <option key={tipo} value={tipo} className="bg-[#0B0F19] text-gray-200">
            {tipo.charAt(0) + tipo.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </div>
    {error && <p className="mt-1 text-xs font-medium text-red-400">{error}</p>}
  </div>
);

// StatusMessage extraído
const StatusMessage = ({ status, message }) => (
  <div className={`p-4 rounded-xl flex items-center mb-8 border backdrop-blur-md shadow-lg transition-all duration-500 ${
      status === 'success' 
      ? 'bg-green-500/10 border-green-500/30 shadow-green-500/10' 
      : 'bg-red-500/10 border-red-500/30 shadow-red-500/10'
  }`}>
    <div className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full ${
        status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
    }`}>
      {status === 'success' ? <Save className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
    </div>
    <p className={`font-semibold ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
      {message}
    </p>
  </div>
);

// --- 3. COMPONENTE PRINCIPAL ---

export default function EventRegistrationPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null); 
  const [errors, setErrors] = useState({});

  const formatDateTime = (dateString) => {
    return dateString;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.nome.trim()) newErrors.nome = 'O nome do evento é obrigatório.';
    if (!formData.descricao.trim()) newErrors.descricao = 'A descrição é obrigatória.';
    if (!formData.local.trim()) newErrors.local = 'O local do evento é obrigatório.';
    if (!formData.dataInicio) newErrors.dataInicio = 'A data de início é obrigatória.';
    if (!formData.dataFinal) newErrors.dataFinal = 'A data de finalização é obrigatória.';

    if (formData.dataInicio && formData.dataFinal) {
      const start = new Date(formData.dataInicio);
      const end = new Date(formData.dataFinal);
      if (start >= end) {
        newErrors.dataFinal = 'A data final deve ser posterior à data de início.';
        isValid = false;
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0 || !isValid) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus(null);
    if (!validateForm()) {
      setSubmissionStatus('error');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      dataInicio: formatDateTime(formData.dataInicio), 
      dataFinal: formatDateTime(formData.dataFinal), 
    };

    try {
      const response = await axios.post(API_ENDPOINT, payload);
      
      if (response.status === 201 || response.status === 200) {
        setSubmissionStatus('success');
        setFormData(initialFormState); 
        setErrors({}); 
      } else {
        setSubmissionStatus('error');
      }
    } catch (err) {
      console.error("Erro no envio do evento:", err);
      const apiErrorMessage = err.response?.data?.message || 'Falha na conexão ou erro interno do servidor.';
      setErrors({ api: apiErrorMessage });
      setSubmissionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionMessage = () => {
    if (submissionStatus === 'success') {
      return <StatusMessage status="success" message="Evento cadastrado com sucesso!" />;
    }
    if (submissionStatus === 'error') {
      const apiError = errors.api;
      if (apiError) {
          return <StatusMessage status="error" message={`Erro do Servidor: ${apiError}`} />;
      }
      return <StatusMessage status="error" message="Verifique os campos obrigatórios e as datas." />;
    }
    return null;
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0B0F19] to-[#0B0F19] text-gray-100 p-6 md:p-12">
      
      {/* Background Decorativo */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        
        {/* Cabeçalho */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <a href="/">
            <button className="group flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Voltar para a Lista
            </button>
          </a>
          
          <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Cadastrar Novo Evento
          </h2>
        </div>
        
        {getSubmissionMessage()}

        {/* Card do Formulário */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          {/* Brilho superior */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              
              {/* Nome e Tipo */}
              <InputField
                label="Nome do Evento"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                error={errors.nome}
                icon={Tag}
                required
                maxLength={150}
                placeholder="Ex: Tech Summit 2024"
              />
              <SelectField
                label="Tipo do Evento"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                error={errors.tipo}
                icon={Tag}
                required
              />
              
              {/* Descrição - Full Width */}
              <div className="md:col-span-2">
                <InputField
                  label="Descrição"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  error={errors.descricao}
                  type="textarea"
                  icon={MessageSquare}
                  required
                  maxLength={500}
                  placeholder="Detalhes sobre o evento, público-alvo, e programação..."
                />
              </div>
              
              {/* Local - Full Width */}
              <div className="md:col-span-2">
                <InputField
                  label="Local"
                  name="local"
                  value={formData.local}
                  onChange={handleChange}
                  error={errors.local}
                  icon={MapPin}
                  required
                  maxLength={150}
                  placeholder="Ex: Centro de Convenções"
                />
              </div>

              {/* Datas */}
              <InputField
                label="Início"
                name="dataInicio"
                value={formData.dataInicio}
                onChange={handleChange}
                error={errors.dataInicio}
                type="datetime-local"
                icon={Calendar}
                required
              />
              <InputField
                label="Término"
                name="dataFinal"
                value={formData.dataFinal}
                onChange={handleChange}
                error={errors.dataFinal}
                type="datetime-local"
                icon={Calendar}
                required
              />
              
              {/* Links Opcionais */}
              <InputField
                label="Link Externo (Opcional)"
                name="linkEvento"
                value={formData.linkEvento}
                onChange={handleChange}
                error={errors.linkEvento}
                icon={LinkIcon} 
                placeholder="https://ingressos.com..."
                maxLength={255}
              />
              <InputField
                label="URL da Imagem (Opcional)"
                name="linkImagem"
                value={formData.linkImagem}
                onChange={handleChange}
                error={errors.linkImagem}
                icon={ImageIcon} 
                placeholder="https://..."
                maxLength={255}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 group relative flex w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-purple-900/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-3" />
                  Confirmar Agendamento
                </>
              )}
            </button>
          </form>
          
          <div className='mt-8 border-t border-white/5 pt-4 text-center'>
            <p className='text-xs font-mono text-gray-600'>POST: {API_ENDPOINT}</p>
          </div>
        </div>
      </div>
    </main>
  );
}