'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import {
    LayoutDashboard, Users, MessageSquare, Settings,
    Search, Bell, Menu, LogOut, Check, CheckCheck,
    User, Bot, Clock, AlertCircle
} from 'lucide-react'

// Interfaces baseadas no seu banco de dados
interface SessaoChat {
    id: string;
    cliente_id: string;
    created_at: string;
    status: string;
    reserva_feita: boolean;
    isOpen: boolean;
    clientes?: { nome: string; whatsapp_id: string }; // Join com a tabela clientes
}

interface Mensagem {
    id: number;
    session_id: string;
    message: {
        type: 'human' | 'ai' | 'system';
        data: { content: string };
    };
}

export default function MensagensPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Estados de dados
    const [sessoes, setSessoes] = useState<SessaoChat[]>([])
    const [sessaoAtiva, setSessaoAtiva] = useState<SessaoChat | null>(null)
    const [mensagens, setMensagens] = useState<Mensagem[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMsg, setLoadingMsg] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    // Menu Lateral
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/', active: false },
        { icon: Users, label: 'Clientes', href: '/clientes', active: false },
        { icon: MessageSquare, label: 'Mensagens', href: '/mensagens', active: true },
        { icon: Settings, label: 'Configurações', href: '#', active: false },
    ]

    // Busca as sessões de chat abertas ou recentes
    useEffect(() => {
        async function fetchSessoes() {
            // Faz um join com a tabela clientes para pegar o nome
            const { data, error } = await supabase
                .from('historico_chat')
                .select('*, clientes(nome, whatsapp_id)')
                .order('created_at', { ascending: false })
                .limit(20)

            if (data) {
                setSessoes(data as SessaoChat[])
            } else if (error) {
                console.error("Erro ao buscar sessões:", error)
            }
            setLoading(false)
        }
        fetchSessoes()
    }, [supabase])

    // Busca as mensagens quando clica em uma sessão
    const carregarMensagens = async (sessao: SessaoChat) => {
        setSessaoAtiva(sessao)
        setLoadingMsg(true)

        // Aqui é onde a mágica acontece: buscamos na n8n_chat_histories usando o ID do historico_chat
        const { data, error } = await supabase
            .from('n8n_chat_histories')
            .select('*')
            .eq('session_id', sessao.id)
            .order('id', { ascending: true })

        if (data) {
            setMensagens(data as Mensagem[])
        }
        setLoadingMsg(false)
    }

    // Helper para formatar a hora
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }

    // Dados Mockados para demonstração caso o banco não tenha mensagens no formato novo ainda
    const mockMessages = [
        { type: 'human', text: 'Olá, gostaria de saber se tem vaga para o próximo final de semana.', time: '10:30' },
        { type: 'ai', text: 'Olá! Sim, temos disponibilidade para o próximo final de semana. Gostaria de ver as opções de quartos?', time: '10:31' },
        { type: 'human', text: 'Sim, por favor. Pode ser o quarto de casal padrão.', time: '10:35' },
        { type: 'ai', text: 'Perfeito. O quarto de casal padrão está R$350/diária. Posso seguir com a sua pré-reserva?', time: '10:35' },
    ]

    return (
        <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">

            {/* SIDEBAR (Mesma lógica das outras telas) */}
            {isSidebarOpen && <div className="fixed inset-0 bg-black/20 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
            <aside className={`fixed md:static inset-y-0 left-0 z-30 bg-white border-r border-gray-100 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64`}>
                <div className={`h-20 flex items-center border-b border-gray-50 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded bg-[#FF6B4A] flex items-center justify-center shrink-0">
                                <span className="text-white font-bold text-lg">M</span>
                            </div>
                            <span className="font-semibold text-xl text-gray-900 whitespace-nowrap">Hotel Maly</span>
                        </div>
                    )}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50"><Menu size={20} /></button>
                </div>
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
                    {navItems.map((item, index) => {
                        const Icon = item.icon
                        return (
                            <Link key={index} href={item.href} title={isCollapsed ? item.label : undefined} className={`flex items-center rounded-xl transition-colors ${isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'} ${item.active ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <Icon size={20} className={item.active ? 'text-[#FF6B4A]' : ''} />
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* MAIN CONTENT DIVIDIDO EM 2 COLUNAS */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">

                {/* TOPBAR */}
                <header className="h-20 bg-white flex items-center justify-between px-4 md:px-8 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-500" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
                        <h1 className="text-xl font-semibold text-gray-900">Auditoria de Conversas</h1>
                    </div>
                </header>

                {/* CHAT INTERFACE */}
                <div className="flex-1 flex overflow-hidden">

                    {/* LISTA DE ATENDIMENTOS (Esquerda) */}
                    <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-100 flex flex-col bg-white">
                        <div className="p-4 border-b border-gray-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="text" placeholder="Buscar atendimento..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-200" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-400 text-sm">Carregando sessões...</div>
                            ) : sessoes.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">Nenhum atendimento encontrado.</div>
                            ) : (
                                sessoes.map((sessao) => (
                                    <div
                                        key={sessao.id}
                                        onClick={() => carregarMensagens(sessao)}
                                        className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${sessaoAtiva?.id === sessao.id ? 'bg-orange-50/50' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-gray-900 truncate pr-2">
                                                {sessao.clientes?.nome || sessao.clientes?.whatsapp_id || 'Cliente Desconhecido'}
                                            </span>
                                            <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(sessao.created_at)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex gap-2">
                                                {sessao.reserva_feita ? (
                                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-green-100 text-green-700">Reserva Feita</span>
                                                ) : (
                                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">Consultando</span>
                                                )}
                                            </div>
                                            {!sessao.isOpen && <span className="text-[10px] font-medium text-gray-400">Encerrado</span>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* PAINEL DE MENSAGENS (Direita) */}
                    <div className={`${sessaoAtiva ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#F8F9FA]`}>

                        {sessaoAtiva ? (
                            <>
                                {/* Header do Chat Ativo */}
                                <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{sessaoAtiva.clientes?.nome || 'Cliente'}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={12} /> ID da Sessão: {sessaoAtiva.id.substring(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Balões de Mensagem */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {loadingMsg ? (
                                        <div className="text-center text-gray-400 text-sm mt-10">Buscando histórico na base n8n...</div>
                                    ) : mensagens.length === 0 ? (

                                        /* MOCK DATA: Se não houver mensagens reais ainda, mostra o visual de demonstração */
                                        <div className="space-y-6">
                                            <div className="bg-yellow-50 text-yellow-800 text-xs text-center py-2 px-4 rounded-lg border border-yellow-100 w-max mx-auto mb-6 flex items-center gap-2">
                                                <AlertCircle size={14} /> Exibindo dados de demonstração (Nenhuma mensagem na tabela n8n para este ID)
                                            </div>

                                            {mockMessages.map((msg, idx) => (
                                                <div key={idx} className={`flex ${msg.type === 'human' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm relative ${msg.type === 'human'
                                                        ? 'bg-[#FF6B4A] text-white rounded-tr-none'
                                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                                        }`}>
                                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                                        <div className={`text-[10px] flex items-center justify-end gap-1 mt-1 ${msg.type === 'human' ? 'text-white/80' : 'text-gray-400'}`}>
                                                            {msg.time}
                                                            {msg.type === 'human' && <CheckCheck size={12} />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                    ) : (
                                        /* DADOS REAIS DA TABELA N8N */
                                        mensagens.map((msg) => {
                                            const isHuman = msg.message.type === 'human';
                                            return (
                                                <div key={msg.id} className={`flex ${isHuman ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm relative ${isHuman
                                                        ? 'bg-[#FF6B4A] text-white rounded-tr-none'
                                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                                        }`}>
                                                        <p className="text-sm leading-relaxed">{msg.message.data.content}</p>
                                                        <div className={`text-[10px] flex items-center justify-end gap-1 mt-1 ${isHuman ? 'text-white/80' : 'text-gray-400'}`}>
                                                            <CheckCheck size={12} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </>
                        ) : (
                            /* ESTADO VAZIO (Nenhum chat selecionado) */
                            <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                    <MessageSquare size={32} className="text-gray-300" />
                                </div>
                                <p className="font-medium text-gray-600">Nenhum atendimento selecionado</p>
                                <p className="text-sm">Selecione uma sessão na lateral para auditar a conversa.</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}