'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import {
    LayoutDashboard, Users, MessageSquare, Settings,
    Search, Bell, Menu, LogOut, CheckCheck,
    User, Clock, AlertCircle, ChevronLeft, CalendarDays, Hash
} from 'lucide-react'

// Interfaces do Banco
interface Cliente {
    id: string;
    whatsapp_id: string;
    nome: string | null;
    created_at: string;
}

interface SessaoChat {
    id: string;
    cliente_id: string;
    created_at: string;
    status: string;
    reserva_feita: boolean;
    isOpen: boolean;
}

interface Mensagem {
    id: number;
    session_id: string;
    message: {
        type: 'human' | 'ai' | 'system';
        content: string;
    };
}

export default function MensagensPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Estados Nível 1: Clientes
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [clienteAtivo, setClienteAtivo] = useState<Cliente | null>(null)
    const [loadingClientes, setLoadingClientes] = useState(true)

    // Estados Nível 2: Sessões/Atendimentos
    const [sessoes, setSessoes] = useState<SessaoChat[]>([])
    const [sessaoAtiva, setSessaoAtiva] = useState<SessaoChat | null>(null)
    const [loadingSessoes, setLoadingSessoes] = useState(false)

    // Estados Nível 3: Mensagens
    const [mensagens, setMensagens] = useState<Mensagem[]>([])
    const [loadingMsg, setLoadingMsg] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/', active: false },
        { icon: Users, label: 'Clientes', href: '/clientes', active: false },
        { icon: MessageSquare, label: 'Mensagens', href: '/mensagens', active: true },
        { icon: Settings, label: 'Configurações', href: '#', active: false },
    ]

    // 1. Busca todos os Clientes ao abrir a tela
    useEffect(() => {
        async function fetchClientes() {
            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) setClientes(data)
            setLoadingClientes(false)
        }
        fetchClientes()
    }, [supabase])

    // 2. Quando clica num Cliente, busca o Histórico dele
    const selecionarCliente = async (cliente: Cliente) => {
        setClienteAtivo(cliente)
        setSessaoAtiva(null) // Limpa a sessão anterior
        setMensagens([])
        setLoadingSessoes(true)

        const { data } = await supabase
            .from('historico_chat')
            .select('*')
            .eq('cliente_id', cliente.id)
            .order('created_at', { ascending: false })

        if (data) setSessoes(data)
        setLoadingSessoes(false)
    }

    // 3. Quando clica num Atendimento, busca as Mensagens
    const selecionarSessao = async (sessao: SessaoChat) => {
        setSessaoAtiva(sessao)
        setLoadingMsg(true)

        const { data } = await supabase
            .from('n8n_chat_histories')
            .select('*')
            .eq('session_id', sessao.id)
            .order('id', { ascending: true })

        if (data) setMensagens(data)
        setLoadingMsg(false)
    }

    // Helpers de Data
    const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

    // Pegar iniciais para o Avatar
    const getInitials = (nome: string | null) => {
        if (!nome) return '?'
        return nome.replace(/[^a-zA-Z ]/g, "").trim().substring(0, 2).toUpperCase()
    }

    return (
        <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">

            {/* SIDEBAR DO SISTEMA */}
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

            {/* ÁREA PRINCIPAL DIVIDIDA EM 3 COLUNAS */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">

                {/* TOPBAR */}
                <header className="h-20 bg-white flex items-center justify-between px-4 md:px-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-500" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
                        <h1 className="text-lg font-semibold text-gray-900">Caixa de Entrada</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-400 hover:text-gray-600"><Bell size={20} /></button>
                        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="text-gray-400 hover:text-red-500" title="Sair">
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                {/* CONTAINER DAS 3 COLUNAS */}
                <div className="flex-1 flex overflow-hidden">

                    {/* COLUNA 1: LISTA DE CLIENTES */}
                    {/* No mobile, some se tiver um cliente selecionado */}
                    <div className={`w-full lg:w-[320px] border-r border-gray-100 flex-col bg-white ${clienteAtivo ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-gray-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="text" placeholder="Buscar cliente..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-200" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loadingClientes ? (
                                <div className="p-8 text-center text-gray-400 text-sm">Carregando clientes...</div>
                            ) : clientes.map((cliente) => (
                                <div
                                    key={cliente.id}
                                    onClick={() => selecionarCliente(cliente)}
                                    className={`flex items-center gap-3 p-4 border-b border-gray-50 cursor-pointer transition-colors ${clienteAtivo?.id === cliente.id ? 'bg-[#FF6B4A]/5' : 'hover:bg-gray-50'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${clienteAtivo?.id === cliente.id ? 'bg-[#FF6B4A] text-white' : 'bg-gray-100 text-gray-600'}`}>
                                        {getInitials(cliente.nome)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate text-sm">{cliente.nome || 'Sem Nome'}</h4>
                                        <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">{cliente.whatsapp_id}</p>
                                    </div>
                                    <ChevronLeft size={16} className={`text-gray-300 transform rotate-180 ${clienteAtivo?.id === cliente.id ? 'text-[#FF6B4A]' : 'opacity-0'}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* COLUNA 2: HISTÓRICO DE ATENDIMENTOS */}
                    {/* No mobile, some se tiver uma sessão ativa ou se nenhum cliente foi selecionado */}
                    <div className={`w-full lg:w-[320px] border-r border-gray-100 flex-col bg-gray-50/50 ${(!clienteAtivo || sessaoAtiva) ? 'hidden lg:flex' : 'flex'}`}>
                        {clienteAtivo ? (
                            <>
                                <div className="h-14 flex items-center px-4 border-b border-gray-100 bg-gray-50 shrink-0">
                                    <button className="lg:hidden mr-3 text-gray-500 hover:text-gray-900" onClick={() => setClienteAtivo(null)}>
                                        <ChevronLeft size={20} />
                                    </button>
                                    <CalendarDays size={16} className="text-gray-400 mr-2" />
                                    <h3 className="font-medium text-gray-700 text-sm">Histórico de Atendimentos</h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {loadingSessoes ? (
                                        <div className="p-8 text-center text-gray-400 text-sm">Buscando histórico...</div>
                                    ) : sessoes.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400 text-sm">Nenhum atendimento para este cliente.</div>
                                    ) : sessoes.map((sessao) => (
                                        <div
                                            key={sessao.id}
                                            onClick={() => selecionarSessao(sessao)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all ${sessaoAtiva?.id === sessao.id ? 'bg-white border-[#FF6B4A] shadow-sm' : 'bg-white border-transparent hover:border-gray-200 shadow-sm'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-semibold text-gray-500">{formatDate(sessao.created_at)}</span>
                                                <span className="text-xs text-gray-400">{formatTime(sessao.created_at)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {sessao.reserva_feita && (
                                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-green-100 text-green-700">Reserva</span>
                                                    )}
                                                    {!sessao.isOpen ? (
                                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">Encerrado</span>
                                                    ) : (
                                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">Aberto</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                                <Users size={32} className="mb-3 opacity-50" />
                                <p className="text-sm">Selecione um cliente na lista para ver o histórico de atendimentos.</p>
                            </div>
                        )}
                    </div>

                    {/* COLUNA 3: CHAT (MENSAGENS) */}
                    <div className={`flex-1 flex-col bg-[#F8F9FA] ${!sessaoAtiva ? 'hidden lg:flex' : 'flex'}`}>
                        {sessaoAtiva ? (
                            <>
                                <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
                                    <div className="flex items-center gap-3">
                                        <button className="lg:hidden text-gray-500 hover:text-gray-900" onClick={() => setSessaoAtiva(null)}>
                                            <ChevronLeft size={20} />
                                        </button>
                                        <div>
                                            <h3 className="font-medium text-gray-900 text-sm flex items-center gap-1">
                                                <Hash size={14} className="text-gray-400" />
                                                {sessaoAtiva.id.substring(0, 8)}...
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                                    {loadingMsg ? (
                                        <div className="text-center text-gray-400 text-sm mt-10">Lendo mensagens da sessão...</div>
                                    ) : mensagens.length === 0 ? (
                                        <div className="bg-yellow-50 text-yellow-800 text-xs text-center py-2 px-4 rounded-lg border border-yellow-100 w-max mx-auto mb-6 flex items-center gap-2">
                                            <AlertCircle size={14} /> Nenhuma mensagem gravada nesta sessão.
                                        </div>
                                    ) : (
                                        mensagens.map((msg) => {
                                            const isHuman = msg.message.type === 'human';
                                            return (
                                                <div key={msg.id} className={`flex ${isHuman ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm relative ${isHuman
                                                            ? 'bg-[#FF6B4A] text-white rounded-tr-none'
                                                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                                        }`}>
                                                        <p className="text-[13px] leading-relaxed">{msg.message.content}</p>
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
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                    <MessageSquare size={24} className="text-gray-300" />
                                </div>
                                <p className="font-medium text-gray-600 text-sm">Nenhum atendimento selecionado</p>
                                <p className="text-xs mt-1">Selecione uma sessão na coluna do meio para ler as mensagens.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}