import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatTimeAgo } from '../utils/dateUtils';
import { Plus, LogOut, Edit2, Trash2, Layout, FilePlus, ChevronRight, Brush, Paintbrush } from 'lucide-react';
import Modal from '../components/Modal';
import { PRESETS, type Preset } from '../data/presets';

interface Poster {
    id: string;
    name: string;
    updatedAt: string;
    owner?: {
        id: string;
        email: string;
    };
}

interface User {
    id: string;
    username: string;
}

const Dashboard: React.FC = () => {
    const [posters, setPosters] = useState<Poster[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrentUser();
        fetchPosters();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await api.get('/me');
            setCurrentUser(response.data);
        } catch (err) {
            console.error("Failed to fetch current user", err);
        }
    };

    const fetchPosters = async () => {
        try {
            const response = await api.get('/posters/my');
            setPosters(response.data);
        } catch (err) {
            console.error("Failed to fetch posters", err);
        }
    };

    const handleCreateNew = () => {
        setIsCreateModalOpen(true);
    };

    const createPoster = async (preset?: Preset) => {
        try {
            let contentJson = '[]';
            let title = 'New Poster';

            if (preset) {
                
                const content = {
                    elements: preset.data,
                    canvas: preset.canvas || { width: 800, height: 600, fill: '#ffffff' },
                    ...(preset.styleGuide ? { styleGuide: preset.styleGuide } : {})
                };
                contentJson = JSON.stringify(content);
                title = preset.name === 'Blank Canvas' ? 'New Poster' : `${preset.name}`;
            }

            const response = await api.post('/posters', {
                name: title,
                contentJson
            });
            setIsCreateModalOpen(false);
            navigate(`/editor/${response.data.id}`);
        } catch (err) {
            console.error("Failed to create poster", err);
            alert("Failed to create poster. Please try again.");
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this poster?')) {
            try {
                await api.delete(`/posters/${id}`);
                setPosters(posters.filter(p => p.id !== id));
            } catch (err) {
                console.error("Failed to delete poster", err);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <Paintbrush size={20} />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">PosterDesigner</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-600 px-3 py-2 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                        <LogOut size={16} />
                        Abmelden
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Meine Poster</h2>
                        <p className="text-gray-500 mt-1">Verwalte und bearbeite deine kreativen Werke</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Create New Card */}
                    <button
                        onClick={handleCreateNew}
                        className="group flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-gray-900 font-semibold">Neues Poster erstellen</span>
                        <span className="text-sm text-gray-500 mt-1 px-2">Starte mit einer leeren Projekt oder benutze eine Vorlage</span>
                    </button>

                    {/* Poster Cards */}
                    {posters.map((poster) => (
                        <div
                            key={poster.id}
                            onClick={() => navigate(`/editor/${poster.id}`)}
                            className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col h-64"
                        >
                            {/* Preview Area */}
                            <div className="flex-1 bg-gray-100 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-slate-100">
                                    <Layout size={40} className="opacity-20" />
                                </div>
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-white border-t border-gray-100">
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                            {poster.name || 'Untitled Poster'}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Zuletzt bearbeitet {formatTimeAgo(poster.updatedAt)}
                                        </p>
                                        {currentUser && poster.owner?.id && poster.owner.id !== currentUser.id && (
                                            <span className="inline-block mt-1 bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded font-medium border border-yellow-200">
                                                Geteilt von {poster.owner.email}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/editor/${poster.id}`);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, poster.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Create New Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Neues Projekt"
                size="xl"
            >
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Selbst gestalten</h4>
                        <button
                            onClick={() => createPoster(PRESETS.find(p => p.id === 'blank'))}
                            className="w-full flex items-center p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm transition-all group text-left"
                        >
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                <FilePlus size={24} />
                            </div>
                            <div className="ml-4 flex-1">
                                <h5 className="font-semibold text-slate-900 group-hover:text-blue-700">Leeres Projekt</h5>
                                <p className="text-sm text-slate-500">Starte mit einem leeren Projekt</p>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500" />
                        </button>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Starte mit einer Vorlage</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {PRESETS.filter(p => p.id !== 'blank').map(preset => (
                                <button
                                    key={preset.id}
                                    onClick={() => createPoster(preset)}
                                    className="flex flex-col border border-slate-200 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-md transition-all group text-left h-full"
                                >
                                    
                                    <div className="h-32 bg-slate-100 relative flex items-center justify-center overflow-hidden">

                                    </div>

                                    <div className="p-4 flex-1 flex flex-col">
                                        <h5 className="font-semibold text-slate-900 group-hover:text-blue-700 mb-1">{preset.name}</h5>
                                        <p className="text-xs text-slate-500 line-clamp-2">{preset.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
