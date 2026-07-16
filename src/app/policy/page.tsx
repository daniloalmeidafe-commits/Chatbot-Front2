'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Shield, ArrowLeft } from 'lucide-react'
import { useBranding } from '@/hooks/useBranding'
import { DEFAULT_BRAND_NAME, resolveBrandName } from '@/lib/branding'

export default function PrivacyPolicyPage() {
    const router = useRouter()
    const brandingQuery = useBranding()
    const brandName = resolveBrandName(brandingQuery.data?.brandName, DEFAULT_BRAND_NAME)

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#0e1629] to-[#1f2a44] flex items-center justify-center px-6 py-16">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-3xl backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl shadow-2xl p-8 text-white"
            >
                {/* Cabeçalho */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-md">
                        <Shield className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Política de Privacidade
                    </h1>
                </div>

                <p className="text-gray-300 mb-8 text-sm sm:text-base leading-relaxed">
                    Esta Política de Privacidade descreve como o <strong>{brandName}</strong> coleta,
                    utiliza e protege as informações pessoais de seus usuários. Ao utilizar nossos
                    serviços, você concorda com as práticas descritas abaixo.
                </p>

                <div className="space-y-6 text-gray-300 text-sm sm:text-base leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">1. Coleta de Informações</h2>
                        <p>
                            O <strong>{brandName}</strong> pode coletar informações pessoais como nome, e-mail,
                            número de telefone e dados de uso. Essas informações podem ser obtidas diretamente
                            do usuário ou por meio de parceiros que auxiliam na prestação dos nossos serviços.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">2. Uso das Informações</h2>
                        <p>
                            As informações coletadas são utilizadas para personalizar a experiência do usuário,
                            aprimorar nossos serviços, enviar comunicações relevantes e responder a solicitações.
                            O <strong>{brandName}</strong> também pode entrar em contato com você para notificações,
                            atualizações ou oportunidades relacionadas à plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">3. Compartilhamento de Dados</h2>
                        <p>
                            O <strong>{brandName}</strong> não vende nem compartilha indevidamente informações pessoais.
                            Os dados podem ser compartilhados apenas com parceiros de confiança quando necessário
                            para a execução dos serviços ou para cumprimento de obrigações legais ou judiciais.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">4. Armazenamento e Segurança</h2>
                        <p>
                            Os dados pessoais são armazenados em ambientes seguros e acessíveis apenas a
                            pessoal autorizado. Utilizamos medidas de proteção como criptografia e autenticação,
                            embora lembremos que nenhum sistema é 100% imune a falhas ou ataques.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">5. Cookies</h2>
                        <p>
                            Utilizamos cookies para armazenar preferências, melhorar o desempenho do site e
                            proteger as sessões dos usuários. Você pode configurar seu navegador para recusar cookies,
                            mas isso pode afetar sua experiência de navegação.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">6. Seus Direitos</h2>
                        <p>
                            Os usuários podem solicitar correção, atualização ou exclusão de suas informações
                            pessoais a qualquer momento, enviando um e-mail para{' '}
                            <a
                                href="mailto:appdev00mt@gmail.com"
                                className="text-blue-400 hover:underline"
                            >
                                appdev00mt@gmail.com
                            </a>
                            . Caso deseje desativar sua conta, algumas informações poderão ser mantidas
                            apenas para fins legais ou de backup.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">7. Alterações nesta Política</h2>
                        <p>
                            O <strong>{brandName}</strong> pode atualizar periodicamente esta Política de Privacidade.
                            Quaisquer alterações significativas serão comunicadas dentro da plataforma. Recomendamos
                            revisar esta página regularmente.
                        </p>
                    </section>
                </div>

                {/* Rodapé */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-400 text-center sm:text-left">
                        {brandName} © {new Date().getFullYear()} • Todos os direitos reservados
                    </p>

                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Voltar para o Início
                    </button>
                </div>
            </motion.div>
        </main>
    )
}
