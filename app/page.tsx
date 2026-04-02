'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import {
  LayoutDashboard, Users, MessageSquare, Settings,
  Search, Bell, Menu, LogOut, Sparkles, TrendingUp, Calendar
} from 'lucide-react'

interface DiaEstatistica {
  dataLabel: string;
  total: number;
  reservas: number;
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Estados para os dados do gráfico
  const [stats, setStats] = useState<DiaEstatistica[]>([])
  const [totais, setTotais] = useState({ atendimentos: 0, reservas: 0 })
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Busca os dados do historico_chat
  useEffect(() => {
    async function fetchEstatisticas() {
      // Pega a data de 7 dias atrás
      const seteDiasAtras = new Date()
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 6) // Hoje + 6 dias anteriores
      seteDiasAtras.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('historico_chat')
        .select('created_at, reserva_feita')
        .gte('created_at', seteDiasAtras.toISOString())

      if (data) {
        // Prepara um mapa para os últimos 7 dias (para não ficar buracos no gráfico se um dia não tiver chat)
        const mapaDias: Record<string, DiaEstatistica> = {}
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dataLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
          mapaDias[dataLabel] = { dataLabel, total: 0, reservas: 0 }
        }

        let totalAtendimentos = 0
        let totalReservas = 0

        // Agrupa os dados
        data.forEach(chat => {
          const dataChat = new Date(chat.created_at)
          const dataLabel = dataChat.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

          if (mapaDias[dataLabel]) {
            mapaDias[dataLabel].total += 1
            totalAtendimentos += 1
            if (chat.reserva_feita) {
              mapaDias[dataLabel].reservas += 1
              totalReservas += 1
            }
          }
        })

        setStats(Object.values(mapaDias))
        setTotais({ atendimentos: totalAtendimentos, reservas: totalReservas })
      } else if (error) {
        console.error("Erro ao buscar histórico:", error)
      }
      setLoading(false)
    }

    fetchEstatisticas()
  }, [])

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/', active: true },
    { icon: Users, label: 'Clientes', href: '/clientes', active: false },
    { icon: MessageSquare, label: 'Mensagens', href: '#', active: false },
    { icon: Settings, label: 'Configurações', href: '#', active: false },
  ]

  // Acha o maior valor para calcular a altura máxima das barras (evitando divisão por zero)
  const maxTotal = Math.max(...stats.map(s => s.total), 1)
  // Define uma altura mínima base (se tiver poucos chats, a barra não fica minúscula na tela)
  const chartScale = maxTotal < 10 ? 10 : maxTotal

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
              <input type="text" placeholder="Pesquisar..." className="w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
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
            <h1 className="text-2xl font-semibold text-gray-900">Visão Geral da IA</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 font-medium">
                <Calendar size={16} />
                <span>Últimos 7 dias</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* GRÁFICO INSPIRADO NO SEU PRINT */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-1">Volume de Atendimentos</h2>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-semibold text-gray-900">{totais.atendimentos}</span>
                    <span className="text-sm font-medium text-green-500 flex items-center pb-1">
                      <TrendingUp size={14} className="mr-1" />
                      Ativos
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gray-100"></div>
                    <span className="text-gray-500">Apenas Chat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#FF6B4A]"></div>
                    <span className="text-gray-500">Reservas</span>
                  </div>
                </div>
              </div>

              {/* O Gráfico CSS */}
              <div className="relative h-56 mt-6 border-b border-gray-100 border-dashed">
                {/* Linhas de grade horizontais */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-t border-gray-100 border-dashed w-full h-0"></div>
                  <div className="border-t border-gray-100 border-dashed w-full h-0"></div>
                  <div className="border-t border-gray-100 border-dashed w-full h-0"></div>
                </div>

                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                    Carregando dados...
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-end justify-between px-2 sm:px-6">
                    {stats.map((dia, idx) => {
                      // Calcula a altura da barra total em relação ao valor máximo
                      const heightPct = (dia.total / chartScale) * 100;
                      // Calcula quanto da barra total deve ser pintada de laranja (reservas)
                      const reservaPct = dia.total > 0 ? (dia.reservas / dia.total) * 100 : 0;

                      return (
                        <div key={idx} className="flex flex-col items-center justify-end h-full w-12 sm:w-16 group">
                          {/* Tooltip Hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none">
                            {dia.reservas} res. / {dia.total} chats
                          </div>

                          {/* Barra Inteira (Cinza) */}
                          <div
                            className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden transition-all duration-500"
                            style={{ height: `${Math.max(heightPct, 2)}%` }} // min 2% para sempre aparecer uma pontinha
                          >
                            {/* Preenchimento (Laranja) */}
                            <div
                              className="absolute bottom-0 w-full bg-[#FF6B4A] transition-all duration-500"
                              style={{ height: `${reservaPct}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400 mt-3">{dia.dataLabel}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* CARD: TAXA DE CONVERSÃO (Resumo) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-4">Conversão Geral</h2>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-4xl font-semibold text-gray-900">{totais.reservas}</span>
                  <span className="text-sm font-medium text-[#FF6B4A] bg-orange-50 px-2 py-1 rounded">
                    {totais.atendimentos > 0 ? Math.round((totais.reservas / totais.atendimentos) * 100) : 0}%
                  </span>
                </div>
                <p className="text-sm text-gray-500">Chats que resultaram em reservas fechadas nos últimos 7 dias.</p>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Status Operacional</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>
                <p className="text-xs text-gray-500">Agente N8N e Evolution API conectados.</p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}