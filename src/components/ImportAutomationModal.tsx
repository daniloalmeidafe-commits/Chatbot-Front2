import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { useImportAutomation } from '@/hooks/useAutomations'
import { Loader2, UploadCloud } from 'lucide-react'
import { toast } from 'react-toastify'

interface ImportAutomationModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: number;
}

export function ImportAutomationModal({ isOpen, onClose, projectId }: ImportAutomationModalProps) {
    const [jsonString, setJsonString] = useState('');
    const importMutation = useImportAutomation();

    const handleSubmit = () => {
        try {
            const automationData = JSON.parse(jsonString);
            importMutation.mutate({ projectId, automationData }, {
                onSuccess: () => {
                    onClose();
                    setJsonString('');
                }
            });
        } catch (error) {
            toast.error('O texto inserido não é um JSON válido.');
            console.log(error);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-white">
                                    Importar Automação
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-400">
                                        Cole o código JSON de uma automação exportada para criá-la neste projeto.
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <textarea
                                        value={jsonString}
                                        onChange={(e) => setJsonString(e.target.value)}
                                        placeholder='Cole o JSON da automação aqui...'
                                        rows={10}
                                        className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 text-gray-300 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 font-semibold text-white">
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={!jsonString || importMutation.isPending}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-white disabled:bg-blue-800/50"
                                    >
                                        {importMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <UploadCloud className="w-4 h-4" />}
                                        Importar
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}