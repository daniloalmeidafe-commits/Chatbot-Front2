'use client'

import React, { useCallback, useState, useRef, useEffect, useMemo, MouseEvent } from 'react'
import { useParams } from 'next/navigation'
import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    Connection,
    Edge,
    Node,
    OnNodesChange,
    OnEdgesChange,
    applyNodeChanges,
    applyEdgeChanges,
    NodeTypes,
    Handle,
    Position,
    ReactFlowInstance,
    OnSelectionChangeParams,
    NodeProps,
} from 'reactflow'
import 'reactflow/dist/style.css'
import Swal from 'sweetalert2'
import {
    Image as ImageIcon,
    MessageCircle,
    Clock,
    X,
    Save,
    Trash2,
    MapPin,
    Copy,
    Plus,
    Search,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useAutomations, useSaveAutomationSteps } from '@/hooks/useAutomations'
import Image from 'next/image'
import { GalleryPickerModal } from '@/components/GalleryPickerModal'

interface Button { type: 'web_url'; url: string; title: string; }
interface ButtonTemplatePayload { template_type: 'button'; text: string; buttons: Button[]; }
interface GenericElement { title: string; subtitle: string; image_url: string; default_action?: { type: 'web_url'; url: string; webview_height_ratio?: string; }; buttons?: Button[]; }
interface GenericTemplatePayload { template_type: 'generic'; elements: GenericElement[]; image_aspect_ratio: string;  }
export interface AttachmentPayload { attachment: { type: 'template'; payload: ButtonTemplatePayload | GenericTemplatePayload; } }
export type MessagePayload = AttachmentPayload | { text?: string, buttons?: Button[] };
export interface Step { id: number; delayMinutes: number; messagePayload: MessagePayload; }
export interface Automation { id: number; projectId: number; name: string; createdAt: string; updatedAt: string; steps: Step[] }

export interface SaveStep {
    stepOrder: number;
    delayMinutes: number;
    messagePayload: AttachmentPayload;
}

type NodeDataWithValidation = {
    isInvalid?: boolean;
    minutes?: number;
    text?: string;
    buttonTitle?: string;
    imageUrl?: string;
    defaultActionUrl?: string;
    title?: string;
    subtitle?: string;
    buttonUrl?: string;
};

type CustomNodeProps = NodeProps<NodeDataWithValidation> & {
    onShowAddMenu: (node: Node, event: MouseEvent) => void;
};

const AddMenuButton = ({ onClick }: { onClick: (e: MouseEvent) => void }) => (
    <div
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10"
        onClick={onClick}
    >
        <button className="bg-green-500 hover:bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            <Plus className="w-4 h-4" />
        </button>
    </div>
);

const StartNode = ({ onShowAddMenu, selected, id, xPos, yPos, data }: CustomNodeProps) => (
    <div className="relative w-32 p-2 bg-gray-700 text-white rounded-lg border border-gray-600 flex items-center">
        <Handle type="source" position={Position.Right} id="start-source" />
        <MapPin className="w-4 h-4 mr-1 text-yellow-400" /> Start...
        {selected && <AddMenuButton onClick={(e) => { e.stopPropagation(); onShowAddMenu({id, position: {x: xPos, y: yPos}, data} as Node, e) }} />}
    </div>
)

const DelayNode = ({ id, data, selected, xPos, yPos, onShowAddMenu }: CustomNodeProps) => (
    <div className={`relative w-40 bg-gray-700 rounded-lg border-2 ${data.isInvalid ? 'border-red-500' : 'border-gray-600'}`}>
        <Handle type="target" position={Position.Left} id="delay-target" />
        <Handle type="source" position={Position.Right} id="delay-source" />
        <div className="px-3 py-2 flex items-center text-sm text-gray-200"><Clock className="w-4 h-4 mr-1 text-yellow-400" /> Atraso</div>
        <div className="px-3 py-2 text-center text-white text-sm">{data.minutes ?? 0}m</div>
        <div className="px-3 py-2 text-xs text-gray-400 text-center">Pausa antes do próximo</div>
        {selected && <AddMenuButton onClick={(e) => { e.stopPropagation(); onShowAddMenu({id, position: {x: xPos, y: yPos}, data} as Node, e) }} />}
    </div>
)

const TextButtonNode = ({ id, data, selected, xPos, yPos, onShowAddMenu }: CustomNodeProps) => (
    <div className={`relative w-48 bg-gray-700 rounded-lg border-2 ${data.isInvalid ? 'border-red-500' : 'border-gray-600'}`}>
        <Handle type="target" position={Position.Left} id="text-target" />
        <Handle type="source" position={Position.Right} id="text-source" />
        <div className="px-3 py-2 flex items-center text-sm text-gray-200"><MessageCircle className="w-4 h-4 mr-1 text-green-400" /> Texto + Botão</div>
        <div className="px-3 py-2 h-16 border-t border-gray-600 text-white text-sm overflow-auto">{data.text || 'Prévia'}</div>
        <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-b-lg text-sm">{data.buttonTitle || 'Clique aqui'}</button>
        {selected && <AddMenuButton onClick={(e) => { e.stopPropagation(); onShowAddMenu({id, position: {x: xPos, y: yPos}, data} as Node, e) }} />}
    </div>
)

const ImageLinkNode = ({ id, data, selected, xPos, yPos, onShowAddMenu }: CustomNodeProps) => (
    <div className={`relative w-48 bg-gray-700 rounded-lg border-2 ${data.isInvalid ? 'border-red-500' : 'border-gray-600'}`}>
        <Handle type="target" position={Position.Left} id="image-target" />
        <Handle type="source" position={Position.Right} id="image-source" />
        <div className="px-3 py-2 flex items-center text-sm text-gray-200"><ImageIcon className="w-4 h-4 mr-1 text-indigo-400" /> Imagem + Botão</div>
        <div className="relative h-20 border-t border-gray-600 bg-gray-800 flex items-center justify-center">
            {data.imageUrl ? (
                <Image src={data.imageUrl} alt="preview" layout="fill" objectFit="cover" />
            ) : (
                <ImageIcon className="w-8 h-8 text-gray-500" />
            )}
        </div>
        <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-b-lg text-sm">{data.buttonTitle || 'Clique aqui'}</button>
        {selected && <AddMenuButton onClick={(e) => { e.stopPropagation(); onShowAddMenu({id, position: {x: xPos, y: yPos}, data} as Node, e) }} />}
    </div>
)

const AddNodeMenu = ({ top, left, onAdd, sourceId }: { top: number, left: number, onAdd: (type: string, sourceId: string) => void, sourceId: string }) => (
    <div style={{ top, left }} className="fixed z-50 flex flex-col gap-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg p-1">
        <button onClick={() => onAdd('delay', sourceId)} className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-gray-700 text-left text-sm"><Clock className="w-4 h-4 text-yellow-400" /> Atraso</button>
        <button onClick={() => onAdd('textButton', sourceId)} className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-gray-700 text-left text-sm"><MessageCircle className="w-4 h-4 text-green-400" /> Texto + Botão</button>
        <button onClick={() => onAdd('imageLink', sourceId)} className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-gray-700 text-left text-sm"><ImageIcon className="w-4 h-4 text-indigo-400" /> Imagem + Botão</button>
    </div>
);

export default function FlowBuilderPage() {
    const { id: projectId, automationId } = useParams<{ id: string; automationId: string }>()
    const { data: automations = [] } = useAutomations(Number(projectId))
    const saveMutation = useSaveAutomationSteps(Number(automationId))
    const automationsTyped = automations as Automation[]
    const stepsData = useMemo(() => automationsTyped.find(a => a.id === Number(automationId))?.steps ?? [], [automationsTyped, automationId])
    const [nodes, setNodes] = useState<Node<NodeDataWithValidation>[]>([])
    const [edges, setEdges] = useState<Edge[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [sidebarNodeId, setSidebarNodeId] = useState<string | null>(null);
    const flowRef = useRef<ReactFlowInstance | null>(null)
    const [initialFitViewDone, setInitialFitViewDone] = useState(false);
    const [menu, setMenu] = useState<{ id: string; top: number; left: number; } | null>(null);
    const [addMenu, setAddMenu] = useState<{ sourceId: string, top: number, left: number } | null>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false)

    const onShowAddMenu = useCallback((node: Node, event: MouseEvent) => {
        setAddMenu({
            sourceId: node.id,
            top: event.clientY,
            left: event.clientX + 10,
        });
    }, []);

    const nodeTypes: NodeTypes = useMemo(() => ({
        start: (props) => <StartNode {...props} onShowAddMenu={onShowAddMenu} />,
        delay: (props) => <DelayNode {...props} onShowAddMenu={onShowAddMenu} />,
        textButton: (props) => <TextButtonNode {...props} onShowAddMenu={onShowAddMenu} />,
        imageLink: (props) => <ImageLinkNode {...props} onShowAddMenu={onShowAddMenu} />,
    }), [onShowAddMenu]);

    useEffect(() => {
        if (nodes.length > 0) return;
        const ns: Node<NodeDataWithValidation>[] = [{ id: 'start', type: 'start', position: { x: 50, y: 50 }, data: {}, selectable: true, draggable: false }]
        const es: Edge[] = []
        const isAttachmentPayload = (p: MessagePayload): p is AttachmentPayload => 'attachment' in p;
        stepsData.forEach((st, idx) => {
            const y = 100 + idx * 200
            const dId = `delay-${st.id}`; const mId = `msg-${st.id}`
            let nodeData: NodeDataWithValidation = {};
            let nodeType: string = 'textButton';
            if (isAttachmentPayload(st.messagePayload)) {
                const payload = st.messagePayload.attachment.payload;
                if (payload.template_type === 'generic') {
                    nodeType = 'imageLink'; const element = payload.elements[0] || {};
                    nodeData = { imageUrl: element.image_url, title: element.title, subtitle: element.subtitle, defaultActionUrl: element.default_action?.url, buttonTitle: element.buttons?.[0]?.title, buttonUrl: element.buttons?.[0]?.url, };
                } else if (payload.template_type === 'button') {
                    nodeType = 'textButton';
                    nodeData = { text: payload.text, buttonTitle: payload.buttons?.[0]?.title, buttonUrl: payload.buttons?.[0]?.url, };
                }
            } else {
                const legacyPayload = st.messagePayload as { text?: string, buttons?: Button[] };
                nodeType = 'textButton';
                nodeData = { text: legacyPayload.text, buttonTitle: legacyPayload.buttons?.[0]?.title, buttonUrl: legacyPayload.buttons?.[0]?.url, }
            }
            ns.push({ id: dId, type: 'delay', position: { x: 250, y }, data: { minutes: st.delayMinutes } })
            ns.push({ id: mId, type: nodeType, position: { x: 500, y }, data: nodeData })
            const prev = idx === 0 ? 'start' : `msg-${stepsData[idx - 1].id}`
            es.push({ id: `e-${prev}-${dId}`, source: prev, target: dId, animated: true })
            es.push({ id: `e-${dId}-${mId}`, source: dId, target: mId, animated: true })
        })
        setNodes(ns); setEdges(es);
    }, [stepsData, nodes.length])

    useEffect(() => {
        if (nodes.length > 0 && !initialFitViewDone) {
            flowRef.current?.fitView();
            setInitialFitViewDone(true);
        }
    }, [nodes, initialFitViewDone]);


    const onNodesChange: OnNodesChange = useCallback(changes => setNodes(ns => applyNodeChanges(changes, ns)), [])
    const onEdgesChange: OnEdgesChange = useCallback(changes => setEdges(es => applyEdgeChanges(changes, es)), [])
    const onConnect = useCallback((params: Connection) => setEdges(eds => addEdge({ ...params, animated: true }, eds)), [])

    const onSelectionChange = useCallback((p: OnSelectionChangeParams) => {
        const selectedNodes = p.nodes;
        setSelectedId(selectedNodes.length === 1 ? selectedNodes[0].id : null);
        if (selectedNodes.length !== 1) {
            setAddMenu(null);
        }
    }, []);

    const deleteNodes = useCallback((idsToDelete: string[]) => {
        if (!idsToDelete.length) return;

        Swal.fire({
            title: 'Você tem certeza?',
            text: `Deseja mesmo excluir ${idsToDelete.length} nó(s)? Esta ação não pode ser desfeita.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#ffffff'
        }).then((result) => {
            if (result.isConfirmed) {
                setNodes(ns => ns.filter(n => !idsToDelete.includes(n.id)))
                setEdges(es => es.filter(e => !idsToDelete.includes(e.source) && !idsToDelete.includes(e.target)))
                Swal.fire({
                    title: 'Excluído!',
                    text: 'Os nós foram removidos.',
                    icon: 'success',
                    background: '#1f2937',
                    color: '#ffffff',
                    timer: 1500,
                    showConfirmButton: false,
                })
            }
        });
    }, [setNodes, setEdges]);

    const onKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Delete' && selectedId) {
            deleteNodes([selectedId]);
        }
    }, [deleteNodes, selectedId]);

    const addNode = useCallback((type: string, sourceNodeId?: string | null) => {
        const id = `${type}-${Date.now()}`;
        const flowInstance = flowRef.current;
        let position = { x: 200, y: 100 };

        if (sourceNodeId && flowInstance) {
            const sourceNode = flowInstance.getNode(sourceNodeId);
            if (sourceNode) {
                position = {
                    x: sourceNode.position.x + (sourceNode.width || 0) + 100,
                    y: sourceNode.position.y,
                };
            }
        } else if (flowInstance) {
            position = flowInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 3 });
        }

        const newNode: Node<NodeDataWithValidation> = { id, type, position, data: { isInvalid: true } };
        setNodes(ns => [...ns, newNode]);

        if (sourceNodeId) {
            const newEdge: Edge = {
                id: `e-${sourceNodeId}-${id}`,
                source: sourceNodeId,
                target: id,
                animated: true,
            };
            setEdges(es => addEdge(newEdge, es));
        }
    }, [setNodes, setEdges]);

    const updateNodeData = useCallback((id: string, d: Partial<NodeDataWithValidation>) =>
        setNodes(ns => ns.map(n => (n.id === id ? { ...n, data: { ...n.data, ...d } } : n))), [])

    const buildSteps = useCallback((): SaveStep[] => {
        const out: SaveStep[] = [];
        let cur = 'start', order = 0;

        while (true) {
            const de = edges.find(e => e.source === cur && nodes.find(n => n.id === e.target)?.type === 'delay');
            if (!de) break;
            const dn = nodes.find(n => n.id === de.target)!;
            const me = edges.find(e => e.source === dn.id);
            if (!me) break;
            const mn = nodes.find(n => n.id === me.target)!;

            let messagePayload: AttachmentPayload;

            if (mn.type === 'textButton') {
                const buttons: Button[] = [];
                if (mn.data.buttonUrl && mn.data.buttonTitle) {
                    buttons.push({ type: 'web_url', url: mn.data.buttonUrl, title: mn.data.buttonTitle });
                }
                messagePayload = {
                    attachment: {
                        type: 'template',
                        payload: {
                            template_type: 'button',
                            text: mn.data.text || '',
                            buttons: buttons
                        }
                    }
                };
            } else if (mn.type === 'imageLink') {
                const buttons: Button[] = [];
                if (mn.data.buttonUrl && mn.data.buttonTitle) {
                    buttons.push({ type: 'web_url', url: mn.data.buttonUrl, title: mn.data.buttonTitle });
                }

                const element: GenericElement = {
                    title: mn.data.title || '',
                    subtitle: mn.data.subtitle || '',
                    image_url: mn.data.imageUrl || '',
                    buttons: buttons.length > 0 ? buttons : undefined,
                };

                if (mn.data.defaultActionUrl) {
                    element.default_action = {
                        type: 'web_url',
                        url: mn.data.defaultActionUrl,
                        webview_height_ratio: 'full'
                    };
                }

                messagePayload = {
                    attachment: {
                        type: 'template',
                        payload: {
                            template_type: 'generic',
                            image_aspect_ratio: 'square',
                            elements: [element]
                        }
                    }
                };
            } else {
                continue;
            }

            out.push({ stepOrder: order, delayMinutes: dn.data.minutes || 0, messagePayload });
            order++;
            cur = mn.id;
        }
        return out;
    }, [edges, nodes]);

    const getNodeValidationError = (node: Node<NodeDataWithValidation>, allNodes: Node[], allEdges: Edge[]): string | null => {
        const isConnected = allEdges.some(e => e.target === node.id || e.source === node.id);
        if (node.id !== 'start' && !isConnected) {
            return "Nó desconectado.";
        }
        if (node.type === 'delay') {
            const minutes = node.data.minutes;
            if (minutes === undefined || minutes === null || isNaN(Number(minutes)) || Number(minutes) < 0) return "O valor em minutos é inválido.";
        } else if (node.type === 'textButton') {
            const { text, buttonTitle, buttonUrl } = node.data;
            if (!text || String(text).trim() === '') return "O campo 'Texto' é obrigatório.";
            if ((buttonTitle && !buttonUrl) || (!buttonTitle && buttonUrl)) return "Título e URL do botão devem ser preenchidos juntos.";
            if (buttonUrl && !String(buttonUrl).startsWith('http')) return "URL do botão deve ser válida.";
        } else if (node.type === 'imageLink') {
            const { imageUrl, title, subtitle, buttonTitle, buttonUrl, defaultActionUrl } = node.data;
            if (!imageUrl || !String(imageUrl).startsWith('http')) return "URL da Imagem é obrigatória e deve ser válida.";
            if (!title || String(title).trim() === '') return "Título do Card é obrigatório.";
            if (!subtitle || String(subtitle).trim() === '') return "Subtítulo do Card é obrigatório.";
            if (!defaultActionUrl || !String(defaultActionUrl).startsWith('http')) return "URL do Clique na Imagem é obrigatória e deve ser válida.";
            if ((buttonTitle && !buttonUrl) || (!buttonTitle && buttonUrl)) return "Título e URL do botão devem ser preenchidos juntos.";
            if (buttonUrl && !String(buttonUrl).startsWith('http')) return "URL do botão deve ser válida.";
        }
        return null;
    }

    useEffect(() => {
        let hasChanges = false;
        const newNodes = nodes.map((node) => {
            if (node.id === 'start') return node;
            const error = getNodeValidationError(node, nodes, edges);
            const isInvalid = !!error;
            if ((node.data.isInvalid || false) !== isInvalid) {
                hasChanges = true;
                return { ...node, data: { ...node.data, isInvalid } };
            }
            return node;
        });
        if (hasChanges) {
            setNodes(newNodes);
        }
    }, [nodes, edges]);

    const validateFlowForSave = useCallback(() => {
        if (buildSteps().length === 0) {
            toast.error('Adicione pelo menos um Delay → Mensagem antes de salvar.');
            return false;
        }
        const hasErrors = nodes.some(n => n.data.isInvalid);
        if (hasErrors) {
            toast.error('Existem nós com erros de configuração. Verifique as bordas vermelhas.');
            return false;
        }
        return true;
    }, [nodes, buildSteps])

    const handleSave = useCallback(() => {
        if (!validateFlowForSave()) return
        const stepsToSave = buildSteps();
        saveMutation.mutate(stepsToSave)
    }, [validateFlowForSave, buildSteps, saveMutation])



    const onNodeContextMenu = useCallback((event: MouseEvent, node: Node) => {
        event.preventDefault();
        if (node.id === 'start') return;
        setMenu({
            id: node.id,
            top: event.pageY,
            left: event.pageX,
        });
    }, []);

    const onPaneClick = useCallback(() => {
        setMenu(null);
        setAddMenu(null);
    }, []);

    const duplicateNode = useCallback((nodeId: string) => {
        const nodeToDuplicate = nodes.find(n => n.id === nodeId);
        if (!nodeToDuplicate) return;
        const newId = `${nodeToDuplicate.type}-${Date.now()}`;
        const newNode: Node<NodeDataWithValidation> = {
            ...nodeToDuplicate,
            id: newId,
            position: {
                x: nodeToDuplicate.position.x + 30,
                y: nodeToDuplicate.position.y + 30,
            },
            data: { ...nodeToDuplicate.data },
            selected: false,
        };
        setNodes(ns => [...ns, newNode]);
    }, [nodes]);

    const selectedNodeForSidebar = useMemo(() => sidebarNodeId ? nodes.find(n => n.id === sidebarNodeId) : null, [sidebarNodeId, nodes]);
    const currentAuto = useMemo(() => automations.find(a => a.id === Number(automationId))?.name, [automations, automationId]);

    const handleAddFromMenu = (type: string, sourceId: string) => {
        addNode(type, sourceId);
        setAddMenu(null);
    }

    const handleNodeDoubleClick = useCallback((_: MouseEvent, node: Node) => {
        if (node.id !== 'start') {
            setSidebarNodeId(node.id);
        }
    }, []);

    return (
        <div className="relative flex h-full bg-gray-800" tabIndex={0} onKeyDown={onKeyDown}>
            <div className="absolute top-4 left-4 text-white text-2xl font-bold z-10">{currentAuto ?? 'Automação'}</div>
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-4 bg-gray-900 p-2 rounded-lg z-10">
                <button onClick={handleSave} className="p-2 bg-blue-600 hover:bg-blue-700 rounded disabled:bg-blue-900 disabled:cursor-not-allowed" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Salvando...' : <Save className="w-6 h-6 text-white" />}
                </button>
            </div>
            <main className="flex-1">
                <ReactFlow
                    nodes={nodes} edges={edges} onInit={inst => (flowRef.current = inst)} onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange} onConnect={onConnect} onSelectionChange={onSelectionChange}
                    onNodeDoubleClick={handleNodeDoubleClick}
                    nodeTypes={nodeTypes} fitView onPaneClick={onPaneClick} onNodeContextMenu={onNodeContextMenu}
                    onMoveStart={() => {setMenu(null); setAddMenu(null);}}>
                    <MiniMap />
                    <Controls />
                    <Background />
                    {addMenu && <AddNodeMenu top={addMenu.top} left={addMenu.left} onAdd={handleAddFromMenu} sourceId={addMenu.sourceId} />}
                </ReactFlow>
                {menu && (
                    <div style={{ top: menu.top, left: menu.left }} className="fixed z-50 bg-gray-800 border border-gray-600 rounded-md shadow-lg text-white text-sm">
                        <button onClick={() => { duplicateNode(menu.id); setMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 text-left"> <Copy className="w-4 h-4"/> Duplicar </button>
                        <button onClick={() => { deleteNodes([menu.id]); setMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-800 text-red-400 text-left"> <Trash2 className="w-4 h-4"/> Excluir </button>
                    </div>
                )}
            </main>
            {selectedNodeForSidebar && (
                <aside className="absolute right-0 top-0 h-full w-80 bg-gray-900 p-4 text-white overflow-y-auto">
                    <div className="flex justify-between mb-4">
                        <h2 className="text-lg font-semibold">Configuração</h2>
                        <button onClick={() => setSidebarNodeId(null)} className="p-1 hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button>
                    </div>
                    {selectedNodeForSidebar.type === 'delay' && (
                        <div className="space-y-3">
                            <label className="block text-sm">Delay (minutos)</label>
                            <input type="number" value={selectedNodeForSidebar.data.minutes ?? ''} onChange={e => updateNodeData(selectedNodeForSidebar.id, { minutes: Number(e.target.value) })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1"/>
                        </div>
                    )}
                    {selectedNodeForSidebar.type === 'textButton' && (
                        <div className="space-y-3">
                            <div><label className="block text-sm mb-1">Texto</label><textarea value={selectedNodeForSidebar.data.text ?? ''} onChange={e => updateNodeData(selectedNodeForSidebar.id, { text: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 h-24 resize-y"/></div>
                            <div><label className="block text-sm mb-1">Título do botão</label><input type="text" value={selectedNodeForSidebar.data.buttonTitle ?? ''} onChange={e => updateNodeData(selectedNodeForSidebar.id, { buttonTitle: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1"/></div>
                            <div><label className="block text-sm mb-1">URL do botão</label><input type="text" value={selectedNodeForSidebar.data.buttonUrl ?? ''} onChange={e => updateNodeData(selectedNodeForSidebar.id, { buttonUrl: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1"/></div>
                        </div>
                    )}
                    {selectedNodeForSidebar.type === 'imageLink' && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm mb-1">Selecionar Imagem</label>
                                <button
                                    onClick={() => setIsPickerOpen(true)}
                                    className="w-full flex items-center justify-center gap-2 text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold"
                                >
                                    <Search className="w-4 h-4"/>
                                    Selecionar da Galeria
                                </button>
                            </div>
                            <div><label className="block text-sm mb-1">URL da Imagem</label><input type="text" value={selectedNodeForSidebar.data.imageUrl ?? ''} onChange={e => updateNodeData(selectedNodeForSidebar.id, { imageUrl: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1"/></div>
                            <div><label className="block text-sm mb-1">Título do Card</label><input type="text" value={selectedNodeForSidebar.data.title ?? ''} onChange={e => updateNodeData(selectedNodeForSidebar.id, { title: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1"/></div>
                            <div><label className="block text-sm mb-1">Subtítulo do Card</label><input type="text" value={selectedNodeForSidebar.data.subtitle ?? ''} onChange={e => updateNodeData(selectedNodeForSidebar.id, { subtitle: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1"/></div>
                            <div><label className="block text-sm mb-1">Título do Botão (Opcional)</label><input type="text" value={selectedNodeForSidebar.data.buttonTitle ?? ''} onChange={e => updateNodeData(selectedNodeForSidebar.id, { buttonTitle: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1"/></div>
                            <div><label className="block text-sm mb-1">URL do Botão (Opcional)</label><input type="text" value={selectedNodeForSidebar.data.buttonUrl ?? ''} onChange={e => updateNodeData(selectedNodeForSidebar.id, { buttonUrl: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1"/></div>
                            <div><label className="block text-sm mb-1">URL do Clique na Imagem</label><input type="text" value={selectedNodeForSidebar.data.defaultActionUrl ?? ''} onChange={e => updateNodeData(selectedNodeForSidebar.id, { defaultActionUrl: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1"/></div>
                        </div>
                    )}
                    <div className="mt-6 flex justify-between">
                        <button onClick={() => deleteNodes([selectedNodeForSidebar.id])} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"><Trash2 className="w-4 h-4" /> Excluir</button>
                    </div>
                </aside>
            )}

            <GalleryPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelectImage={(image) => {
                    if (selectedNodeForSidebar) {
                        updateNodeData(selectedNodeForSidebar.id, { imageUrl: image.url });
                    }
                }}
            />
        </div>
    )
}