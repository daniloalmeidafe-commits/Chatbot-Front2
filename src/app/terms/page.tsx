'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { FileText, ArrowLeft } from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'
import { useBranding } from '@/hooks/useBranding'
import { DEFAULT_BRAND_NAME, resolveBrandName } from '@/lib/branding'

export default function TermsOfUsePage() {
    const router = useRouter()
    const brandingQuery = useBranding()
    const brandName = resolveBrandName(brandingQuery.data?.brandName, DEFAULT_BRAND_NAME)

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#0e1629] to-[#1f2a44] flex items-center justify-center px-6 py-20">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-5xl backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl shadow-2xl p-10 text-white"
            >
                {/* Cabeçalho / Logo */}
                <div
                    className="w-full flex flex-col items-center justify-center mb-12 cursor-pointer select-none"
                    onClick={() => router.push('/')}
                >
                    <div className="px-3 py-2 hover:bg-white/10 transition rounded-xl">
                        <BrandMark
                            titleClassName="text-2xl"
                            size={56}
                            overrideLogoUrl={brandingQuery.data?.logoUrl ?? null}
                            overrideTitle={brandName}
                        />
                    </div>
                </div>

                {/* Título */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-md">
                        <FileText className="text-white" size={24} />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Termos de Uso
                    </h2>
                </div>

                {/* Conteúdo */}
                <div className="space-y-6 text-gray-300 text-base leading-relaxed">
                    <p>
                        AO ACESSAR OU UTILIZAR O <strong>{brandName}</strong>, VOCÊ DECLARA TER PLENA
                        AUTORIDADE PARA AGIR E SE VINCULAR, BEM COMO QUALQUER TERCEIRO, EMPRESA OU
                        ENTIDADE LEGAL, E QUE O USO E/OU USO CONTÍNUO OU INTERAÇÃO COM O SISTEMA
                        CONSTITUI QUE VOCÊ LEU E CONCORDOU COM ESTES TERMOS DE USO, ASSIM COMO
                        QUALQUER OUTRO ACORDO QUE POSSAMOS PUBLICAR.
                    </p>

                    <p>
                        AO VISUALIZAR, VISITAR, USAR OU INTERAGIR COM O <strong>{brandName}</strong> OU
                        COM QUALQUER BANNER, POP-UP OU ANÚNCIO QUE NELE APAREÇA, VOCÊ CONCORDA COM
                        TODAS AS DISPOSIÇÕES DESTA POLÍTICA DE TERMOS DE USO E DA POLÍTICA DE
                        PRIVACIDADE DO <strong>{brandName}</strong>.
                    </p>

                    <p>
                        O <strong>{brandName}</strong> NEGA ESPECIFICAMENTE O ACESSO A QUALQUER
                        INDIVÍDUO ABRANGIDO PELA LEI DE PROTEÇÃO À PRIVACIDADE ONLINE DE CRIANÇAS
                        (COPPA) DE 1998.
                    </p>

                    <p>
                        O <strong>{brandName}</strong> RESERVA-SE O DIREITO DE NEGAR ACESSO A QUALQUER
                        PESSOA OU VISITANTE POR QUALQUER MOTIVO LEGAL. DE ACORDO COM OS TERMOS DA
                        POLÍTICA DE PRIVACIDADE, O <strong>{brandName}</strong> TEM PERMISSÃO PARA
                        COLETAR E ARMAZENAR DADOS E INFORMAÇÕES PARA EXCLUSÃO E OUTROS PROPÓSITOS.
                    </p>

                    <p>
                        ESTE ACORDO DE TERMOS DE USO PODE SER MODIFICADO PERIODICAMENTE. OS
                        VISITANTES DEVEM PERMANECER ATENTOS A TAIS MUDANÇAS REVISANDO ESTA PÁGINA
                        CADA VEZ QUE UTILIZAREM O <strong>{brandName}</strong>.
                    </p>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-2">1. Partes Contratantes</h3>
                        <p>
                            Visitantes, usuários, assinantes, membros, afiliados ou clientes,
                            coletivamente denominados “Visitantes”, são partes deste acordo. O
                            sistema e seus proprietários e/ou operadores são partes deste acordo,
                            aqui referidos como “{brandName}”.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-2">2. Uso das Informações</h3>
                        <p>
                            Salvo acordo expresso por escrito, visitantes e usuários não têm direito
                            de usar informações do <strong>{brandName}</strong> em ambientes comerciais
                            ou públicos; não podem transmitir, copiar, salvar, vender ou publicar
                            qualquer parte do conteúdo. Qualquer uso não autorizado é ilegal e pode
                            resultar em sanções civis ou criminais.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-2">3. Propriedade do Conteúdo</h3>
                        <p>
                            O conteúdo e os materiais disponíveis no <strong>{brandName}</strong> são de
                            propriedade ou licenciados pelo proprietário da plataforma. Os
                            visitantes não possuem direitos sobre o conteúdo, sendo proibido seu uso
                            sem autorização por escrito.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-2">4. Hiperlinks e Referências</h3>
                        <p>
                            É proibido criar links, referências, “frames” ou menções ao{' '}
                            <strong>{brandName}</strong> sem autorização expressa. Qualquer violação
                            poderá resultar em indenização de até US$ 100.000 ou no valor total dos
                            danos, prevalecendo o maior.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-2">5. Isenção de Responsabilidade</h3>
                        <p>
                            O <strong>{brandName}</strong> se exime de qualquer responsabilidade quanto à
                            precisão ou integridade do conteúdo publicado. O uso das informações é
                            inteiramente por conta e risco do visitante. Também não garantimos que
                            downloads ou interações estejam livres de vírus ou códigos maliciosos.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-2">6. Limitação de Responsabilidade</h3>
                        <p>
                            Ao utilizar o <strong>{brandName}</strong>, o visitante renuncia a qualquer
                            reivindicação por danos resultantes do uso ou da incapacidade de uso do
                            sistema. Em nenhum caso nossa responsabilidade excederá o valor pago
                            pelo usuário, se houver, para utilização do serviço.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-2">7. Indenização</h3>
                        <p>
                            O visitante concorda em indenizar o <strong>{brandName}</strong> por
                            quaisquer danos, custos ou despesas decorrentes do uso indevido da
                            plataforma ou da violação destes Termos de Uso.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-2">8. Envios</h3>
                        <p>
                            Qualquer comunicação enviada ao <strong>{brandName}</strong> será considerada
                            um envio e poderá ser usada livremente para fins comerciais, sem
                            compensação adicional. O visitante concorda em enviar apenas informações
                            das quais deseja conceder direitos de uso permanente ao sistema.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-2">9. Disputas e Arbitragem</h3>
                        <p>
                            Qualquer disputa decorrente do uso do <strong>{brandName}</strong> será
                            resolvida por arbitragem vinculativa sob as regras da American
                            Arbitration Association. A decisão do árbitro será final e obrigatória, e
                            a parte vencedora poderá ser reembolsada pelos custos e honorários
                            advocatícios.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-2">10. Jurisdição e Lei Aplicável</h3>
                        <p>
                            Em caso de processo judicial, a jurisdição competente será a do
                            proprietário do <strong>{brandName}</strong>. A lei aplicável será sempre a do
                            estado ou país onde o proprietário estiver estabelecido.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-2">11. Alterações</h3>
                        <p>
                            O <strong>{brandName}</strong> poderá revisar e atualizar estes Termos de Uso
                            periodicamente. É responsabilidade do usuário verificar regularmente esta
                            página para manter-se informado sobre quaisquer modificações.
                        </p>
                    </section>
                </div>

                {/* Rodapé */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
                    <p className="text-xs text-gray-400 text-center sm:text-left">
                        {brandName} © {new Date().getFullYear()} • Todos os direitos reservados
                    </p>

                    <button
                        onClick={() => router.push('/')}
                        className="cursor-pointer flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Voltar para o Início
                    </button>
                </div>
            </motion.div>
        </main>
    )
}
