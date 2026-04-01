'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError('Credenciais inválidas. Acesso negado.')
            setLoading(false)
        } else {
            router.push('/')
            router.refresh()
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center relative font-[family-name:var(--font-space-grotesk)]">

            <div className="z-10 w-full max-w-md p-10 bg-[#1a1a1a] border border-[#E8E4DD]/10 rounded-[2rem] shadow-2xl">
                <div className="mb-10 text-center">
                    <p className="text-[#E63B2E] font-[family-name:var(--font-space-mono)] text-xs tracking-[0.2em] mb-3 uppercase">
                        Sys.Auth // Hotel Maly
                    </p>
                    <h1 className="text-4xl font-[family-name:var(--font-dm-serif)] italic text-[#E8E4DD]">
                        Operação IA
                    </h1>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-[#E8E4DD]/60 ml-2" htmlFor="email">Credencial (E-mail)</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#111111] border border-[#E8E4DD]/20 rounded-[1.5rem] px-6 py-4 text-[#E8E4DD] focus:outline-none focus:border-[#E63B2E] transition-colors"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-[#E8E4DD]/60 ml-2" htmlFor="password">Chave de Acesso (Senha)</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#111111] border border-[#E8E4DD]/20 rounded-[1.5rem] px-6 py-4 text-[#E8E4DD] focus:outline-none focus:border-[#E63B2E] transition-colors"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-[#E63B2E] text-sm text-center font-[family-name:var(--font-space-mono)]">
                            [ERRO]: {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 bg-[#E8E4DD] text-[#111111] font-bold rounded-[1.5rem] px-6 py-4 hover:scale-[1.02] transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] flex justify-center items-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'INICIAR SESSÃO'}
                    </button>
                </form>
            </div>
        </main>
    )
}