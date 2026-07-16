import Image from 'next/image'
import { CheckCircle, XCircle, Users, BarChart2, MessageSquareText } from 'lucide-react'
import { useUpdateFacebookPageSettings } from '@/hooks/useFacebookPages'
import { toast } from 'react-toastify'

type Page = {
    id: number
    pageId: string
    name: string
    pageEmail?: string | null
    status: string
    leadCountLast24h: number
    currentLeadCount: number
    currentUnsubscribedLeadCount: number
}

interface PageCardProps {
    page: Page;
    onClick: () => void;
}

export function PageCard({ page, onClick }: PageCardProps) {
    const updateSettingsMutation = useUpdateFacebookPageSettings();

    const handleStatusToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newStatus = page.status === 'enabled' ? 'disabled' : 'enabled';
        updateSettingsMutation.mutate(
            { pageId: page.id, payload: { status: newStatus } },
            {
                onSuccess: () => toast.success(`Página ${newStatus === 'enabled' ? 'habilitada' : 'desabilitada'}.`),
                onError: () => toast.error('Erro ao alterar o status da página.')
            }
        );
    };

    const qualifiedLeads = page.currentLeadCount - page.currentUnsubscribedLeadCount;

    return (
        <div
            onClick={onClick}
            className="bg-gray-800 rounded-2xl border border-gray-700 flex flex-col hover:border-blue-500 transition-all duration-200 group cursor-pointer shadow-lg"
        >
            <div className="p-5 flex-grow">
                <div className="flex items-center gap-4 mb-4">
                    <Image
                        src={`https://graph.facebook.com/${page.pageId}/picture?type=large`}
                        alt={page.name}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-gray-600"
                    />
                    <div className="flex-1">
                        <h3 className="font-bold text-white truncate">{page.name}</h3>
                        <p className="text-sm text-gray-400 truncate">{page.pageEmail ?? 'Sem e-mail'}</p>
                    </div>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 flex items-center gap-2"><Users className="w-4 h-4"/> Leads Qualificados</span>
                        <span className="font-semibold text-white">{qualifiedLeads}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 flex items-center gap-2"><BarChart2 className="w-4 h-4"/> Leads (Total)</span>
                        <span className="font-semibold text-white">{page.currentLeadCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 flex items-center gap-2"><MessageSquareText className="w-4 h-4"/> Leads (24h)</span>
                        <span className="font-semibold text-white">{page.leadCountLast24h}</span>
                    </div>
                </div>
            </div>

            <div
                onClick={handleStatusToggle}
                className={`flex items-center justify-center gap-2 p-3 border-t border-gray-700 rounded-b-2xl font-semibold text-sm transition-colors ${
                    page.status === 'enabled'
                        ? 'bg-green-800/20 text-green-400 hover:bg-green-800/40'
                        : 'bg-red-800/20 text-red-400 hover:bg-red-800/40'
                }`}
            >
                {page.status === 'enabled' ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                {page.status === 'enabled' ? 'Habilitado' : 'Desabilitado'}
            </div>
        </div>
    );
}