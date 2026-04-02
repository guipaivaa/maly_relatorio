'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import {
  LayoutDashboard, Folder, Activity, CheckSquare,
  Users, MessageSquare, Briefcase, Calendar,
  Settings, Search, Bell, Menu, LogOut, ChevronRight,
  TrendingUp, Sparkles
} from 'lucide-react'

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/', active: true },
    { icon: Users, label: 'Clientes', href: '/clientes', active: false },
    { icon: MessageSquare, label: 'Mensagens', href: '#', active: false },
    { icon: Settings, label: 'Configurações', href: '#', active: false },
  ]

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">

      {/* SIDEBAR MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 bg-white border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64`}
      >
        {/* LOGO AREA */}
        <div className={`h-20 flex items-center border-b border-gray-50 transition-all ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded bg-[#FF6B4A] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-semibold text-xl text-gray-900 whitespace-nowrap">Hotel Maly</span>
            </div>
          )}
          {/* Botão de colapsar (apenas Desktop) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* NAV LINKS */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          {navItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={index}
                href={item.href} // Agora ele usa o caminho ('/', '/clientes', etc)
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-xl transition-colors ${isCollapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'
                  } ${item.active
                    ? 'bg-gray-50 text-gray-900 font-medium'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon size={20} className={item.active ? 'text-[#FF6B4A]' : ''} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOPBAR */}
        <header className="h-20 bg-white flex items-center justify-between px-4 md:px-8 border-b border-gray-50">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-gray-500"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button className="text-gray-400 hover:text-gray-600 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">admin@hotelmaly.com</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Admin+Maly&background=1C1C1C&color=fff" alt="User" />
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 ml-2" title="Sair">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Visão Geral da IA</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 font-medium">
                <Calendar size={16} />
                <span>Últimos 30 dias</span>
              </div>
              <button className="flex items-center gap-2 bg-[#1C1C1C] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#FF6B4A] transition-colors">
                <Sparkles size={16} />
                <span>Exportar Relatório</span>
              </button>
            </div>
          </div>

          {/* GRID PRINCIPAL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* CARD WIDE: TOTAL DE ATENDIMENTOS */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">Total de Atendimentos</h2>
                <div className="flex items-end gap-4">
                  <span className="text-4xl font-semibold text-gray-900">1,248</span>
                  <span className="flex items-center text-sm font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-md mb-1">
                    <TrendingUp size={14} className="mr-1" />
                    +15.2%
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">Mês anterior: 1,083 atendimentos</p>
              </div>

              <div className="mt-8">
                {/* Barra de Progresso Colorida Simulando a imagem */}
                <div className="flex h-3 w-full rounded-full overflow-hidden gap-1">
                  <div className="bg-[#A78BFA] w-[40%]"></div>
                  <div className="bg-[#FF947A] w-[35%]"></div>
                  <div className="bg-[#FCA5A5] w-[25%]"></div>
                </div>
                <div className="flex justify-between items-center mt-3 text-sm">
                  <span className="text-gray-500">Taxa de Retenção da IA</span>
                  <span className="font-medium text-gray-900">82%</span>
                </div>
              </div>
            </div>

            {/* CARD: RESERVAS CONFIRMADAS */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <h2 className="text-sm font-medium text-gray-500 mb-4">Conversão (Reservas)</h2>
              <div className="flex items-center justify-between mb-8">
                <span className="text-3xl font-semibold text-gray-900">315</span>
                <span className="text-sm font-medium text-green-500">+8.5% ↗</span>
              </div>

              {/* Mini gráfico de barras vertical simulado */}
              <div className="flex items-end justify-between h-32 gap-2 mt-4">
                {[40, 70, 45, 90, 60, 100, 80].map((h, i) => (
                  <div key={i} className="w-full flex justify-center group relative">
                    <div
                      className="w-full max-w-[12px] rounded-t-sm transition-all duration-300 hover:opacity-80"
                      style={{ height: `${h}%`, backgroundColor: i % 2 === 0 ? '#A78BFA' : (i % 3 === 0 ? '#3B82F6' : '#FF947A') }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
              </div>
            </div>

            {/* CARD WIDE: GRÁFICO DE LINHA (Volume Diário) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-medium text-gray-900">Volume de Mensagens</h2>
                <div className="flex gap-2">
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-md">Diário</span>
                  <span className="text-xs font-medium text-gray-400 px-3 py-1 hover:bg-gray-50 rounded-md cursor-pointer">Semanal</span>
                </div>
              </div>

              {/* Simulação visual do gráfico de linha com SVG */}
              <div className="relative h-48 w-full mt-4">
                <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full stroke-[#FF6B4A] fill-[#FF6B4A]/10">
                  <path d="M0,25 L10,24 L20,20 L30,22 L40,15 L50,18 L60,8 L70,8 L80,5 L90,12 L100,2" strokeWidth="0.5" fill="none" />
                  <path d="M0,25 L10,24 L20,20 L30,22 L40,15 L50,18 L60,8 L70,8 L80,5 L90,12 L100,2 L100,30 L0,30 Z" stroke="none" />
                  {/* Ponto de destaque */}
                  <circle cx="60" cy="8" r="1.5" fill="white" stroke="#FF6B4A" strokeWidth="0.5" />
                </svg>
                <div className="absolute top-[10%] left-[55%] bg-white border border-gray-100 shadow-lg rounded-lg p-2 text-center transform -translate-x-1/2">
                  <p className="text-xs text-gray-500 font-medium">Pico de Acessos</p>
                  <p className="text-sm text-[#FF6B4A] font-bold">142 leads</p>
                </div>

                <div className="absolute bottom-0 w-full border-t border-gray-100/50 pt-2 flex justify-between text-xs text-gray-400">
                  <span>10/Out</span><span>15/Out</span><span>20/Out</span><span>25/Out</span><span>30/Out</span>
                </div>
              </div>
            </div>

            {/* CARD: MOTIVOS DE ENCERRAMENTO */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <h2 className="text-sm font-medium text-gray-900 mb-6">Motivos de Encerramento</h2>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center text-gray-600"><div className="w-2 h-2 rounded-full bg-[#A78BFA] mr-2"></div>Reserva Efetuada</span>
                    <span className="font-medium">55%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-[#A78BFA] h-1.5 rounded-full" style={{ width: '55%' }}></div></div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center text-gray-600"><div className="w-2 h-2 rounded-full bg-[#3B82F6] mr-2"></div>Transbordo Humano</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-[#3B82F6] h-1.5 rounded-full" style={{ width: '30%' }}></div></div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center text-gray-600"><div className="w-2 h-2 rounded-full bg-[#FF947A] mr-2"></div>Apenas Dúvida / Abandono</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-[#FF947A] h-1.5 rounded-full" style={{ width: '15%' }}></div></div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}