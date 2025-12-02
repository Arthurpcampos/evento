'use client'; 

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, Link as LinkIcon, Image as ImageIcon, Loader2, AlertTriangle, Plus, Sparkles } from 'lucide-react';
// import Link from 'next/link'; // Removido para compatibilidade com o preview

// --- 1. CONFIGURAÇÃO E CONSTANTES ---

const API_ENDPOINT = 'http://localhost:8080/api/v1/evento';

// --- 2. UTILITÁRIO DE FORMATAÇÃO DE DATA ---

function formatEventDates(dataInicio, dataFinal) {
  const startDate = new Date(dataInicio);
  const endDate = new Date(dataFinal);
  
  const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  
  const startDay = startDate.toLocaleDateString('pt-BR', dateOptions);
  const startTime = startDate.toLocaleTimeString('pt-BR', timeOptions);
  
  const endDay = endDate.toLocaleDateString('pt-BR', dateOptions);
  const endTime = endDate.toLocaleTimeString('pt-BR', timeOptions);
  
  const isMultiDay = startDay !== endDay;

  let schedule = '';
  if (isMultiDay) {
    schedule = `${startDay} ${startTime} - ${endDay} ${endTime}`;
  } else if (startTime !== endTime) {
    schedule = `${startDay} das ${startTime} às ${endTime}`;
  } else {
    schedule = `${startDay} às ${startTime}`;
  }

  return { 
    startDay, 
    startTime, 
    fullSchedule: schedule, 
    isMultiDay 
  };
}

// --- 3. COMPONENTE DE MINIATURA (MINIEVENTCARD) ---

function MiniEventCard({ evento }) {
  const { fullSchedule } = formatEventDates(evento.dataInicio, evento.dataFinal);
  
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:bg-white/10 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer">
      
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 blur transition duration-500 group-hover:opacity-20"></div>

      <div className="relative flex items-start z-10">
        <div className="mr-4 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 shadow-inner">
          <MapPin className="h-6 w-6 text-purple-400 drop-shadow-lg" />
        </div>

        <div>
          <h3 className="mb-1 text-lg font-bold text-white transition-colors duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400">
            {evento.nome}
          </h3>
          <div className="flex items-center text-xs font-semibold uppercase tracking-wide text-gray-400">
            <Calendar className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
            <span>{fullSchedule}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-300 line-clamp-2">
            {evento.descricao}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- 4. COMPONENTE DE DESTAQUE (FEATUREDEVENTCARD) ---

function FeaturedEventCard({ evento }) {
  const { fullSchedule } = formatEventDates(evento.dataInicio, evento.dataFinal);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur-xl transition-transform duration-300 sm:flex sm:min-h-[450px]">
      
      {/* Background Decorativo */}
      <div className="absolute right-0 top-0 -mt-20 -mr-20 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-[300px] w-[300px] rounded-full bg-blue-600/20 blur-[80px]"></div>
      
      <div className="relative z-10 flex flex-col justify-center p-8 sm:w-2/3 md:p-12">
        <div className="mb-4 inline-flex items-center self-start rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-purple-300 border border-purple-500/20">
          <Sparkles className="mr-1 h-3 w-3" /> Evento Destaque
        </div>

        <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            {evento.nome}
           </span>
        </h1>
        <p className="mb-8 text-lg font-medium text-gray-300 md:text-xl">
          {evento.descricao}
        </p>

        <div className="mb-8 flex flex-wrap gap-4 md:gap-8">
          <div className="flex items-center rounded-lg bg-white/5 px-4 py-2 backdrop-blur-sm border border-white/5">
            <Calendar className="mr-3 h-5 w-5 text-pink-400" />
            <span className="font-medium text-gray-200">{fullSchedule}</span>
          </div>
          <div className="flex items-center rounded-lg bg-white/5 px-4 py-2 backdrop-blur-sm border border-white/5">
            <MapPin className="mr-3 h-5 w-5 text-blue-400" />
            <span className="font-medium text-gray-200">{evento.local}</span>
          </div>
        </div>
        
        {evento.linkEvento && (
          <a href={evento.linkEvento} target="_blank" rel="noopener noreferrer">
            <button className="group relative flex items-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-purple-900/40 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40">
              <span className="relative z-10 flex items-center">
                <LinkIcon className="mr-2 h-5 w-5" />
                Acessar Ingressos
              </span>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            </button>
          </a>
        )}
      </div>
      
      {/* Imagem com Fade */}
      <div className="relative hidden sm:block sm:w-1/3">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-transparent z-10"></div>
        <div className="h-full w-full">
          {evento.linkImagem ? (
            <img 
              src={evento.linkImagem} 
              alt={`Imagem de ${evento.nome}`} 
              className="h-full w-full object-cover opacity-80 mix-blend-overlay transition-opacity duration-500 hover:opacity-100 hover:mix-blend-normal"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-800">
              <ImageIcon className="h-20 w-20 text-slate-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 5. PÁGINA PRINCIPAL (EVENTLISTPAGE) ---

export default function EventListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await axios.get(API_ENDPOINT);
        setEvents(response.data); 
      } catch (err) {
        console.error("Erro ao buscar eventos:", err);
        setError('❌ Erro ao conectar com o servidor. Verifique se o backend está rodando.');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // --- Renderização Condicional ---
  
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-8">
        <div className="relative">
            <div className="absolute inset-0 rounded-full bg-purple-500 blur-xl opacity-20"></div>
            <Loader2 className="relative h-16 w-16 animate-spin text-purple-500" />
        </div>
        <p className="mt-6 text-xl font-medium text-gray-400 animate-pulse">
          Sincronizando calendário...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-8 text-center">
        <div className="rounded-full bg-red-500/10 p-6 mb-6">
            <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Ops! Algo deu errado.</h2>
        <p className="text-gray-400 max-w-md">{error}</p>
        <button 
            onClick={() => window.location.reload()}
            className="mt-8 rounded-full bg-white/10 px-6 py-2 text-sm font-semibold text-white hover:bg-white/20 transition"
        >
            Tentar Novamente
        </button>
      </div>
    );
  }

  // Estado vazio estilizado
  if (events.length === 0) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0F19] p-8 text-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0B0F19] to-black">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500 blur-[60px] opacity-20"></div>
            <Calendar className="relative h-24 w-24 text-slate-700" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Agenda Vazia</h2>
        <p className="text-gray-400 mb-8 max-w-md">Não há eventos programados para os próximos dias. Que tal criar o primeiro agora?</p>
        
        <a href="/cadastro">
            <button className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-600 to-blue-600 p-0.5 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:from-purple-500 hover:to-blue-500">
              <span className="relative flex items-center rounded-full bg-slate-900/50 px-8 py-3 transition-all duration-300 group-hover:bg-transparent">
                <Plus className="mr-2 h-5 w-5" />
                Criar Primeiro Evento
              </span>
            </button>
        </a>
      </div>
    );
  }
  
  const featuredEvent = events[0];
  const miniEvents = events.slice(1);

  return (
    <main className="min-h-screen bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0B0F19] to-[#0B0F19] text-gray-100">
      <div className="container mx-auto px-4 py-16">
        
        {/* CABEÇALHO */}
        <div className="mb-16 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="text-5xl font-black uppercase tracking-tighter text-white sm:text-6xl">
              Event<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Flow</span>
            </h2>
            <p className="mt-2 text-lg text-gray-400 font-light">Gerenciamento de experiências imersivas</p>
          </div>

          <a href="/cadastro">
              <button className="group relative flex items-center justify-center rounded-full bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
                  <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7] animate-pulse"></div>
                  <Plus className="mr-2 h-5 w-5 text-purple-400 group-hover:rotate-90 transition-transform duration-300" />
                  Novo Evento
              </button>
          </a>
        </div>
        
        {/* SEÇÃO DE DESTAQUE */}
        <section className="mb-20">
          <FeaturedEventCard evento={featuredEvent} />
        </section>

        {/* LISTA DE EVENTOS */}
        {miniEvents.length > 0 && (
          <>
            <div className="mb-10 flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                Próximos Eventos
              </h3>
              <span className="text-sm font-medium text-gray-500">{miniEvents.length} eventos encontrados</span>
            </div>
            
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {miniEvents.map(evento => (
                <MiniEventCard key={evento.id} evento={evento} />
              ))}
            </section>
          </>
        )}
        
        {/* RODAPÉ TÉCNICO */}
        <div className="mt-24 border-t border-white/5 pt-8 text-center">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-widest">
                Sistema Conectado via Axios • API: <span className="text-gray-500 font-mono">{API_ENDPOINT}</span>
            </p>
        </div>

      </div>
    </main>
  );
}