'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import {
  LayoutDashboard, Users, MessageSquare, Settings,
  Search, Bell, Menu, LogOut, Sparkles, MinusSquare,
  MoreHorizontal, Loader2
} from 'lucide-react'

// Interface baseada na sua tabela do Supabase
interface Cliente {
  id: string;
  whatsapp_id: string;
  nome: string | null;
  created_at: string;
}

export default function ClientesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Busca os clientes no Supabase ao montar a tela
  useEffect(() => {
    async function fetchClientes() {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false }) // Traz os mais recentes primeiro

      if (data) {
        setClientes(data)
      } else if (error) {
        console.error("Erro ao buscar clientes:", error)
      }
      setLoadingData(false)
    }

    fetchClientes()
  }, [])

  // Menu enxuto
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/', active: false },
    { icon: Users, label: 'Clientes', href: '/clientes', active: true },
    { icon: MessageSquare, label: 'Mensagens', href: '#', active: false },
    { icon: Settings, label: 'Configurações', href: '#', active: false },
  ]

  // Função para formatar a data que vem do banco
  const formatarData = (dataIso: string) => {
    return new Date(dataIso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-30 bg-white border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64`}>
        <div className={`h-20 flex items-center border-b border-gray-50 transition-all ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded bg-[#FF6B4A] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-semibold text-xl text-gray-900 whitespace-nowrap">Hotel Maly</span>
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Menu size={20} />
          </button>
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

      <div className="flex-1 flex flex-col overflow-hidden">

        <header className="h-20 bg-white flex items-center justify-between px-4 md:px-8 border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-500" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Pesquisar cliente..." className="w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button className="text-gray-400 hover:text-gray-600 relative">
              <Bell size={20} />
            </button>
            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Admin+Maly&background=1C1C1C&color=fff" alt="User" />
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 ml-2">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Visão Geral de Clientes</h1>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-[#1C1C1C] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#FF6B4A] transition-colors">
                <Sparkles size={16} />
                <span>Campanha IA</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/30">
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm w-16">
                      <MinusSquare size={20} className="text-gray-400" />
                    </th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm">Nome / Contato</th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm">WhatsApp ID</th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm">Status</th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm">Origem</th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm">Data de Cadastro</th>
                    <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right">Ação</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {loadingData ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF6B4A]" />
                        Carregando clientes...
                      </td>
                    </tr>
                  ) : clientes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        Nenhum cliente cadastrado no banco de dados.
                      </td>
                    </tr>
                  ) : (
                    clientes.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="w-4 h-4 rounded border border-gray-300 group-hover:border-[#FF6B4A] transition-colors cursor-pointer"></div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">
                            {cliente.nome || 'Cliente sem nome'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm font-mono">
                          {cliente.whatsapp_id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium border border-green-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            Ativo
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          WhatsApp
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium text-sm">
                          {formatarData(cliente.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-gray-400 hover:text-gray-900 transition-colors p-1">
                            <MoreHorizontal size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}