import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Rect, Circle, Text, Transformer, Image as KonvaImage, Group, Line } from 'react-konva';
import useImage from 'use-image';
import api from '../utils/api';
import { STYLE_GUIDE_PRESETS } from '../data/styleGuidePresets';
import {
    Layout,
    Type,
    Image as ImageIcon,
    Square,
    Circle as CircleIcon,
    Settings,
    Save,
    Shapes,
    Trash2,
    ZoomIn,
    ZoomOut,
    Download,
    Layers,
    ArrowUp,
    ArrowDown,
    Lock,
    Unlock,
    Edit2,
    Copy,
    ChevronsUp,
    ChevronsDown,
    BookOpen,
    Check,
    X,
    Plus,
    AlignLeft,
    AlignCenter,
    AlignRight
} from 'lucide-react';
// @ts-ignore
import { jsPDF } from 'jspdf';
import { formatTimeAgo } from '../utils/dateUtils';

// --- Types ---
interface PosterElement {
    id: string;
    type: 'rect' | 'circle' | 'text' | 'image';
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    fill?: string;
    opacity?: number;
    text?: string;
    fontSize?: number;
    lineHeight?: number;
    fontFamily?: string;
    fontStyle?: string;
    textDecoration?: string;
    src?: string;
    rotation?: number;
    lockedSections?: string[];
    name?: string;
    objectFit?: 'fill' | 'contain' | 'cover';
    textAlign?: 'left' | 'center' | 'right';
}

interface CanvasSettings {
    width: number;
    height: number;
    fill: string;
}

interface User {
    id: string;
    username: string;
}

interface Collaborator extends User {
    canAddElements: boolean;
    canDeleteElements: boolean;
    canAddLinkImages: boolean;
    canExport: boolean;
    canUseColorPicker: boolean;
    canChangeCanvasSize: boolean;
}

interface Permissions {
    canAddElements: boolean;
    canDeleteElements: boolean;
    canAddLinkImages: boolean;
    canExport: boolean;
    canUseColorPicker: boolean;
    canChangeCanvasSize: boolean;
    isOwner: boolean;
}

interface StyleGuide {
    enabled: boolean;
    colors: string[];
    fonts: string[];
    fontSizes: number[];
}

const PRESET_SIZES = [
    { name: 'A4 (Print)', width: 595, height: 842 },
    { name: 'Instagram Post', width: 1080, height: 1080 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'Standard (4:3)', width: 800, height: 600 },
    { name: 'Wide (16:9)', width: 1280, height: 720 },
];

const PRESET_COLORS = [
    '#000000', '#FFFFFF', '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4',
    '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E', '#64748B', '#94A3B8', '#334155'
];

const FONTS = [
    'Outfit', 'Inter', 'Roboto Slab', 'PT Sans', 'Lato', 'Montserrat',
    'Playfair Display', 'Merriweather', 'Arial', 'Courier New', 'Times New Roman'
];

const PRESET_IMAGES = [
    'https://www.th-koeln.de/mam/bilder/hochschule/fakultaeten/f10/fittosize_705_397_cfa6108837ad310cfa0fbc4deba31369_horsaal_mathe-inf_001_738x346.jpg',
    'https://www.barrierefrei-studieren-koeln.de/wp-content/uploads/2021/08/TH_Koeln_Campus_Deutz-1024x576.jpg',
    'https://th.bing.com/th/id/R.131b18dcacf04dd91c25c2af0de9c328?rik=HVL4j5umB8M7mw&pid=ImgRaw&r=0',
    'https://www.koelnbib.de/export/sites/koelnbib/.galleries/bilder/bibliotheken/thkoeln/THKoeln4.jpg_1521018438.jpg',
    'https://www.th-koeln.de/mam/bilder/hochschule/organisation/bibliothek/gummersbach_eingangsbereich.jpeg',
    'https://tse2.mm.bing.net/th/id/OIP.6eYT3Fmw10N8PiyvIZ8BeAAAAA?rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://www.th-koeln.de/mam/bilder/hochschule/organisation/standorte/fittosize_705_0_234e2e5854dd50684360c17e33d3353f_th_koln_campus_gummersbach_sebastian_hopp.jpg',
    'https://static.rundschau-online.de/__images/2025/10/07/9d2bece9-64b4-4544-88a2-b9e4a45cd2a8.jpeg?w=1968&h=1312&fm=jpg&s=0f40458fc03438bb912c565e5b472eec',
    'https://www.kstw.de/fileadmin/_processed_/c/4/csm_4_Mensa_Gummersbach_f051a9ec0e.jpg'
];

const PRESET_LOGOS = [
    'https://upload.wikimedia.org/wikipedia/commons/b/bc/TH-K%C3%B6ln-logo-03.png',
    'https://th-koeln.github.io/mi-bachelor-screendesign/assets/images/box.png',
    'https://pbs.twimg.com/profile_images/700097477060460545/Ws5uPb2t_400x400.png'
];

// UI Components

const InputLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
        {children}
    </label>
);

const ModernInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
    />
);

const ModernSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative">
        <select
            {...props}
            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium cursor-pointer"
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
        </div>
    </div>
);

const ToolButton = ({ icon, label, onClick, isActive, colorClass = "text-slate-400 hover:text-white hover:bg-slate-800", disabled }: any) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all group relative w-16 h-16
        ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : colorClass}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <div className={`mb-1 transition-transform group-hover:scale-110 duration-200`}>{icon}</div>
        <span className="text-[10px] font-medium tracking-wide opacity-80">{label}</span>
        {isActive && <div className="absolute -right-3 w-1 h-8 bg-blue-500 rounded-l-full"></div>}
    </button>
);

const SectionHeader = ({ label, isLocked, onToggle, canToggleLock }: { label: string, isLocked: boolean, onToggle: () => void, canToggleLock: boolean }) => (
    <div className="flex items-center justify-between mb-2 group">
        <InputLabel>{label}</InputLabel>
        {canToggleLock && (
            <button
                onClick={onToggle}
                className={`p-1 rounded-md transition-all ${isLocked ? 'text-blue-500 bg-blue-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'}`}
                title={isLocked ? `Unlock ${label}` : `Lock ${label}`}
            >
                {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
        )}
    </div>
);

const Editor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [elements, setElements] = useState<PosterElement[]>([]);
    const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
        width: 800,
        height: 600,
        fill: '#ffffff'
    });
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [tempName, setTempName] = useState('');

    const [imageTab, setImageTab] = useState<'gallery' | 'logos' | 'link'>('gallery');
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; targetId: string | null }>({ visible: false, x: 0, y: 0, targetId: null });
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [newMemberUsername, setNewMemberUsername] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [ownerId, setOwnerId] = useState<string | null>(null);
    const [permissions, setPermissions] = useState<Permissions>({
        canAddElements: false, // Default false until loaded
        canDeleteElements: false,
        canAddLinkImages: false,
        canExport: false,
        canUseColorPicker: false,
        canChangeCanvasSize: false,
        isOwner: false
    });
    const [styleGuide, setStyleGuide] = useState<StyleGuide>({
        enabled: false,
        colors: [],
        fonts: [],
        fontSizes: []
    });
    const [backendPermissions, setBackendPermissions] = useState<Permissions | null>(null);
    const stageRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Snap Guidelines
    const SNAP_THRESHOLD = 6;
    const [snapGuides, setSnapGuides] = useState<{ x?: number; y?: number }[]>([]);

    const getSnapPoints = (draggedEl: PosterElement, rawX: number, rawY: number) => {
        const cw = canvasSettings.width;
        const ch = canvasSettings.height;

        // Width/height 
        const elW = draggedEl.type === 'circle' ? (draggedEl.radius ?? 50) * 2 : (draggedEl.width ?? 0);
        const elH = draggedEl.type === 'circle' ? (draggedEl.radius ?? 50) * 2 : (draggedEl.height ?? 0);

        
        const isCircle = draggedEl.type === 'circle';
        const offsetX = isCircle ? elW / 2 : 0;
        const offsetY = isCircle ? elH / 2 : 0;

    
        const left = rawX - offsetX;
        const right = left + elW;
        const centerX = left + elW / 2;
        const top = rawY - offsetY;
        const bottom = top + elH;
        const centerY = top + elH / 2;

        
        const candidatesX: number[] = [0, cw / 2, cw]; // canvas left, center, right
        const candidatesY: number[] = [0, ch / 2, ch]; // canvas top, center, bottom

        
        elements.forEach(other => {
            if (other.id === draggedEl.id) return;
            const oW = other.type === 'circle' ? (other.radius ?? 50) * 2 : (other.width ?? 0);
            const oH = other.type === 'circle' ? (other.radius ?? 50) * 2 : (other.height ?? 0);
            const oOx = other.type === 'circle' ? oW / 2 : 0;
            const oOy = other.type === 'circle' ? oH / 2 : 0;
            const oLeft = other.x - oOx;
            const oRight = oLeft + oW;
            const oCx = oLeft + oW / 2;
            const oTop = other.y - oOy;
            const oBottom = oTop + oH;
            const oCy = oTop + oH / 2;
            candidatesX.push(oLeft, oCx, oRight);
            candidatesY.push(oTop, oCy, oBottom);
        });

        
        const snapEdgesX = [left, centerX, right];
        const snapEdgesY = [top, centerY, bottom];

        let snappedX = rawX;
        let snappedY = rawY;
        const guides: { x?: number; y?: number }[] = [];

        
        let bestDx = SNAP_THRESHOLD;
        candidatesX.forEach(cx => {
            snapEdgesX.forEach((ex, i) => {
                const d = Math.abs(ex - cx);
                if (d < bestDx) {
                    bestDx = d;
                    
                    const edgeOffsets = [-offsetX, elW / 2 - offsetX, elW - offsetX];
                    snappedX = cx - edgeOffsets[i];
                    guides.filter(g => g.x !== undefined).forEach((_, idx) => guides.splice(idx, 1));
                    guides.push({ x: cx });
                }
            });
        });

        
        let bestDy = SNAP_THRESHOLD;
        candidatesY.forEach(cy => {
            snapEdgesY.forEach((ey, i) => {
                const d = Math.abs(ey - cy);
                if (d < bestDy) {
                    bestDy = d;
                    const edgeOffsets = [-offsetY, elH / 2 - offsetY, elH - offsetY];
                    snappedY = cy - edgeOffsets[i];
                    guides.filter(g => g.y !== undefined).forEach((_, idx) => guides.splice(idx, 1));
                    guides.push({ y: cy });
                }
            });
        });

        return { snappedX, snappedY, guides };
    };

    const handleDragMove = (el: PosterElement, e: any) => {
        const node = e.target;
        const { snappedX, snappedY, guides } = getSnapPoints(el, node.x(), node.y());
        node.x(snappedX);
        node.y(snappedY);
        setSnapGuides(guides);
    };

    const handleDragEnd = (el: PosterElement, e: any) => {
        setSnapGuides([]);
        updateElement(el.id, { x: e.target.x(), y: e.target.y() });
    };

    
    useEffect(() => {
        if (!lastSaved) return;
        const interval = setInterval(() => {
            
            setLastSaved(prev => prev ? new Date(prev) : null);
        }, 60000);
        return () => clearInterval(interval);
    }, [lastSaved]);

    
    useEffect(() => {
        
        if (backendPermissions) {
            setPermissions(backendPermissions);
            return;
        }

        
        if (currentUser && ownerId) {
            const isOwner = currentUser.id === ownerId;
            setPermissions({
                canAddElements: isOwner,
                canDeleteElements: isOwner,
                canAddLinkImages: isOwner,
                canExport: true,
                canUseColorPicker: isOwner,
                canChangeCanvasSize: isOwner,
                isOwner: isOwner
            });
        }
    }, [currentUser, ownerId, backendPermissions]);

    useEffect(() => {
        fetchCurrentUser();
        fetchPoster();
        fetchCollaborators();
    }, [id]);

    const fetchCurrentUser = async () => {
        try {
            const response = await api.get('/me');
            setCurrentUser(response.data);
        } catch (err) {
            console.error("Failed to fetch current user", err);
        }
    };

    
    useEffect(() => {
        if (containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            const scaleX = (clientWidth - 100) / canvasSettings.width;
            const scaleY = (clientHeight - 100) / canvasSettings.height;
            const newScale = Math.min(scaleX, scaleY, 1);
            setScale(newScale > 0.1 ? newScale : 1);
        }
    }, [canvasSettings.width, canvasSettings.height]);

    const fetchPoster = async () => {
        try {
            const response = await api.get(`/posters/${id}`);
            setTitle(response.data.name || '');
            if (response.data.permissions) {
                setBackendPermissions(response.data.permissions);
            }
            if (response.data.owner?.id) {
                setOwnerId(response.data.owner.id);
            }
            
            if (response.data.updatedAt) {
                setLastSaved(new Date(response.data.updatedAt));
            }
            if (response.data.contentJson) {
                const parsed = JSON.parse(response.data.contentJson);
                if (Array.isArray(parsed)) {
                    setElements(parsed);
                } else if (parsed.elements) {
                    setElements(parsed.elements);
                    if (parsed.canvas) {
                        setCanvasSettings(parsed.canvas);
                    }
                    if (parsed.styleGuide) {
                        setStyleGuide(parsed.styleGuide);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to load poster", err);
        }
    };

    const savePoster = async () => {
        try {
            const content = {
                elements,
                canvas: canvasSettings,
                styleGuide
            };
            
            await api.put(`/posters/${id}`, {
                name: title,
                contentJson: JSON.stringify(content)
            });
            setLastSaved(new Date()); 
            
        } catch (err) {
            console.error("Failed to save", err);
        }
    };

    const fetchCollaborators = async () => {
        try {
            const response = await api.get(`/posters/${id}/collaborators`);
            setCollaborators(response.data);
        } catch (err) {
            console.error("Failed to load collaborators", err);
        }
    };

    const addCollaborator = async () => {
        if (!newMemberUsername.trim()) return;
        try {
            await api.post(`/posters/${id}/collaborators`, { username: newMemberUsername });
            setNewMemberUsername('');
            fetchCollaborators();
        } catch (err) {
            alert("Failed to add member. Check username.");
            console.error(err);
        }
    };

    const removeCollaborator = async (userId: string) => {
        if (!confirm("Remove this member?")) return;
        try {
            await api.delete(`/posters/${id}/collaborators/${userId}`);
            fetchCollaborators();
        } catch (err) {
            console.error("Failed to remove member", err);
        }
    };

    const updateCollaboratorPermissions = async (userId: string, newPermissions: Partial<Collaborator>) => {
        try {
            await api.put(`/posters/${id}/collaborators/${userId}/permissions`, newPermissions);
            fetchCollaborators(); 
        } catch (err) {
            console.error("Failed to update permissions", err);
        }
    };

    const addElement = (type: 'rect' | 'circle' | 'text') => {
        if (!permissions.canAddElements) {
            alert("You do not have permission to add elements.");
            return;
        }
        const newEl: PosterElement = {
            id: Date.now().toString(),
            type,
            x: canvasSettings.width / 2 - 50,
            y: canvasSettings.height / 2 - 50,
            fill: type === 'text' ? '#1e293b' : '#3B82F6',
            opacity: 1,
            width: 100,
            height: 100,
            radius: 50,
            text: type === 'text' ? 'Double click to edit' : undefined,
            fontSize: 32,
            fontFamily: 'Outfit',
            fontStyle: 'normal',
            textDecoration: '',
            rotation: 0,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${elements.filter(e => e.type === type).length + 1}`
        };
        setElements([...elements, newEl]);
        setActiveMenu(null);
        setSelectedId(newEl.id);
    };

    const addImage = (src: string) => {
        if (!permissions.canAddElements) {
            alert("You do not have permission to add elements.");
            return;
        }
        const newEl: PosterElement = {
            id: Date.now().toString(),
            type: 'image',
            x: canvasSettings.width / 2 - 100,
            y: canvasSettings.height / 2 - 100,
            width: 200,
            height: 200,
            src: src,
            rotation: 0,
            opacity: 1,
            objectFit: 'cover',
            name: `Image ${elements.filter(e => e.type === 'image').length + 1}`
        };
        setElements([...elements, newEl]);
        setSelectedId(newEl.id);
        setActiveMenu(null);
    }

    const updateElement = (id: string, attrs: Partial<PosterElement>) => {
        setElements(elements.map(el => el.id === id ? { ...el, ...attrs } : el));
    }

    const toggleLock = (id: string, section: string) => {
        
        if (currentUser?.id !== ownerId) return;

        const el = elements.find(e => e.id === id);
        if (!el) return;

        const currentLocks = el.lockedSections || [];
        const isLocked = currentLocks.includes(section);
        const newLocks = isLocked
            ? currentLocks.filter(s => s !== section)
            : [...currentLocks, section];

        updateElement(id, { lockedSections: newLocks });
    };

    const moveElement = (id: string, direction: 'up' | 'down') => {
        const index = elements.findIndex(el => el.id === id);
        if (index === -1) return;

        const newElements = [...elements];
        if (direction === 'up' && index < elements.length - 1) {
            [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
        } else if (direction === 'down' && index > 0) {
            [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
        }
        setElements(newElements);
    };

    const toggleLayerLock = (id: string) => {
        
        if (currentUser?.id !== ownerId) return;

        const el = elements.find(e => e.id === id);
        if (!el) return;
        const allSections = ['layout', 'appearance', 'typography', 'content'];
        const currentLocks = el.lockedSections || [];
        const isFullyLocked = allSections.every(s => currentLocks.includes(s));

        updateElement(id, {
            lockedSections: isFullyLocked ? [] : allSections
        });
    };

    const startRenaming = (id: string, currentName: string) => {
        setRenamingId(id);
        setTempName(currentName);
    };

    const saveRename = () => {
        if (renamingId) {
            updateElement(renamingId, { name: tempName });
            setRenamingId(null);
        }
    };

    const duplicateElement = (id: string) => {
        if (!permissions.canAddElements) {
            alert("You do not have permission to duplicate elements.");
            return;
        }
        const el = elements.find(e => e.id === id);
        if (!el) return;
        const newEl = {
            ...el,
            id: crypto.randomUUID(),
            name: `${el.name} (Copy)`,
            x: el.x + 20,
            y: el.y + 20
        };
        setElements([...elements, newEl]);
        setSelectedId(newEl.id);
        setContextMenu({ ...contextMenu, visible: false });
    };

    const changeZIndex = (id: string, action: 'front' | 'back' | 'forward' | 'backward') => {
        const index = elements.findIndex(e => e.id === id);
        if (index === -1) return;
        let newElements = [...elements];
        const el = newElements[index];
        newElements.splice(index, 1);

        if (action === 'front') newElements.push(el);
        if (action === 'back') newElements.unshift(el);
        if (action === 'forward') newElements.splice(Math.min(newElements.length, index + 1), 0, el);
        if (action === 'backward') newElements.splice(Math.max(0, index - 1), 0, el);

        setElements(newElements);
        setContextMenu({ ...contextMenu, visible: false });
    };

    const deleteElement = (id: string) => {
        if (!permissions.canDeleteElements) {
            alert("You do not have permission to delete elements.");
            return;
        }
        setElements(elements.filter(el => el.id !== id));
        if (selectedId === id) setSelectedId(null);
        setContextMenu({ ...contextMenu, visible: false });
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                if (permissions.canDeleteElements) deleteElement(selectedId);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                if (selectedId && permissions.canAddElements) duplicateElement(selectedId);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                if (selectedId && currentUser?.id === ownerId) toggleLayerLock(selectedId);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, elements, permissions, currentUser, ownerId]);

    const checkDeselect = (e: any) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelectedId(null);
            setContextMenu({ ...contextMenu, visible: false });
        } else {
            setContextMenu({ ...contextMenu, visible: false });
        }
    };

    const handleContextMenu = (e: any) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();

        
        let contextTargetId = null;
        
        if (e.target !== stage) {
            let node = e.target;
            while (node && node !== stage) {
                if (node.id()) {
                    contextTargetId = node.id();
                    break;
                }
                node = node.getParent();
            }
        }

        if (contextTargetId) {
            setSelectedId(contextTargetId); 
            setContextMenu({
                visible: true,
                x: e.evt.clientX,
                y: e.evt.clientY,
                targetId: contextTargetId
            });
        }
    };

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const scaleBy = 1.1;
                const newScale = e.deltaY < 0 ? scale * scaleBy : scale / scaleBy;
                setScale(Math.max(0.1, Math.min(5, newScale)));
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [scale]);

    const selectedElement = elements.find(el => el.id === selectedId);

    const exportPoster = async (format: 'png' | 'pdf') => {
        if (!permissions.canExport) {
            alert("You do not have permission to export.");
            return;
        }
        if (!stageRef.current) return;

       
        const currentSelection = selectedId;
        setSelectedId(null);

        await new Promise(resolve => setTimeout(resolve, 150));

        const pixelRatio = format === 'pdf' ? 3 : 2;
        const cw = canvasSettings.width;
        const ch = canvasSettings.height;

        
        const offscreen = document.createElement('canvas');
        offscreen.width = cw * pixelRatio;
        offscreen.height = ch * pixelRatio;
        const ctx = offscreen.getContext('2d')!;
        ctx.scale(pixelRatio, pixelRatio);

    
        ctx.fillStyle = canvasSettings.fill;
        ctx.fillRect(0, 0, cw, ch);

        
        const loadImage = async (src: string): Promise<HTMLImageElement | null> => {
            if (src.startsWith('data:')) {
                return new Promise((resolve) => {
                    const img = new window.Image();
                    img.onload = () => resolve(img);
                    img.onerror = () => resolve(null);
                    img.src = src;
                });
            }

            try {
                const token = localStorage.getItem('token');
                const baseUrl = `http://${window.location.hostname}:8080/api/v1`;
                const proxyUrl = `${baseUrl}/posters/proxy?url=${encodeURIComponent(src)}`;

                const response = await fetch(proxyUrl, {
                    headers: token ? { 'Authorization': `Basic ${token}` } : {}
                });

                if (!response.ok) throw new Error('Proxy failed');

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                return new Promise((resolve) => {
                    const img = new window.Image();
                    img.onload = () => {
                        URL.revokeObjectURL(objectUrl);
                        resolve(img);
                    };
                    img.onerror = () => {
                        URL.revokeObjectURL(objectUrl);
                        resolve(null);
                    };
                    img.src = objectUrl;
                });
            } catch (err) {
                console.warn('Proxy load failed, falling back to direct load', err);
                return new Promise((resolve) => {
                    const img = new window.Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => resolve(img);
                    img.onerror = () => resolve(null);
                    img.src = src;
                });
            }
        };

       
        for (const el of elements) {
            ctx.save();

            
            const cx = el.type === 'circle' ? el.x : (el.x + (el.width ?? 0) / 2);
            const cy = el.type === 'circle' ? el.y : (el.y + (el.height ?? 0) / 2);
            if (el.rotation) {
                ctx.translate(cx, cy);
                ctx.rotate((el.rotation * Math.PI) / 180);
                ctx.translate(-cx, -cy);
            }

            ctx.globalAlpha = el.opacity ?? 1;

            if (el.type === 'rect') {
                ctx.fillStyle = el.fill ?? '#000000';
                ctx.fillRect(el.x, el.y, el.width ?? 100, el.height ?? 100);
            } else if (el.type === 'circle') {
                ctx.fillStyle = el.fill ?? '#000000';
                ctx.beginPath();
                ctx.arc(el.x, el.y, el.radius ?? 50, 0, Math.PI * 2);
                ctx.fill();
            } else if (el.type === 'text') {
                const style = el.fontStyle ?? 'normal';
                const size = el.fontSize ?? 24;
                const family = el.fontFamily ?? 'Arial';
                ctx.fillStyle = el.fill ?? '#000000';
                const fontString = `${style === 'italic' ? 'italic ' : ''}${style === 'bold' || style === 'bold italic' ? 'bold ' : ''}${size}px ${family}`;
                ctx.font = fontString;
                ctx.textBaseline = 'top';

                const lines = (el.text ?? '').split('\n');
                const lineH = size * (el.lineHeight ?? 1.2);
                const boxW = el.width ?? cw;

                
                const wrappedLines: string[] = [];
                for (const rawLine of lines) {
                    const words = rawLine.split(' ');
                    if (words.length === 0) {
                        wrappedLines.push('');
                        continue;
                    }
                    let current = '';
                    for (const word of words) {
                        const test = current ? current + ' ' + word : word;
                        if (ctx.measureText(test).width <= boxW) {
                            current = test;
                        } else {
                            if (current) wrappedLines.push(current);
                            current = word;
                        }
                    }
                    wrappedLines.push(current);
                }

                wrappedLines.forEach((line, i) => {
                    let xPos = el.x;
                    const textW = ctx.measureText(line).width;
                    if (el.textAlign === 'center') xPos = el.x + boxW / 2 - textW / 2;
                    if (el.textAlign === 'right') xPos = el.x + boxW - textW;
                    ctx.fillText(line, xPos, el.y + i * lineH);
                    if (el.textDecoration === 'underline') {
                        ctx.beginPath();
                        ctx.moveTo(xPos, el.y + i * lineH + size);
                        ctx.lineTo(xPos + textW, el.y + i * lineH + size);
                        ctx.strokeStyle = el.fill ?? '#000000';
                        ctx.stroke();
                    }
                });
            } else if (el.type === 'image' && el.src) {
                const img = await loadImage(el.src);
                if (img) {
                    const dw = el.width ?? 200;
                    const dh = el.height ?? 200;
                    const fit = el.objectFit ?? 'cover';

                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(el.x, el.y, dw, dh);
                    ctx.clip();

                    if (fit === 'fill') {
                        ctx.drawImage(img, el.x, el.y, dw, dh);
                    } else {
                        const imgRatio = img.naturalWidth / img.naturalHeight;
                        const containerRatio = dw / dh;
                        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
                        if (fit === 'cover') {
                            if (containerRatio > imgRatio) {
                                sh = img.naturalWidth / containerRatio;
                                sy = (img.naturalHeight - sh) / 2;
                            } else {
                                sw = img.naturalHeight * containerRatio;
                                sx = (img.naturalWidth - sw) / 2;
                            }
                            ctx.drawImage(img, sx, sy, sw, sh, el.x, el.y, dw, dh);
                        } else { // contain
                            let drawW = dw, drawH = dh, drawX = el.x, drawY = el.y;
                            if (containerRatio > imgRatio) {
                                drawW = dh * imgRatio;
                                drawX = el.x + (dw - drawW) / 2;
                            } else {
                                drawH = dw / imgRatio;
                                drawY = el.y + (dh - drawH) / 2;
                            }
                            ctx.drawImage(img, drawX, drawY, drawW, drawH);
                        }
                    }
                    ctx.restore();
                } else {
                    
                    ctx.fillStyle = '#f1f5f9';
                    ctx.fillRect(el.x, el.y, el.width ?? 200, el.height ?? 200);
                    ctx.strokeStyle = '#cbd5e1';
                    ctx.strokeRect(el.x, el.y, el.width ?? 200, el.height ?? 200);
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '10px Arial';
                    ctx.fillText('Image CORS error', el.x + 5, el.y + 15);
                }
            }

            ctx.restore();
        }

        const dataURL = offscreen.toDataURL('image/png');

        if (format === 'png') {
            const link = document.createElement('a');
            link.download = `${title || 'poster'}.png`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === 'pdf') {
            const pdf = new jsPDF({
                orientation: cw > ch ? 'landscape' : 'portrait',
                unit: 'px',
                format: [cw, ch]
            });
            pdf.addImage(dataURL, 'PNG', 0, 0, cw, ch);
            pdf.save(`${title || 'poster'}.pdf`);
        }

    
        if (currentSelection) setSelectedId(currentSelection);
    };



    return (
        <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">

            {/* Left Sidebar */}
            <aside className="w-20 bg-slate-900 flex flex-col items-center py-6 gap-2 z-30 shadow-2xl">
                <div onClick={() => navigate('/dashboard')} className="mb-6 p-2 bg-slate-800 rounded-lg text-white cursor-pointer hover:bg-slate-700 transition-colors">
                    <Layout size={24} />
                </div>

                <div className="w-10 h-px bg-slate-800 mb-2"></div>

                <ToolButton
                    icon={<Type size={20} />}
                    label="Text"
                    onClick={() => addElement('text')}
                    disabled={!permissions.canAddElements}
                />
                <ToolButton
                    icon={<Shapes size={20} />}
                    label="Formen"
                    onClick={() => setActiveMenu(activeMenu === 'shapes' ? null : 'shapes')}
                    isActive={activeMenu === 'shapes'}
                />
                <ToolButton
                    icon={<ImageIcon size={20} />}
                    label="Bilder"
                    onClick={() => setActiveMenu(activeMenu === 'images' ? null : 'images')}
                    isActive={activeMenu === 'images'}
                    disabled={!permissions.canAddElements}
                />

                <div className="mt-auto flex flex-col gap-2">
                    {/* Style Guide Button */}
                    {permissions.isOwner && (
                        <ToolButton
                            icon={<BookOpen size={20} />}
                            label="Regeln"
                            onClick={() => setActiveMenu(activeMenu === 'styleguide' ? null : 'styleguide')}
                            isActive={activeMenu === 'styleguide'}
                        />
                    )}
                    <div className="w-10 h-px bg-slate-800 mt-1 mb-2 mx-auto"></div>
                    <ToolButton
                        icon={<Layers size={20} />}
                        label="Ebenen"
                        onClick={() => setActiveMenu(activeMenu === 'layers' ? null : 'layers')}
                        isActive={activeMenu === 'layers'}
                    />
                    <ToolButton
                        icon={<Settings size={20} />}
                        label="Optionen"
                        onClick={() => {
                            setSelectedId(null);
                            setActiveMenu(null);
                        }}
                        isActive={!selectedId && activeMenu !== 'layers'}
                    />
                </div>
            </aside>

            {/* Flyout Menu for Shapes */}
            {activeMenu === 'shapes' && (
                <div className="absolute left-24 top-24 w-64 bg-white/95 backdrop-blur-sm border border-slate-200/50 shadow-2xl rounded-2xl z-40 p-4 animate-in slide-in-from-left-4 fade-in duration-200">
                    <div className="flex items-center gap-2 mb-4 text-slate-800">
                        <Shapes size={18} className="text-blue-600" />
                        <span className="font-bold text-sm">Form hinzufügen</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => addElement('rect')}
                            disabled={!permissions.canAddElements}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition-all group ${!permissions.canAddElements ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Square size={28} strokeWidth={1.5} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                            <span className="text-xs font-medium text-slate-600">Rechteck</span>
                        </button>
                        <button
                            onClick={() => addElement('circle')}
                            disabled={!permissions.canAddElements}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition-all group ${!permissions.canAddElements ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <CircleIcon size={28} strokeWidth={1.5} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                            <span className="text-xs font-medium text-slate-600">Kreis</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Flyout Menu for Images */}
            {activeMenu === 'images' && (
                <div className="absolute left-24 top-64 w-80 bg-white/95 backdrop-blur-sm border border-slate-200/50 shadow-2xl rounded-2xl z-40 p-4 animate-in slide-in-from-left-4 fade-in duration-200 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-slate-800">
                        <ImageIcon size={18} className="text-blue-600" />
                        <span className="font-bold text-sm">Bild hinzufügen</span>
                    </div>

                    <div className="p-1 bg-slate-100 rounded-lg flex gap-1">
                        <button
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${imageTab === 'gallery' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                            onClick={() => setImageTab('gallery')}
                        >
                            Bilder
                        </button>
                        <button
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${imageTab === 'logos' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                            onClick={() => setImageTab('logos')}
                        >
                            Logos
                        </button>
                        {permissions.canAddLinkImages && (
                            <button
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${imageTab === 'link' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                                onClick={() => setImageTab('link')}
                            >
                                Link
                            </button>
                        )}
                    </div>

                    {imageTab === 'link' ? (
                        <div className="flex flex-col gap-3">
                            <div className="text-xs text-slate-500">
                                Füge hier eine Bild-URL ein:
                            </div>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    placeholder="https://"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            addImage(e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                    disabled={!permissions.canAddLinkImages}
                                />
                            </div>
                            <div className="text-[10px] text-slate-400 italic">
                                Drücke Enter, um das Bild hinzuzufügen
                            </div>
                        </div>
                    ) : imageTab === 'logos' ? (
                        <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto custom-scrollbar no-scrollbar pr-1">
                            {PRESET_LOGOS.map((src, i) => (
                                <button
                                    key={i}
                                    onClick={() => addImage(src)}
                                    disabled={!permissions.canAddElements}
                                    className="aspect-square rounded-lg overflow-hidden border border-slate-100 hover:border-blue-500 hover:ring-2 hover:ring-blue-100 transition-all group relative p-4 bg-slate-50 flex items-center justify-center"
                                >
                                    <img src={src} alt="Logo" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto custom-scrollbar no-scrollbar pr-1">
                            {PRESET_IMAGES.map((src, i) => (
                                <button
                                    key={i}
                                    onClick={() => addImage(src)}
                                    disabled={!permissions.canAddElements}
                                    className="aspect-square rounded-lg overflow-hidden border border-slate-100 hover:border-blue-500 hover:ring-2 hover:ring-blue-100 transition-all group relative"
                                >
                                    <img src={src} alt="Preset" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Flyout Menu for Style Guide */}
            {activeMenu === 'styleguide' && (
                <div className="absolute left-24 top-auto bottom-20 w-80 bg-white/95 backdrop-blur-sm border border-slate-200/50 shadow-2xl rounded-2xl z-40 p-4 animate-in slide-in-from-left-4 fade-in duration-200 flex flex-col gap-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between text-slate-800 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                            <BookOpen size={18} className="text-blue-600" />
                            <span className="font-bold text-sm">Designregeln</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={styleGuide.enabled}
                                onChange={(e) => setStyleGuide({ ...styleGuide, enabled: e.target.checked })}
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Presets Selector */}
                    <div className="space-y-2">
                        <InputLabel>Vorlage laden</InputLabel>
                        <div className="grid grid-cols-2 gap-2">
                            {STYLE_GUIDE_PRESETS.map(preset => (
                                <button
                                    key={preset.id}
                                    onClick={() => setStyleGuide({
                                        enabled: true,
                                        colors: preset.colors,
                                        fonts: preset.fonts,
                                        fontSizes: preset.fontSizes
                                    })}
                                    className="text-left p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                                >
                                    <div className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">{preset.name}</div>
                                    <div className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full h-px bg-slate-100"></div>

                    <div className={`space-y-6 transition-opacity duration-200 ${!styleGuide.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        {/* Colors */}
                        <div className="space-y-2">
                            <InputLabel>Erlaubte Farben</InputLabel>
                            <div className="flex flex-wrap gap-2">
                                {styleGuide.colors.map(color => (
                                    <div key={color} className="relative group">
                                        <div className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: color }} />
                                        <button
                                            onClick={() => setStyleGuide({ ...styleGuide, colors: styleGuide.colors.filter(c => c !== color) })}
                                            className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                                <label className="w-8 h-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors text-slate-400 hover:text-blue-500">
                                    <Plus size={14} />
                                    <input
                                        type="color"
                                        className="sr-only"
                                        onChange={(e) => {
                                            if (!styleGuide.colors.includes(e.target.value)) {
                                                setStyleGuide({ ...styleGuide, colors: [...styleGuide.colors, e.target.value] });
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Fonts */}
                        <div className="space-y-2">
                            <InputLabel>Erlaubte Schriftarten</InputLabel>
                            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto custom-scrollbar p-1">
                                {FONTS.map(font => (
                                    <label key={font} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer group">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${styleGuide.fonts.includes(font) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                            {styleGuide.fonts.includes(font) && <Check size={10} className="text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={styleGuide.fonts.includes(font)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setStyleGuide({ ...styleGuide, fonts: [...styleGuide.fonts, font] });
                                                } else {
                                                    setStyleGuide({ ...styleGuide, fonts: styleGuide.fonts.filter(f => f !== font) });
                                                }
                                            }}
                                        />
                                        <span className="text-sm text-slate-700" style={{ fontFamily: font }}>{font}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Font Sizes */}
                        <div className="space-y-2">
                            <InputLabel>Erlaubte Schriftgrößen</InputLabel>
                            <div className="flex flex-wrap gap-2">
                                {styleGuide.fontSizes.sort((a, b) => a - b).map(size => (
                                    <div key={size} className="relative group bg-slate-100 rounded px-2 py-1 text-xs font-medium text-slate-600">
                                        {size}px
                                        <button
                                            onClick={() => setStyleGuide({ ...styleGuide, fontSizes: styleGuide.fontSizes.filter(s => s !== size) })}
                                            className="absolute -top-1 -right-1 bg-red-100 rounded-full p-0.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={8} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                                    placeholder="Größe hinzufügen..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = parseInt(e.currentTarget.value);
                                            if (val && !styleGuide.fontSizes.includes(val)) {
                                                setStyleGuide({ ...styleGuide, fontSizes: [...styleGuide.fontSizes, val] });
                                                e.currentTarget.value = '';
                                            }
                                        }
                                    }}
                                />
                                <button className="p-1 text-slate-400 hover:text-blue-500">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top Header / Toolbar */}
                <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Editor</h1>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <div className="flex flex-col">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={!permissions.isOwner}
                                className={`text-sm font-medium text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none px-1 py-0 w-64 transition-all ${!permissions.isOwner ? 'cursor-default' : ''}`}
                                placeholder="Untitled Project"
                            />
                            {lastSaved && (
                                <span className="text-[10px] text-slate-400 font-medium px-1 pt-0">
                                    Gespeichert {formatTimeAgo(lastSaved)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 rounded-lg p-1 gap-1 mr-4">
                            <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-500 transition-all"><ZoomOut size={16} /></button>
                            <span className="text-xs font-mono font-medium text-slate-600 flex items-center px-1 w-12 justify-center">{Math.round(scale * 100)}%</span>
                            <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-500 transition-all"><ZoomIn size={16} /></button>
                        </div>

                        <div className="relative group mr-2">
                            <button
                                className={`flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all ${!permissions.canExport ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!permissions.canExport}
                            >
                                <Download size={16} />
                                <span className="hidden lg:inline">Export</span>
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50 transform origin-top-right">
                                <button onClick={() => exportPoster('png')} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 font-medium transition-colors">
                                    Export als PNG
                                </button>
                                <button onClick={() => exportPoster('pdf')} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 font-medium transition-colors">
                                    Export als PDF
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={savePoster}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold active:scale-95 transition-all"
                        >
                            <Save size={16} />
                            <span className="hidden lg:inline">Speichern</span>
                        </button>
                    </div>
                </header>

                {/* Canvas Scroll Area */}
                <style>{`
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}</style>
                <div
                    ref={containerRef}
                    className="flex-1 bg-slate-100 relative overflow-auto grid place-items-center p-8 active:cursor-grab no-scrollbar"
                    onClick={() => setActiveMenu(null)}
                    style={{
                        backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
                        backgroundSize: '24px 24px'
                    }}
                >
                    <div
                        className="bg-white shadow-2xl transition-transform duration-200 ease-out"
                        style={{
                            width: canvasSettings.width,
                            height: canvasSettings.height,
                            transform: `scale(${scale})`,
                            transformOrigin: 'center center'
                        }}
                    >
                        <Stage
                            width={canvasSettings.width}
                            height={canvasSettings.height}
                            onMouseDown={checkDeselect}
                            onTouchStart={checkDeselect}
                            ref={stageRef}
                            style={{ backgroundColor: canvasSettings.fill }}
                            onContextMenu={handleContextMenu}
                        >
                            <Layer>
                                <Rect
                                    x={0}
                                    y={0}
                                    width={canvasSettings.width}
                                    height={canvasSettings.height}
                                    fill={canvasSettings.fill}
                                    listening={false}
                                />
                                {elements.map((el) => (
                                    <CanvasElement
                                        key={el.id}
                                        shapeProps={el}
                                        isSelected={el.id === selectedId}
                                        onSelect={(e: any) => {
                                            setSelectedId(el.id);
                                            setActiveMenu(null); // Switch to properties on select
                                            e.cancelBubble = true;
                                        }}
                                        onChange={(newAttrs: any) => updateElement(el.id, newAttrs)}
                                        onDragMove={(e: any) => handleDragMove(el, e)}
                                        onDragEnd={(e: any) => handleDragEnd(el, e)}
                                    />
                                ))}
                            </Layer>
                            {/* Snap Guide Lines */}
                            <Layer listening={false}>
                                {snapGuides.map((g, i) =>
                                    g.x !== undefined ? (
                                        <Line
                                            key={`gx-${i}`}
                                            points={[g.x, 0, g.x, canvasSettings.height]}
                                            stroke="#3B82F6"
                                            strokeWidth={1}
                                            dash={[6, 4]}
                                        />
                                    ) : (
                                        <Line
                                            key={`gy-${i}`}
                                            points={[0, g.y!, canvasSettings.width, g.y!]}
                                            stroke="#3B82F6"
                                            strokeWidth={1}
                                            dash={[6, 4]}
                                        />
                                    )
                                )}
                            </Layer>
                        </Stage>
                    </div>
                </div>
            </main>

            {/* Context Menu */}
            {contextMenu.visible && (
                <div
                    className="absolute bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 min-w-[180px] animate-in fade-in duration-200 zoom-in-95"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => changeZIndex(contextMenu.targetId!, 'front')} className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <ChevronsUp size={14} className="text-slate-400" /> In den Vordergrund
                    </button>
                    <button onClick={() => changeZIndex(contextMenu.targetId!, 'forward')} className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <ArrowUp size={14} className="text-slate-400" /> Eine Ebene nach vorne
                    </button>
                    <button onClick={() => changeZIndex(contextMenu.targetId!, 'backward')} className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <ArrowDown size={14} className="text-slate-400" /> Eine Ebene nach hinten
                    </button>
                    <button onClick={() => changeZIndex(contextMenu.targetId!, 'back')} className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <ChevronsDown size={14} className="text-slate-400" /> In den Hintergrund
                    </button>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button
                        onClick={() => duplicateElement(contextMenu.targetId!)}
                        className={`w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 ${!permissions.canAddElements ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!permissions.canAddElements}
                    >
                        <Copy size={14} className="text-slate-400" /> Duplizieren <span className="ml-auto text-[10px] text-slate-400">Strg+D</span>
                    </button>
                    {/* Only show lock button if owner */}
                    {currentUser?.id === ownerId && (
                        <button onClick={() => toggleLayerLock(contextMenu.targetId!)} className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                            {elements.find(e => e.id === contextMenu.targetId)?.lockedSections?.length === 4 ? (
                                <><Unlock size={14} className="text-slate-400" /> Ebene entsperren</>
                            ) : (
                                <><Lock size={14} className="text-slate-400" /> Ebene sperren</>
                            )}
                            <span className="ml-auto text-[10px] text-slate-400">Strg+L</span>
                        </button>
                    )}
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button
                        onClick={() => deleteElement(contextMenu.targetId!)}
                        className={`w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-red-50 flex items-center gap-2 hover:text-red-600 ${!permissions.canDeleteElements ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!permissions.canDeleteElements}
                    >
                        <Trash2 size={14} className="text-slate-400 hover:text-red-600" /> Löschen <span className="ml-auto text-[10px] text-slate-400">Entf</span>
                    </button>
                </div>
            )}

            {/* Right Properties Panel */}
            <aside className="w-80 bg-white border-l border-slate-200 flex flex-col z-30 font-sans shadow-xl shadow-slate-200/50">
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        {activeMenu === 'layers' ? (
                            <>
                                <Layers size={16} className="text-blue-600" />
                                Ebenen
                            </>
                        ) : selectedId ? (
                            <>
                                <Settings size={16} className="text-blue-600" />
                                Eigenschaften
                            </>
                        ) : (
                            <>
                                <Layout size={16} className="text-blue-600" />
                                Projekt Einstellungen
                            </>
                        )}
                    </h2>
                    {selectedId && activeMenu !== 'layers' && (
                        <button
                            onClick={() => {
                                const newEls = elements.filter(e => e.id !== selectedId);
                                setElements(newEls);
                                setSelectedId(null);
                            }}
                            disabled={!permissions.canDeleteElements}
                            className={`ml-auto text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg ${!permissions.canDeleteElements ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Delete Element"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {activeMenu === 'layers' ? (
                        <div className="space-y-1.5">
                            {[...elements].reverse().map((el) => {
                                const isLocked = el.lockedSections?.length === 4; // Check if all sections are locked
                                return (
                                    <div
                                        key={el.id}
                                        onClick={() => setSelectedId(el.id)}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all cursor-pointer group ${selectedId === el.id
                                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                                            : isLocked
                                                ? 'bg-red-50/50 border-red-100'
                                                : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className="text-slate-500">
                                            {el.type === 'text' && <Type size={14} />}
                                            {el.type === 'image' && <ImageIcon size={14} />}
                                            {el.type === 'rect' && <Square size={14} />}
                                            {el.type === 'circle' && <CircleIcon size={14} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {renamingId === el.id ? (
                                                <input
                                                    autoFocus
                                                    value={tempName}
                                                    onChange={(e) => setTempName(e.target.value)}
                                                    onBlur={saveRename}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full text-sm font-medium text-slate-700 bg-white border border-blue-300 rounded px-1 outline-none"
                                                />
                                            ) : (
                                                <div className="text-sm font-medium text-slate-700 truncate" onDoubleClick={() => startRenaming(el.id, el.name || el.type)}>
                                                    {el.name || (el.type === 'text' ? (el.text || 'Text Layer') : el.type)}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`flex items-center gap-1 transition-opacity ${isLocked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            {currentUser?.id === ownerId && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleLayerLock(el.id); }}
                                                    className={`p-1 rounded transition-colors ${isLocked ? 'text-blue-500 bg-blue-50' : 'text-slate-400 hover:text-slate-700 hover:bg-white'}`}
                                                    title={isLocked ? "Unlock Layer" : "Lock Layer"}
                                                >
                                                    {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                                                </button>
                                            )}
                                            {!renamingId && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); startRenaming(el.id, el.name || el.type); }}
                                                    className="p-1 hover:bg-white rounded text-slate-400 hover:text-slate-700"
                                                    title="Rename"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); moveElement(el.id, 'up'); }}
                                                className="p-1 hover:bg-white rounded text-slate-400 hover:text-slate-700"
                                                title="Bring Forward"
                                            >
                                                <ArrowUp size={12} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); moveElement(el.id, 'down'); }}
                                                className="p-1 hover:bg-white rounded text-slate-400 hover:text-slate-700"
                                                title="Send Backward"
                                            >
                                                <ArrowDown size={12} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                                                disabled={!permissions.canDeleteElements}
                                                className={`p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 transition-colors ${!permissions.canDeleteElements ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title="Delete"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            {elements.length === 0 && (
                                <div className="text-center py-12 text-slate-400 text-xs italic">
                                    No layers yet
                                </div>
                            )}
                        </div>
                    ) : selectedElement ? (
                        <>
                            {/* Text Content */}
                            {selectedElement.type === 'text' && (
                                <div className="space-y-3 animation-fade-in relative">
                                    <SectionHeader
                                        label="Text"
                                        isLocked={selectedElement.lockedSections?.includes('content') || false}
                                        onToggle={() => toggleLock(selectedElement.id, 'content')}
                                        canToggleLock={currentUser?.id === ownerId}
                                    />
                                    <textarea
                                        disabled={selectedElement.lockedSections?.includes('content')}
                                        value={selectedElement.text}
                                        onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[100px] resize-y ${selectedElement.lockedSections?.includes('content') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        placeholder="Type something..."
                                    />
                                </div>
                            )}

                            {/* Image Source */}
                            {selectedElement.type === 'image' && (
                                <div className="space-y-3 animation-fade-in">
                                    <SectionHeader
                                        label="Bildquelle"
                                        isLocked={selectedElement.lockedSections?.includes('content') || false}
                                        onToggle={() => toggleLock(selectedElement.id, 'content')}
                                        canToggleLock={currentUser?.id === ownerId}
                                    />
                                    <div className={`flex flex-col gap-3 ${selectedElement.lockedSections?.includes('content') ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <div className="flex gap-2">
                                            <ModernInput
                                                value={selectedElement.src}
                                                onChange={(e) => updateElement(selectedElement.id, { src: e.target.value })}
                                                placeholder="https://..."
                                                disabled={selectedElement.lockedSections?.includes('content')}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <InputLabel>Objektpassung</InputLabel>
                                            <ModernSelect
                                                value={selectedElement.objectFit || 'cover'}
                                                onChange={(e) => updateElement(selectedElement.id, { objectFit: e.target.value as any })}
                                                disabled={selectedElement.lockedSections?.includes('content')}
                                            >
                                                <option value="cover">Ausfüllen</option>
                                                <option value="contain">Einpassen</option>
                                                <option value="fill">Strecken</option>
                                            </ModernSelect>
                                        </div>
                                    </div>
                                    {selectedElement.src && (
                                        <div className="w-full h-32 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative">
                                            <img src={selectedElement.src} className="w-full h-full object-cover opacity-80" alt="Preview" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Typography */}
                            {selectedElement.type === 'text' && (
                                <div className="space-y-4">
                                    <div className="w-full h-px bg-slate-100"></div>
                                    <SectionHeader
                                        label="Typografie"
                                        isLocked={selectedElement.lockedSections?.includes('typography') || false}
                                        onToggle={() => toggleLock(selectedElement.id, 'typography')}
                                        canToggleLock={currentUser?.id === ownerId}
                                    />

                                    <div className={`space-y-3 ${selectedElement.lockedSections?.includes('typography') ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="col-span-2">
                                                <ModernSelect
                                                    value={selectedElement.fontFamily}
                                                    onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                                                >
                                                    {(styleGuide.enabled && styleGuide.fonts.length > 0 ? styleGuide.fonts : FONTS).map(f => <option key={f} value={f}>{f}</option>)}
                                                </ModernSelect>
                                            </div>
                                            {styleGuide.enabled && styleGuide.fontSizes.length > 0 ? (
                                                <ModernSelect
                                                    value={selectedElement.fontSize}
                                                    onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                                                >
                                                    {styleGuide.fontSizes.sort((a, b) => a - b).map(s => <option key={s} value={s}>{s}px</option>)}
                                                </ModernSelect>
                                            ) : (
                                                <ModernInput
                                                    type="number"
                                                    value={selectedElement.fontSize}
                                                    onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                                                />
                                            )}
                                        </div>

                                        <div className="flex p-1 bg-slate-100 rounded-lg">
                                            {[
                                                { id: 'bold', label: 'B', weight: 'font-bold' },
                                                { id: 'italic', label: 'I', weight: 'italic' },
                                                { id: 'underline', label: 'U', weight: 'underline' }
                                            ].map((styleBtn) => {
                                                const isActive = selectedElement.fontStyle?.includes(styleBtn.id) || selectedElement.textDecoration?.includes(styleBtn.id);
                                                return (
                                                    <button
                                                        key={styleBtn.id}
                                                        onClick={() => {
                                                            let updates: any = {};
                                                            if (styleBtn.id === 'bold' || styleBtn.id === 'italic') {
                                                                let current = selectedElement.fontStyle || 'normal';
                                                                if (current.includes(styleBtn.id)) current = current.replace(styleBtn.id, '').trim() || 'normal';
                                                                else current = current === 'normal' ? styleBtn.id : `${current} ${styleBtn.id}`;
                                                                updates.fontStyle = current;
                                                            } else {
                                                                let current = selectedElement.textDecoration || '';
                                                                if (current.includes(styleBtn.id)) current = current.replace(styleBtn.id, '').trim();
                                                                else current = `${current} ${styleBtn.id}`.trim();
                                                                updates.textDecoration = current;
                                                            }
                                                            updateElement(selectedElement.id, updates);
                                                        }}
                                                        className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        <span className={styleBtn.id === 'italic' ? 'italic' : styleBtn.id === 'bold' ? 'font-bold' : 'underline'}>{styleBtn.label}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {/* Text Alignment */}
                                        <div className="flex p-1 bg-slate-100 rounded-lg mt-2">
                                            {(['left', 'center', 'right'] as const).map((align) => {
                                                const isActive = (selectedElement.textAlign || 'left') === align;
                                                const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                                                return (
                                                    <button
                                                        key={align}
                                                        onClick={() => updateElement(selectedElement.id, { textAlign: align })}
                                                        className={`flex-1 flex items-center justify-center py-1.5 h-[32px] rounded-md transition-all ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                                            }`}
                                                        title={`Align ${align}`}
                                                    >
                                                        <Icon size={15} />
                                                    </button>
                                                );
                                            })}
                                        </div>


                                        <div className="space-y-1 mt-3">
                                            <span className="text-[10px] text-slate-400 pl-1">Zeilenabstand</span>
                                            <div className="flex items-center gap-2">
                                                <ModernInput
                                                    type="number"
                                                    step="0.1"
                                                    value={selectedElement.lineHeight || 1.2}
                                                    onChange={(e) => updateElement(selectedElement.id, { lineHeight: parseFloat(e.target.value) })}
                                                    className="w-16"
                                                />
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            )}

                            {/* Appearance */}
                            <div className="space-y-4">
                                <div className="w-full h-px bg-slate-100"></div>
                                <SectionHeader
                                    label="Farben"
                                    isLocked={selectedElement.lockedSections?.includes('appearance') || false}
                                    onToggle={() => toggleLock(selectedElement.id, 'appearance')}
                                    canToggleLock={currentUser?.id === ownerId}
                                />

                                <div className={selectedElement.lockedSections?.includes('appearance') ? 'opacity-50 pointer-events-none' : ''}>
                                    {selectedElement.type !== 'image' && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                                {permissions.canUseColorPicker && !styleGuide.enabled ? (
                                                    <>
                                                        <input
                                                            type="color"
                                                            value={selectedElement.fill || '#000000'}
                                                            onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                                                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                                            disabled={selectedElement.lockedSections?.includes('appearance')}
                                                        />
                                                        <span className="text-xs font-mono text-slate-500 uppercase flex-1">{selectedElement.fill}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic flex-1">
                                                        {styleGuide.enabled ? 'Eingeschränkte Farben' : 'Custom colors disabled'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(styleGuide.enabled && styleGuide.colors.length > 0 ? styleGuide.colors : PRESET_COLORS).map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => updateElement(selectedElement.id, { fill: c })}
                                                        disabled={selectedElement.lockedSections?.includes('appearance')}
                                                        className={`w-6 h-6 rounded-full border border-slate-200 transition-transform hover:scale-110 ${selectedElement.fill === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1 mt-4">
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Deckkraft</span>
                                            <span>{Math.round((selectedElement.opacity || 1) * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0" max="1" step="0.01"
                                            value={selectedElement.opacity || 1}
                                            onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })}
                                            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                                            disabled={selectedElement.lockedSections?.includes('appearance')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Layout */}
                            <div className="space-y-4">
                                <div className="w-full h-px bg-slate-100"></div>
                                <SectionHeader
                                    label="Position"
                                    isLocked={selectedElement.lockedSections?.includes('layout') || false}
                                    onToggle={() => toggleLock(selectedElement.id, 'layout')}
                                    canToggleLock={currentUser?.id === ownerId}
                                />
                                <div className={`grid grid-cols-2 gap-3 ${selectedElement.lockedSections?.includes('layout') ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-400 pl-1">X Position</span>
                                        <ModernInput
                                            type="number"
                                            value={Math.round(selectedElement.x)}
                                            onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                                            disabled={selectedElement.lockedSections?.includes('layout')}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-400 pl-1">Y Position</span>
                                        <ModernInput
                                            type="number"
                                            value={Math.round(selectedElement.y)}
                                            onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                                            disabled={selectedElement.lockedSections?.includes('layout')}
                                        />
                                    </div>
                                    {selectedElement.type !== 'text' && (
                                        <>
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-slate-400 pl-1">Width</span>
                                                <ModernInput
                                                    type="number"
                                                    value={Math.round(selectedElement.width || 0)}
                                                    onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-slate-400 pl-1">Height</span>
                                                <ModernInput
                                                    type="number"
                                                    value={Math.round(selectedElement.height || 0)}
                                                    onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-400 pl-1">Rotation</span>
                                        <ModernInput
                                            type="number"
                                            value={Math.round(selectedElement.rotation || 0)}
                                            onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <InputLabel>Größe der Arbeitsfläche</InputLabel>
                                <ModernSelect
                                    onChange={(e) => {
                                        const p = PRESET_SIZES.find(pre => pre.name === e.target.value);
                                        if (p) setCanvasSettings({ ...canvasSettings, width: p.width, height: p.height });
                                    }}
                                    disabled={!permissions.canChangeCanvasSize}
                                >
                                    <option value="">Vorlage wählen...</option>
                                    {PRESET_SIZES.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                </ModernSelect>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400 pl-1">Breite</span>
                                    <ModernInput
                                        type="number"
                                        value={canvasSettings.width}
                                        onChange={(e) => setCanvasSettings({ ...canvasSettings, width: Number(e.target.value) })}
                                        disabled={!permissions.canChangeCanvasSize}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400 pl-1">Höhe</span>
                                    <ModernInput
                                        type="number"
                                        value={canvasSettings.height}
                                        onChange={(e) => setCanvasSettings({ ...canvasSettings, height: Number(e.target.value) })}
                                        disabled={!permissions.canChangeCanvasSize}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="w-full h-px bg-slate-100 mb-4"></div>
                                <InputLabel>Hintergrundfarbe</InputLabel>
                                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200 mb-2">
                                    {permissions.canUseColorPicker && !styleGuide.enabled ? (
                                        <>
                                            <input
                                                type="color"
                                                value={canvasSettings.fill}
                                                onChange={(e) => setCanvasSettings({ ...canvasSettings, fill: e.target.value })}
                                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                            />
                                            <span className="text-xs font-mono text-slate-500 uppercase flex-1">{canvasSettings.fill}</span>
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic flex-1">
                                            {styleGuide.enabled ? 'Eingeschränkte Farben' : 'Custom colors disabled'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {(styleGuide.enabled && styleGuide.colors.length > 0 ? styleGuide.colors : PRESET_COLORS).map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setCanvasSettings({ ...canvasSettings, fill: c })}
                                            className={`w-6 h-6 rounded-full border border-slate-200 transition-transform hover:scale-110 ${canvasSettings.fill === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Members section - Only visible to owner */}
                            {currentUser?.id === ownerId && (
                                <div className="space-y-3">
                                    <div className="w-full h-px bg-slate-100 mb-4"></div>
                                    <InputLabel>Mitarbeiter</InputLabel>
                                    <div className="flex gap-2 mb-3">
                                        <ModernInput
                                            value={newMemberUsername}
                                            onChange={(e) => setNewMemberUsername(e.target.value)}
                                            placeholder="Username"
                                            onKeyDown={(e) => e.key === 'Enter' && addCollaborator()}
                                        />
                                        <button
                                            onClick={addCollaborator}
                                            className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
                                        >
                                            Hinzufügen
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {collaborators.map(member => (
                                            <div key={member.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                            {member.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm text-slate-700 font-medium">{member.username}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => removeCollaborator(member.id)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
                                                        title="Remove member"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={member.canAddElements}
                                                            onChange={(e) => updateCollaboratorPermissions(member.id, { canAddElements: e.target.checked })}
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span>Add Elements</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={member.canDeleteElements}
                                                            onChange={(e) => updateCollaboratorPermissions(member.id, { canDeleteElements: e.target.checked })}
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span>Delete Elements</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={member.canAddLinkImages}
                                                            onChange={(e) => updateCollaboratorPermissions(member.id, { canAddLinkImages: e.target.checked })}
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span>Add Link Images</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={member.canExport}
                                                            onChange={(e) => updateCollaboratorPermissions(member.id, { canExport: e.target.checked })}
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span>Export Poster</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={member.canUseColorPicker}
                                                            onChange={(e) => updateCollaboratorPermissions(member.id, { canUseColorPicker: e.target.checked })}
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span>Use Color Picker</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={member.canChangeCanvasSize}
                                                            onChange={(e) => updateCollaboratorPermissions(member.id, { canChangeCanvasSize: e.target.checked })}
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span>Edit Canvas Size</span>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                        {collaborators.length === 0 && (
                                            <div className="text-xs text-slate-400 italic text-center py-2">
                                                Noch keine Mitarbeiter hinzugefügt
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
};


const URLImage = forwardRef(({ src, objectFit = 'cover', ...props }: any, ref) => {
    const [image] = useImage(src || 'https://via.placeholder.com/150');
    const groupRef = useRef<any>(null);

    useImperativeHandle(ref, () => groupRef.current);

    const { width, height } = props;

    let imgProps: any = {
        width,
        height,
        x: 0,
        y: 0
    };

    if (image) {
        const imgWidth = image.naturalWidth;
        const imgHeight = image.naturalHeight;
        const containerRatio = width / height;
        const imageRatio = imgWidth / imgHeight;

        if (objectFit === 'cover') {
            if (containerRatio > imageRatio) {
                const newHeight = imgWidth / containerRatio;
                imgProps = {
                    ...imgProps,
                    crop: {
                        x: 0,
                        y: (imgHeight - newHeight) / 2,
                        width: imgWidth,
                        height: newHeight
                    }
                };
            } else {
                const newWidth = imgHeight * containerRatio;
                imgProps = {
                    ...imgProps,
                    crop: {
                        x: (imgWidth - newWidth) / 2,
                        y: 0,
                        width: newWidth,
                        height: imgHeight
                    }
                };
            }
        } else if (objectFit === 'contain') {
            if (containerRatio > imageRatio) {
                const newWidth = height * imageRatio;
                imgProps = {
                    width: newWidth,
                    height: height,
                    x: (width - newWidth) / 2,
                    y: 0
                };
            } else {
                const newHeight = width / imageRatio;
                imgProps = {
                    width: width,
                    height: newHeight,
                    x: 0,
                    y: (height - newHeight) / 2
                };
            }
        }
    }

    return (
        <Group ref={groupRef} {...props}>
            <Rect width={width} height={height} fill="transparent" />
            <KonvaImage image={image} {...imgProps} listening={false} />
        </Group>
    );
});

const CanvasElement = ({ shapeProps, isSelected, onSelect, onChange, onDragMove, onDragEnd }: any) => {
    const shapeRef = useRef<any>(null);
    const trRef = useRef<any>(null);
    const isLayoutLocked = shapeProps.lockedSections?.includes('layout');

    useEffect(() => {
        if (isSelected && trRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const props = {
        ...shapeProps,
        draggable: !isLayoutLocked,
        onClick: onSelect,
        onTap: onSelect,
        onDragMove,
        onDragEnd,
        onTransformEnd: () => {
            const node = shapeRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            node.scaleX(1);
            node.scaleY(1);

            onChange({
                ...shapeProps,
                x: node.x(),
                y: node.y(),
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(5, node.height() * scaleY),
                rotation: node.rotation()
            });
        }
    };

    return (
        <React.Fragment>
            {shapeProps.type === 'rect' && <Rect ref={shapeRef} {...props} />}
            {shapeProps.type === 'circle' && <Circle ref={shapeRef} {...props} />}
            {shapeProps.type === 'text' && (() => {
                const { textAlign, ...textProps } = props;
                return <Text ref={shapeRef} {...textProps} align={textAlign || 'left'} />;
            })()}
            {shapeProps.type === 'image' && <URLImage ref={shapeRef} {...props} />}

            {isSelected && !isLayoutLocked && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    );
};

export default Editor;
