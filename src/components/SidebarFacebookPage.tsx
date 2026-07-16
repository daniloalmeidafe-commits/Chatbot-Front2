import {FacebookPageDetails, useUpdateFacebookPageSettings, useDeleteFacebookPage, useImportLeads} from '@/hooks/useFacebookPages'
import {useEffect, useState} from 'react'
import {X, Download, Trash2, Ban, Check, Loader2, Wrench} from 'lucide-react'
import {format} from 'date-fns'
import {ptBR} from 'date-fns/locale'
import {ToggleSwitch} from '@/components/ToggleSwitch'
import {useRouter, useParams} from 'next/navigation'
import { useSweetAlert } from '@/utils/useSweetAlert'
import { toast } from 'react-toastify'
import Image from "next/image";

type Props = {
    page: FacebookPageDetails
    onClose: () => void
}

export default function SidebarFacebookPage({page, onClose}: Props) {
    const {mutate: updatePageSettings} = useUpdateFacebookPageSettings();

    const [receiveWelcome, setReceiveWelcome] = useState(page.receiveWelcomeMessage)
    const [keywords, setKeywords] = useState(page.stopKeywords || '')

    type ExtraPageFields = { stopKeyWordsComments?: string; commentAutoReply?: string }
    const pageExtra = page as FacebookPageDetails & ExtraPageFields

    const [keywordsComments, setKeywordsComments] = useState(pageExtra.stopKeyWordsComments || '')
    const [commentAutoReply, setCommentAutoReply] = useState(pageExtra.commentAutoReply || '')

    const [currentStatus, setCurrentStatus] = useState(page.status)

    const {
        mutate: deleteFacebookPage,
        isPending: isDeleting
    } = useDeleteFacebookPage()

    const importLeads = useImportLeads()
    const { confirmDelete } = useSweetAlert()
    const router = useRouter()

    const {id: projectId, profileId} = useParams<{
        id: string
        profileId: string
    }>()

    useEffect(() => {
        const p = page as FacebookPageDetails & ExtraPageFields
        setReceiveWelcome(page.receiveWelcomeMessage)
        setCurrentStatus(page.status)
        setKeywords(page.stopKeywords || '')
        setKeywordsComments(p.stopKeyWordsComments || '')
        setCommentAutoReply(p.commentAutoReply || '')
    }, [page.id, page.receiveWelcomeMessage, page.status, page.stopKeywords, page.stopKeyWordsComments, page.commentAutoReply, page])

    return (
        <div className="fixed top-0 right-0 h-full w-full sm:max-w-sm bg-gray-900 shadow-lg z-50 overflow-y-auto border-l border-gray-700">
            <div className="flex justify-end p-4">
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6"/>
                </button>
            </div>

            <div className="drop-shadow-md mt-2 px-4">
                <div className="bg-gray-800 rounded-t-xl px-5 pb-3 text-center">
                    <div className="py-4 text-center">
                        <Image
                            src={`https://graph.facebook.com/${page.pageId}/picture?type=large`}
                            alt="Avatar"
                            width={120}
                            height={120}
                            className="rounded-full mx-auto"
                        />
                    </div>
                    <div className="text-sm font-medium text-white mb-2">{page.name}</div>
                    <div
                        className={`text-xs inline-flex font-medium rounded-full px-2.5 py-1 ${
                            page.status === 'enabled'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                        }`}
                    >
                        {page.status === 'enabled' ? 'Habilitado' : 'Desabilitado'}
                    </div>
                </div>

                <div className="flex justify-between items-center -my-0.5" aria-hidden="true">
                    <svg className="fill-gray-800" width="20" height="20" viewBox="0 0 20 20">
                        <path d="M0 20c5.523 0 10-4.477 10-10S5.523 0 0 0h20v20H0Z"/>
                    </svg>
                    <div className="grow w-full h-5 bg-gray-800 flex flex-col justify-center">
                        <div className="h-px w-full border-t border-dashed border-gray-700"></div>
                    </div>
                    <svg className="fill-gray-800 rotate-180" width="20" height="20" viewBox="0 0 20 20">
                        <path d="M0 20c5.523 0 10-4.477 10-10S5.523 0 0 0h20v20H0Z"/>
                    </svg>
                </div>

                <div className="bg-gray-800 rounded-b-xl p-5 pt-2.5 text-sm space-y-3 text-white">
                    <div className="flex justify-between">
                        <span className="italic text-gray-400">Total de leads:</span>
                        <span className="font-medium">{page.currentLeadCount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="italic text-gray-400">Leads das últimas 24 horas:</span>
                        <span className="font-medium">{page.leadCountLast24h}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="italic text-gray-400">Criação:</span>
                        <span className="font-medium">
              {format(new Date(page.createdAt), 'dd/MM/yyyy, HH:mm', {locale: ptBR})}
            </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="italic text-gray-400">Última alteração:</span>
                        <span className="font-medium">
              {format(new Date(page.updatedAt), 'dd/MM/yyyy, HH:mm', {locale: ptBR})}
            </span>
                    </div>
                </div>

                <div className="mt-6 px-2 space-y-6 text-sm text-white">
                    <div>
                        <ToggleSwitch
                            label="Resposta automática"
                            checked={receiveWelcome === 'enabled'}
                            onChange={(checked) => {
                                setReceiveWelcome(checked ? 'enabled' : 'disabled')
                                updatePageSettings({
                                    pageId: page.id,
                                    payload: {receiveWelcomeMessage: checked ? 'enabled' : 'disabled'},
                                })
                            }}
                        />
                    </div>

                    {/* Stop Keywords (inbox) */}
                    <div>
                        <div className="mb-2">
                            <p className="font-semibold">Stop Keywords</p>
                            <label className="text-[12px] text-gray-400">* Para funcionar coloque as palavras separadas por vírgula.</label>
                        </div>
                        <textarea
                            placeholder="Exemplo: Stop, stop, Parar, pare"
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                            rows={3}
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                        />
                        <button
                            onClick={() => {
                                updatePageSettings({
                                    pageId: page.id,
                                    payload: {stopKeywords: keywords},
                                })
                            }}
                            className="mt-2 w-full border border-gray-700 rounded px-3 py-2 hover:bg-gray-800"
                        >
                            Salvar Palavras-chave
                        </button>
                    </div>

                    {/* Frases para moderar comentários */}
                    <div>
                        <div className="mb-2">
                            <p className="font-semibold">Frases para moderar comentários</p>
                            <label className="text-[12px] text-gray-400">* Separe por vírgula. Comentários que contiverem essas frases serão removidos.</label>
                        </div>
                        <textarea
                            placeholder="Exemplo: perfil fake, isso é falso, isso não existe"
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                            rows={3}
                            value={keywordsComments}
                            onChange={(e) => setKeywordsComments(e.target.value)}
                        />
                        <button
                            onClick={() => {
                                updatePageSettings({
                                    pageId: page.id,
                                    payload: { stopKeyWordsComments: keywordsComments },
                                })
                            }}
                            className="mt-2 w-full border border-gray-700 rounded px-3 py-2 hover:bg-gray-800"
                        >
                            Salvar Frases de Moderação
                        </button>
                    </div>

                    {/* Resposta automática no inbox após comentário */}
                    <div>
                        <div className="mb-2">
                            <p className="font-semibold">Resposta automática no inbox (comentários)</p>
                            <label className="text-[12px] text-gray-400">
                                Mensagem enviada no privado quando o comentário não for removido.
                            </label>
                        </div>
                        <textarea
                            placeholder="Exemplo: Olá! Obrigado pelo seu comentário. Podemos continuar por mensagem?"
                            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                            rows={3}
                            value={commentAutoReply}
                            onChange={(e) => setCommentAutoReply(e.target.value)}
                        />
                        <button
                            onClick={() => {
                                updatePageSettings({
                                    pageId: page.id,
                                    payload: { commentAutoReply },
                                })
                            }}
                            className="mt-2 w-full border border-gray-700 rounded px-3 py-2 hover:bg-gray-800"
                        >
                            Salvar Resposta de Inbox
                        </button>
                    </div>

                    <div>
                        <p className="font-semibold mb-2">Ações</p>
                        <button
                            className="w-full flex items-center justify-center mt-2 gap-2 border border-gray-700 rounded px-3 py-2 text-sm hover:bg-gray-800"
                            onClick={() =>
                                router.push(
                                    `/projects/${projectId}/facebook-profiles/${profileId}/pages/${page.id}/messages?pageName=${encodeURIComponent(page.name)}`
                                )
                            }
                        >
                            <Wrench className="w-4 h-4" />
                            Configurar mensagens
                        </button>

                        <button
                            onClick={async () => {
                                try {
                                    const response = await importLeads.mutateAsync(page.id)
                                    const updatedPage = response.data
                                    page.currentLeadCount = updatedPage.currentLeadCount
                                    page.leadCountLast24h = updatedPage.leadCountLast24h
                                    toast.success(`Leads importados: ${updatedPage.currentLeadCount}`)
                                } catch {
                                    toast.error('Erro ao importar os leads')
                                }
                            }}
                            disabled={importLeads.isPending}
                            className={`w-full flex items-center justify-center mt-2 gap-2 border border-gray-700 rounded px-3 py-2 text-sm ${
                                importLeads.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                            }`}
                        >
                            {importLeads.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Importando...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Importar leads
                                </>
                            )}
                        </button>

                        <button
                            className={`w-full flex items-center justify-center gap-2 mt-2 rounded px-3 py-2 text-sm 
                ${currentStatus === 'enabled'
                                ? 'text-red-500 bg-gray-800 hover:bg-red-900'
                                : 'text-green-500 bg-gray-800 hover:bg-green-900'}
              `}
                            onClick={() => {
                                const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled'
                                updatePageSettings({
                                    pageId: page.id,
                                    payload: {status: newStatus},
                                })
                                setCurrentStatus(newStatus)
                            }}
                        >
                            {currentStatus === 'enabled' ? (
                                <>
                                    <Ban className="w-4 h-4"/>
                                    Desabilitar página
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4"/>
                                    Habilitar página
                                </>
                            )}
                        </button>

                        <button
                            disabled={isDeleting}
                            onClick={async () => {
                                const confirm = await confirmDelete(page.name)
                                if (confirm) {
                                    deleteFacebookPage(
                                        { profileId: Number(profileId), pageId: page.id },
                                        { onSuccess: () => { onClose() } }
                                    )
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 mt-2 rounded px-3 py-2 text-sm text-red-500 bg-gray-800 hover:bg-red-900 disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            {isDeleting ? 'Excluindo...' : 'Excluir Página'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
