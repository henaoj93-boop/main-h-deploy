

import React, { useState, useRef, useEffect } from 'react';
import { DepartmentType, UploadedFile, HeroConfig, PageLayouts, PageWidget, WidgetType, GlobalTheme, Integration, StoreConfig, ProductItem, StoreWorkflow, PageThemes } from '../types';
import { UploadCloud, Image as ImageIcon, Film, Trash2, CheckCircle, FolderOpen, LogOut, Layout, Edit3, Type, Move, MoveVertical, Sliders, Monitor, RotateCcw, Sparkles, Loader2, Palette, MousePointer2, Plus, GripVertical, X, ArrowUp, ArrowDown, Download, Wallpaper, Check, Maximize2, PaintBucket, ImagePlus, Clipboard, ZoomIn, ArrowUpCircle, ArrowDownCircle, Cpu, Calendar, CreditCard, PlayCircle, Slack, ShoppingBag, Settings, RefreshCw, Key, Briefcase, Link, DollarSign, Tag, List, Activity, Save, Sun } from 'lucide-react';
import Hero from './Hero';
import { generateImage } from '../services/geminiService';

interface Props {
  onLogout: () => void;
  files: UploadedFile[];
  onAddFiles: (files: UploadedFile[]) => void;
  onRemoveFile: (id: string) => void;
  heroConfig: HeroConfig;
  onUpdateHeroConfig: (config: HeroConfig) => void;
  pageLayouts: PageLayouts;
  onUpdatePageLayouts: (layouts: PageLayouts) => void;
  globalTheme: GlobalTheme;
  onUpdateGlobalTheme: (theme: GlobalTheme) => void;
  integrations: Integration[];
  onUpdateIntegrations: (integrations: Integration[]) => void;
  storeConfig: StoreConfig;
  onUpdateStoreConfig: (config: StoreConfig) => void;
  products: ProductItem[];
  onUpdateProducts: (products: ProductItem[]) => void;
  workflows: StoreWorkflow[];
  onUpdateWorkflows: (workflows: StoreWorkflow[]) => void;
  pageThemes: PageThemes;
  onUpdatePageThemes: (themes: PageThemes) => void;
}

const AdminDashboard: React.FC<Props> = ({ 
  onLogout, files, onAddFiles, onRemoveFile, 
  heroConfig, onUpdateHeroConfig, 
  pageLayouts, onUpdatePageLayouts, 
  globalTheme, onUpdateGlobalTheme, 
  integrations, onUpdateIntegrations,
  storeConfig, onUpdateStoreConfig,
  products, onUpdateProducts,
  workflows, onUpdateWorkflows,
  pageThemes, onUpdatePageThemes
}) => {
  const [activeTab, setActiveTab] = useState<'MEDIA' | 'HERO' | 'BUILDER' | 'THEME' | 'CONFIG'>('CONFIG');
  const [activeDeptTab, setActiveDeptTab] = useState<DepartmentType>(DepartmentType.CHRISTMAS);
  
  // Config Sub-tabs
  const [configTab, setConfigTab] = useState<'GENERAL' | 'INTEGRATIONS' | 'PRODUCTS' | 'WORKFLOWS'>('GENERAL');

  // Builder State
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [editingIntegrationId, setEditingIntegrationId] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  
  // Product Edit State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [tempProduct, setTempProduct] = useState<ProductItem | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroUploadRef = useRef<HTMLInputElement>(null);
  const themeUploadRef = useRef<HTMLInputElement>(null);
  const pageThemeUploadRef = useRef<HTMLInputElement>(null);

  const departments = [
    { id: DepartmentType.CHRISTMAS, label: 'Christmasland', color: 'bg-red-600' },
    { id: DepartmentType.HARDWARE, label: 'Hardware', color: 'bg-slate-700' },
    { id: DepartmentType.POOL, label: 'Pool Supply', color: 'bg-blue-500' },
    { id: DepartmentType.COMMERCIAL, label: 'Commercial', color: 'bg-orange-600' },
  ];

  // --- PASTE HANDLER ---
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Only handle paste if in MEDIA tab and not typing in an input
      if (activeTab !== 'MEDIA') return;
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.clipboardData && e.clipboardData.files.length > 0) {
        e.preventDefault();
        handleFiles(Array.from(e.clipboardData.files));
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTab, activeDeptTab]); 

  // --- MEDIA HANDLERS ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const widgetType = e.dataTransfer.getData('widgetType') as WidgetType;
    
    // Check if dropping files vs dropping widgets
    if (widgetType) {
       addWidget(widgetType);
    } else if (e.dataTransfer.types.includes('Files')) {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (newFiles: File[]) => {
    const processedFiles: UploadedFile[] = [];

    for (const file of newFiles) {
      if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        alert(`File ${file.name} is too large (>5MB). Please resize before uploading.`);
        continue;
      }

      const reader = new FileReader();
      const result = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      processedFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.startsWith('video') ? 'video' : 'image' as 'video' | 'image',
        url: result,
        dept: activeDeptTab
      });
    }

    if (processedFiles.length > 0) {
      onAddFiles(processedFiles);
    }
  };

  const handleHeroImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      const result = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      const type = file.type.startsWith('video') ? 'video' : 'image';

      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: type,
        url: result,
        dept: activeDeptTab
      };
      onAddFiles([newFile]);
      updateHero('backgroundImage', result);
    }
  };

  const handleThemeImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      const result = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      onUpdateGlobalTheme({ ...globalTheme, backgroundImage: result });
    }
  };

  const handlePageThemeImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      const result = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      const current = pageThemes[activeDeptTab] || { ...globalTheme, backgroundImage: undefined };
      onUpdatePageThemes({
        ...pageThemes,
        [activeDeptTab]: { ...current, backgroundImage: result }
      });
    }
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateImage(activeDeptTab);
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: `AI-Gen-${activeDeptTab}-${Date.now()}.png`,
        type: 'image',
        url: imageUrl,
        dept: activeDeptTab
      };
      onAddFiles([newFile]);
    } catch (error) {
      console.error("Failed to generate image", error);
      alert("Failed to generate image.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const filteredUploads = files.filter(f => f.dept === activeDeptTab);

  // --- HERO EDITOR HANDLERS ---
  const updateHero = (key: keyof HeroConfig, value: any) => {
    onUpdateHeroConfig({ ...heroConfig, [key]: value });
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset Hero to defaults?')) {
      onUpdateHeroConfig({
        title: "Christmasland is Open",
        subtitle: "Visit the 2nd floor for the area's largest holiday display.",
        buttonText: "Shop Christmas",
        backgroundImage: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?q=80&w=2000&auto=format&fit=crop",
        alignment: 'center',
        height: 'medium',
        titleSize: 'normal',
        overlayOpacity: 40,
        fontFamily: 'serif',
        buttonSize: 'medium',
        buttonColor: 'gradient',
        buttonGradientStart: '#dc2626',
        buttonGradientEnd: '#15803d',
        backgroundImagePosition: 'center',
        backgroundImageScale: 100,
        isSeasonal: true
      });
    }
  };

  // --- PAGE BUILDER HANDLERS ---
  const currentLayout = pageLayouts[activeDeptTab] || [];
  const currentPageTheme = pageThemes[activeDeptTab] || { backgroundColor: '#f8fafc', accentColor: globalTheme.accentColor, glassOpacity: 0 };

  const addWidget = (type: WidgetType) => {
    const newWidget: PageWidget = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: {
        title: 'New Section Title',
        text: 'Click to edit this text content.',
        subtitle: 'Subtitle goes here',
        image: 'https://picsum.photos/600/400',
        videoUrl: ''
      },
      style: {
        padding: 'medium',
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        fontFamily: 'sans',
        fontSize: 'base',
        alignment: 'left',
        width: 'full'
      }
    };
    
    const updatedLayout = [...currentLayout, newWidget];
    onUpdatePageLayouts({
      ...pageLayouts,
      [activeDeptTab]: updatedLayout
    });
    setSelectedWidgetId(newWidget.id);
  };

  const removeWidget = (id: string) => {
    const updatedLayout = currentLayout.filter(w => w.id !== id);
    onUpdatePageLayouts({ ...pageLayouts, [activeDeptTab]: updatedLayout });
    setSelectedWidgetId(null);
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === currentLayout.length - 1)) return;
    
    const newLayout = [...currentLayout];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newLayout[index], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[index]];
    
    onUpdatePageLayouts({ ...pageLayouts, [activeDeptTab]: newLayout });
  };

  const updateWidget = (id: string, updates: Partial<PageWidget>) => {
    const updatedLayout = currentLayout.map(w => {
      if (w.id === id) {
        return {
          ...w,
          ...updates,
          content: { ...w.content, ...(updates.content || {}) },
          style: { ...w.style, ...(updates.style || {}) }
        };
      }
      return w;
    });
    onUpdatePageLayouts({ ...pageLayouts, [activeDeptTab]: updatedLayout });
  };

  const updatePageTheme = (updates: Partial<GlobalTheme>) => {
    const current = pageThemes[activeDeptTab] || { backgroundColor: '#ffffff', accentColor: globalTheme.accentColor, glassOpacity: 0 };
    onUpdatePageThemes({
      ...pageThemes,
      [activeDeptTab]: { ...current, ...updates }
    });
  };

  const handleExportLayout = () => {
    const layout = pageLayouts[activeDeptTab] || [];
    const jsonString = JSON.stringify(layout, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `layout_${activeDeptTab}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedWidget = currentLayout.find(w => w.id === selectedWidgetId);

  // Widget Drag Start
  const handleWidgetDragStart = (e: React.DragEvent, type: WidgetType) => {
    e.dataTransfer.setData('widgetType', type);
  };

  // --- INTEGRATION HANDLERS ---
  const toggleIntegration = (id: string) => {
    const updated = integrations.map(i => {
      if (i.id === id) {
        return { ...i, connected: !i.connected, lastSync: !i.connected ? new Date().toLocaleString() : undefined };
      }
      return i;
    });
    onUpdateIntegrations(updated);
  };

  const saveIntegrationConfig = (id: string) => {
    const updated = integrations.map(i => {
      if (i.id === id) {
        return { ...i, apiKey: apiKeyInput };
      }
      return i;
    });
    onUpdateIntegrations(updated);
    setEditingIntegrationId(null);
    setApiKeyInput('');
  };

  // --- PRODUCT HANDLERS ---
  const handleEditProduct = (p: ProductItem) => {
    setEditingProductId(p.id);
    setTempProduct({ ...p });
  };

  const handleSaveProduct = () => {
    if (!tempProduct) return;
    const updated = products.map(p => p.id === tempProduct.id ? tempProduct : p);
    onUpdateProducts(updated);
    setEditingProductId(null);
    setTempProduct(null);
  };

  const handleAddProduct = () => {
    const newProduct: ProductItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Item',
      price: '$0.00',
      category: 'General',
      url: '#',
      image: 'https://picsum.photos/200/200',
      featured: false,
      inStock: true
    };
    onUpdateProducts([...products, newProduct]);
    handleEditProduct(newProduct);
  };

  const handleDeleteProduct = (id: string) => {
    if(window.confirm("Delete this product?")) {
      onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  // --- WORKFLOW HANDLERS ---
  const handleAddWorkflow = () => {
    const newWorkflow: StoreWorkflow = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Process',
      description: 'Describe the procedure...',
      steps: ['Step 1'],
      status: 'draft'
    };
    onUpdateWorkflows([...workflows, newWorkflow]);
  };

  const renderIntegrationIcon = (provider: string) => {
    switch(provider) {
      case 'google': return <Calendar size={28} className="text-red-500" />;
      case 'quickbooks': return <CreditCard size={28} className="text-green-600" />;
      case 'motion': return <PlayCircle size={28} className="text-purple-500" />;
      case 'slack': return <Slack size={28} className="text-pink-500" />;
      case 'shopify': return <ShoppingBag size={28} className="text-emerald-500" />;
      default: return <Cpu size={28} className="text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Admin Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row gap-4 justify-between items-center rounded-t-[40px] lg:rounded-t-none shadow-sm z-20">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar w-full md:w-auto">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 whitespace-nowrap">Admin Dashboard</h2>
            <p className="text-sm text-slate-500 whitespace-nowrap">Manage store content.</p>
          </div>
          
          <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg flex-shrink-0">
            <button 
              onClick={() => setActiveTab('CONFIG')}
              className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'CONFIG' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Cpu size={16} />
              <span className="hidden sm:inline">Configuration</span>
            </button>
            <button 
              onClick={() => setActiveTab('THEME')}
              className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'THEME' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <PaintBucket size={16} />
              <span className="hidden sm:inline">Theme</span>
            </button>
             <button 
              onClick={() => setActiveTab('BUILDER')}
              className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'BUILDER' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Layout size={16} />
              <span className="hidden sm:inline">Pages</span>
            </button>
            <button 
              onClick={() => setActiveTab('HERO')}
              className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'HERO' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Edit3 size={16} />
              <span className="hidden sm:inline">Hero</span>
            </button>
            <button 
              onClick={() => setActiveTab('MEDIA')}
              className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'MEDIA' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FolderOpen size={16} />
              <span className="hidden sm:inline">Media</span>
            </button>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* === CONFIGURATION TAB === */}
        {activeTab === 'CONFIG' && (
           <div className="flex w-full h-full overflow-hidden">
             {/* Config Sidebar */}
             <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto">
                <div className="p-6">
                   <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">System Settings</h3>
                   <nav className="space-y-1">
                      <button 
                         onClick={() => setConfigTab('GENERAL')}
                         className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors ${configTab === 'GENERAL' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                         <Settings size={18} /> General Info
                      </button>
                      <button 
                         onClick={() => setConfigTab('INTEGRATIONS')}
                         className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors ${configTab === 'INTEGRATIONS' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                         <Cpu size={18} /> App Integrations
                      </button>
                      <button 
                         onClick={() => setConfigTab('PRODUCTS')}
                         className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors ${configTab === 'PRODUCTS' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                         <Tag size={18} /> Products & Links
                      </button>
                      <button 
                         onClick={() => setConfigTab('WORKFLOWS')}
                         className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors ${configTab === 'WORKFLOWS' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                         <List size={18} /> Workflows
                      </button>
                   </nav>
                </div>
             </div>

             {/* Config Content Area */}
             <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
                {/* GENERAL INFO SECTION */}
                {configTab === 'GENERAL' && (
                  <div className="max-w-3xl mx-auto space-y-6">
                     <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-900">Store Information</h2>
                        <button className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg font-bold hover:bg-green-100 transition-colors">
                           <Save size={16} /> Auto-Saved
                        </button>
                     </div>
                     <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Store Email</label>
                              <input 
                                 type="email" 
                                 value={storeConfig.email} 
                                 onChange={(e) => onUpdateStoreConfig({...storeConfig, email: e.target.value})}
                                 className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                              <input 
                                 type="text" 
                                 value={storeConfig.phone} 
                                 onChange={(e) => onUpdateStoreConfig({...storeConfig, phone: e.target.value})}
                                 className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                              />
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Physical Address</label>
                           <textarea 
                              rows={3}
                              value={storeConfig.address} 
                              onChange={(e) => onUpdateStoreConfig({...storeConfig, address: e.target.value})}
                              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Operating Hours</label>
                           <textarea 
                              rows={3}
                              value={storeConfig.hours} 
                              onChange={(e) => onUpdateStoreConfig({...storeConfig, hours: e.target.value})}
                              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Facebook Page URL</label>
                           <input 
                              type="text" 
                              value={storeConfig.facebookUrl} 
                              onChange={(e) => onUpdateStoreConfig({...storeConfig, facebookUrl: e.target.value})}
                              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-blue-600 font-medium" 
                           />
                        </div>
                     </div>
                  </div>
                )}

                {/* INTEGRATIONS SECTION */}
                {configTab === 'INTEGRATIONS' && (
                  <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">App Integrations</h2>
                      <p className="text-slate-500">Connect external services like QuickBooks, Slack, and Google Calendar.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {integrations.map((integration) => (
                          <div key={integration.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow relative">
                            {integration.connected && (
                                <div className="absolute top-4 right-4 text-green-500">
                                  <CheckCircle size={20} fill="currentColor" className="text-white" />
                                </div>
                            )}
                            <div className="p-6">
                                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-4 border border-slate-100">
                                  {renderIntegrationIcon(integration.provider)}
                                </div>
                                <h3 className="font-bold text-lg text-slate-900">{integration.name}</h3>
                                <p className="text-sm text-slate-500 mt-2 mb-6 h-10">{integration.description}</p>
                                
                                <div className="flex items-center justify-between mt-auto">
                                  {integration.connected ? (
                                      <div className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center">
                                        <RefreshCw size={12} className="mr-1" />
                                        Sync Active
                                      </div>
                                  ) : (
                                      <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                                        Disconnected
                                      </div>
                                  )}
                                  
                                  <div className="flex gap-2">
                                      {editingIntegrationId === integration.id ? (
                                        <div className="absolute inset-0 bg-white z-20 p-4 flex flex-col justify-center animate-fade-in">
                                            <h4 className="font-bold text-sm mb-2">Configure {integration.name}</h4>
                                            <input 
                                              type="text" 
                                              value={apiKeyInput}
                                              onChange={(e) => setApiKeyInput(e.target.value)}
                                              placeholder="Enter API Key / Client ID"
                                              className="w-full border p-2 rounded text-xs mb-2"
                                            />
                                            <div className="flex gap-2">
                                              <button onClick={() => saveIntegrationConfig(integration.id)} className="flex-1 bg-slate-900 text-white text-xs font-bold py-2 rounded">Save</button>
                                              <button onClick={() => setEditingIntegrationId(null)} className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-2 rounded">Cancel</button>
                                            </div>
                                        </div>
                                      ) : (
                                        <>
                                            <button 
                                              onClick={() => {
                                                setEditingIntegrationId(integration.id);
                                                setApiKeyInput(integration.apiKey || '');
                                              }}
                                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                              title="Settings"
                                            >
                                              <Settings size={18} />
                                            </button>
                                            <button 
                                              onClick={() => toggleIntegration(integration.id)}
                                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                                integration.connected 
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                                : 'bg-slate-900 text-white hover:bg-slate-800'
                                              }`}
                                            >
                                              {integration.connected ? 'Disconnect' : 'Connect'}
                                            </button>
                                        </>
                                      )}
                                  </div>
                                </div>
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PRODUCTS & LINKS SECTION */}
                {configTab === 'PRODUCTS' && (
                   <div className="max-w-5xl mx-auto">
                      <div className="flex justify-between items-center mb-8">
                         <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-1">Products & Web Links</h2>
                            <p className="text-slate-500 text-sm">Manage items displayed on the homepage and their links.</p>
                         </div>
                         <button onClick={handleAddProduct} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors">
                            <Plus size={18} /> Add Item
                         </button>
                      </div>

                      <div className="space-y-4">
                         {products.map(p => (
                            <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                               {editingProductId === p.id && tempProduct ? (
                                  // EDIT MODE
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <input type="text" placeholder="Name" className="border p-2 rounded text-sm" value={tempProduct.name} onChange={e => setTempProduct({...tempProduct, name: e.target.value})} />
                                     <input type="text" placeholder="Price" className="border p-2 rounded text-sm" value={tempProduct.price} onChange={e => setTempProduct({...tempProduct, price: e.target.value})} />
                                     <input type="text" placeholder="URL" className="border p-2 rounded text-sm" value={tempProduct.url} onChange={e => setTempProduct({...tempProduct, url: e.target.value})} />
                                     <input type="text" placeholder="Image URL" className="border p-2 rounded text-sm" value={tempProduct.image} onChange={e => setTempProduct({...tempProduct, image: e.target.value})} />
                                     <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                                        <button onClick={() => setEditingProductId(null)} className="px-3 py-1 text-sm bg-slate-100 rounded hover:bg-slate-200">Cancel</button>
                                        <button onClick={handleSaveProduct} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-bold">Save Changes</button>
                                     </div>
                                  </div>
                               ) : (
                                  // VIEW MODE
                                  <>
                                     <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                        <img src={p.image} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="flex-1">
                                        <h4 className="font-bold text-slate-900">{p.name}</h4>
                                        <p className="text-xs text-slate-500">{p.category} • {p.price}</p>
                                        <a href={p.url} className="text-xs text-blue-500 hover:underline truncate block max-w-xs">{p.url}</a>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <div className={`px-2 py-1 rounded text-[10px] font-bold ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                           {p.inStock ? 'In Stock' : 'OOS'}
                                        </div>
                                        <button onClick={() => handleEditProduct(p)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><Edit3 size={16} /></button>
                                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 hover:bg-red-50 rounded-full text-red-500"><Trash2 size={16} /></button>
                                     </div>
                                  </>
                               )}
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {/* WORKFLOWS SECTION */}
                {configTab === 'WORKFLOWS' && (
                   <div className="max-w-4xl mx-auto">
                      <div className="flex justify-between items-center mb-8">
                         <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-1">Workflows & Processes</h2>
                            <p className="text-slate-500 text-sm">Define internal procedures for staff.</p>
                         </div>
                         <button onClick={handleAddWorkflow} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors">
                            <Plus size={18} /> New Workflow
                         </button>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                         {workflows.map(wf => (
                            <div key={wf.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                               <div className="flex justify-between items-start mb-4">
                                  <div>
                                     <h3 className="font-bold text-lg text-slate-900">{wf.title}</h3>
                                     <p className="text-slate-500 text-sm">{wf.description}</p>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${wf.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                     {wf.status}
                                  </span>
                               </div>
                               <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                                  {wf.steps.map((step, idx) => (
                                     <div key={idx} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-500">
                                           {idx + 1}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{step}</span>
                                     </div>
                                  ))}
                                  <button className="text-xs text-blue-500 font-bold mt-2 ml-9 hover:underline">+ Add Step (Placeholder)</button>
                               </div>
                               <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                                  <button className="text-xs text-slate-500 font-bold hover:text-slate-800">Edit</button>
                                  <button className="text-xs text-red-500 font-bold hover:text-red-700 ml-4">Delete</button>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
             </div>
           </div>
        )}

        {/* === THEME CUSTOMIZER TAB === */}
        {activeTab === 'THEME' && (
           <div className="flex flex-1 w-full overflow-hidden">
             <div className="w-96 bg-white border-r border-slate-200 flex flex-col h-full p-6 space-y-8 overflow-y-auto">
               <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Site Skin & Theme</h3>
                  <p className="text-sm text-slate-500">Customize the global look of your website.</p>
               </div>
               
               {/* Background Settings */}
               <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">Global Wallpaper</p>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Background Image</label>
                    <div className="flex gap-2">
                       <div className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors" onClick={() => themeUploadRef.current?.click()}>
                          {globalTheme.backgroundImage ? (
                             <img src={globalTheme.backgroundImage} className="h-20 w-full object-cover rounded" />
                          ) : (
                             <div className="py-4 text-slate-400 flex flex-col items-center">
                               <Wallpaper size={24} className="mb-2" />
                               <span className="text-xs">Upload Wallpaper</span>
                             </div>
                          )}
                       </div>
                       <input type="file" ref={themeUploadRef} className="hidden" accept="image/*" onChange={handleThemeImageSelect} />
                       
                       {globalTheme.backgroundImage && (
                          <button onClick={() => onUpdateGlobalTheme({...globalTheme, backgroundImage: undefined})} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                             <Trash2 size={20} />
                          </button>
                       )}
                    </div>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Fallback Color</label>
                     <div className="flex items-center gap-2 mb-2">
                        <input 
                           type="color" 
                           value={globalTheme.backgroundColor} 
                           onChange={(e) => onUpdateGlobalTheme({...globalTheme, backgroundColor: e.target.value})} 
                           className="w-12 h-12 rounded-lg cursor-pointer border-none"
                        />
                        <span className="text-sm text-slate-600 font-mono">{globalTheme.backgroundColor}</span>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {['#e2e8f0', '#ffffff', '#f8fafc', '#94a3b8', '#475569', '#0f172a', '#000000', '#fee2e2', '#ffedd5', '#dbeafe', '#dcfce7'].map((color) => (
                           <button
                              key={color}
                              onClick={() => onUpdateGlobalTheme({...globalTheme, backgroundColor: color})}
                              className={`w-6 h-6 rounded-full border border-slate-300 shadow-sm transition-transform hover:scale-110 ${globalTheme.backgroundColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                              style={{ backgroundColor: color }}
                              title={color}
                           />
                        ))}
                     </div>
                  </div>
               </div>

               {/* Pointer / Cursor Customization */}
               <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">Interface Customization</p>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Mouse Pointer</label>
                    <div className="grid grid-cols-3 gap-2">
                       {[
                         { id: 'default', icon: MousePointer2, label: 'Default' },
                         { id: 'crosshair', icon: Maximize2, label: 'Crosshair' },
                         { id: 'text', icon: Type, label: 'Text' },
                         { id: 'move', icon: Move, label: 'Move' },
                       ].map((c) => (
                          <button
                            key={c.id}
                            onClick={() => onUpdateGlobalTheme({ ...globalTheme, cursor: c.id as any })}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${globalTheme.cursor === c.id ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                          >
                             <c.icon size={18} className="mb-1" />
                             <span className="text-xs font-medium">{c.label}</span>
                          </button>
                       ))}
                    </div>
                  </div>
               </div>

               {/* Glass UI Settings */}
               <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">Glass Interface</p>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                        <span>Panel Opacity</span>
                        <span>{globalTheme.glassOpacity}%</span>
                     </label>
                     <input 
                       type="range" 
                       min="0" 
                       max="100" 
                       value={globalTheme.glassOpacity} 
                       onChange={(e) => onUpdateGlobalTheme({...globalTheme, glassOpacity: parseInt(e.target.value)})} 
                       className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                     />
                     <p className="text-xs text-slate-400 mt-2">Adjusts the transparency of the main content dashboard.</p>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-100">
                  <button 
                     onClick={() => onUpdateGlobalTheme({ backgroundColor: '#e2e8f0', accentColor: '#f97316', glassOpacity: 40, backgroundImage: undefined, cursor: 'default' })}
                     className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors flex items-center justify-center"
                  >
                     <RotateCcw size={16} className="mr-2" /> Restore Default Theme
                  </button>
               </div>
             </div>

             {/* Live Preview Area (Simplified) */}
             <div className="flex-1 bg-slate-100 p-8 flex items-center justify-center relative overflow-hidden" 
                  style={{
                    backgroundColor: globalTheme.backgroundColor,
                    backgroundImage: globalTheme.backgroundImage ? `url(${globalTheme.backgroundImage})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: globalTheme.cursor === 'default' ? 'auto' : globalTheme.cursor
                  }}
             >
                <div 
                  className="w-full max-w-2xl h-96 rounded-3xl shadow-2xl p-8 flex flex-col gap-4 relative backdrop-blur-xl border border-white/40"
                  style={{ backgroundColor: `rgba(255, 255, 255, ${globalTheme.glassOpacity / 100})` }}
                >
                   <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-3xl" />
                   <h2 className="text-3xl font-bold text-slate-800 relative z-10">Live Preview</h2>
                   <p className="text-slate-600 relative z-10">This is how your main dashboard will look with the current theme settings.</p>
                   <div className="flex gap-4 mt-4 relative z-10">
                      <div className="w-1/2 h-32 bg-white/50 rounded-xl shadow-sm border border-white/50"></div>
                      <div className="w-1/2 h-32 bg-white/50 rounded-xl shadow-sm border border-white/50"></div>
                   </div>
                </div>
             </div>
           </div>
        )}

        {/* === MEDIA MANAGER TAB === */}
        {activeTab === 'MEDIA' && (
          <>
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col p-4 gap-2">
              <p className="text-xs font-bold text-slate-400 uppercase px-2 mb-2">Select Department</p>
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setActiveDeptTab(dept.id)}
                  className={`text-left px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-all ${
                    activeDeptTab === dept.id 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${dept.color} ring-2 ring-white`}></div>
                  {dept.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              <div 
                className={`border-4 border-dashed rounded-3xl p-12 text-center transition-all duration-300 relative group ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50 scale-[1.01]' 
                    : 'border-slate-300 bg-white hover:border-slate-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none rounded-3xl" />
                 
                 <div className="w-24 h-24 bg-white shadow-lg rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 group-hover:scale-110 transition-transform relative z-10">
                  {isDragging ? <Download size={48} className="text-blue-500 animate-bounce" /> : <Wallpaper size={40} />}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2 relative z-10">Drop or Paste Media Here</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto relative z-10">
                  Drag and drop files, or <strong>Paste (Ctrl+V)</strong> images directly from your clipboard.
                  <br/>
                  <span className="text-xs text-slate-400 mt-2 block font-medium">Supported: JPG, PNG, WEBP, MP4 (Max 5MB)</span>
                </p>

                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
                
                <div className="flex justify-center gap-3 relative z-10">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                  >
                    <FolderOpen size={18} className="mr-2" />
                    Browse Files
                  </button>
                  <button 
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isGeneratingImage ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Sparkles size={18} className="mr-2" />}
                    Generate AI Theme
                  </button>
                </div>
              </div>

               <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  Uploaded Assets for {departments.find(d => d.id === activeDeptTab)?.label} <span className="ml-2 bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{filteredUploads.length}</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {filteredUploads.map((file) => {
                      const isHeroBackground = heroConfig.backgroundImage === file.url;
                      return (
                      <div key={file.id} className={`group relative bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${isHeroBackground ? 'border-blue-500 ring-2 ring-blue-500' : 'border-slate-200'}`}>
                        {isHeroBackground && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10 flex items-center">
                            <Check size={10} className="mr-1" /> Active Hero
                          </div>
                        )}
                        <div className="aspect-square bg-slate-100 relative">
                          {file.type === 'video' ? (
                            <video src={file.url} className="w-full h-full object-cover" />
                          ) : (
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                          )}
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             {!isHeroBackground && (
                              <button onClick={() => updateHero('backgroundImage', file.url)} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors" title="Set as Hero Background">
                                <Layout size={16} />
                              </button>
                             )}
                            <button onClick={() => onRemoveFile(file.id)} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="p-2 text-xs text-slate-500 truncate font-medium bg-slate-50 border-t border-slate-100">
                           {file.name}
                        </div>
                      </div>
                    )})}
                    {filteredUploads.length === 0 && (
                      <div className="col-span-2 md:col-span-4 py-8 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                        No assets uploaded for this department yet. Drag & Drop or Paste images here.
                      </div>
                    )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* === HERO TAB === */}
        {activeTab === 'HERO' && (
           <div className="flex flex-1 w-full overflow-hidden">
              <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto custom-scrollbar p-6 space-y-8">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <Edit3 size={18} className="mr-2 text-orange-500" /> Hero Config
                  </h3>
                  
                  {/* Seasonal Toggle */}
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                     <div className="flex items-start justify-between">
                       <div>
                         <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Sun size={14} className="text-orange-500" /> Dynamic Seasonal Mode</h4>
                         <p className="text-xs text-slate-500 mt-1">Automatically updates content based on time of year.</p>
                       </div>
                       <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                          <input 
                            type="checkbox" 
                            name="toggle" 
                            id="toggle" 
                            checked={!!heroConfig.isSeasonal}
                            onChange={(e) => updateHero('isSeasonal', e.target.checked)}
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-orange-200 checked:right-0 right-4 checked:border-orange-500"
                          />
                          <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-orange-200 cursor-pointer checked:bg-orange-500"></label>
                       </div>
                     </div>
                     {heroConfig.isSeasonal && (
                       <div className="mt-3 text-xs bg-white p-2 rounded border border-orange-100 text-orange-800 font-medium">
                          Active: The content below will be overridden by the seasonal preset.
                       </div>
                     )}
                  </div>

                  {/* Hero Background Media */}
                  <div className={`space-y-4 transition-opacity ${heroConfig.isSeasonal ? 'opacity-50 pointer-events-none' : ''}`}>
                     <p className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">Background Media</p>
                     <div 
                        onClick={() => heroUploadRef.current?.click()}
                        className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group flex flex-col items-center justify-center"
                     >
                        {heroConfig.backgroundImage ? (
                           <>
                              {(heroConfig.backgroundImage.startsWith('data:video') || heroConfig.backgroundImage.match(/\.(mp4|webm)$/i)) ? (
                                <video src={heroConfig.backgroundImage} className="w-full h-full object-cover" muted autoPlay loop />
                              ) : (
                                <img src={heroConfig.backgroundImage} alt="Hero" className="w-full h-full object-cover" />
                              )}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <div className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-xs flex items-center shadow-lg">
                                    <UploadCloud size={14} className="mr-2" /> Change Media
                                 </div>
                              </div>
                           </>
                        ) : (
                           <div className="text-slate-400 flex flex-col items-center">
                              <ImagePlus size={32} className="mb-2" />
                              <span className="text-xs font-bold">Upload Image or Video</span>
                           </div>
                        )}
                     </div>
                     <input 
                        type="file" 
                        ref={heroUploadRef} 
                        onChange={handleHeroImageSelect} 
                        className="hidden" 
                        accept="image/*,video/*" 
                     />
                  </div>

                  {/* Content Controls */}
                  <div className={`space-y-4 transition-opacity ${heroConfig.isSeasonal ? 'opacity-50 pointer-events-none' : ''}`}>
                     <p className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">Content</p>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Headline</label>
                          <input type="text" value={heroConfig.title} onChange={(e) => updateHero('title', e.target.value)} className="w-full border p-2 rounded text-sm" />
                      </div>
                       <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Subtitle</label>
                          <textarea rows={3} value={heroConfig.subtitle} onChange={(e) => updateHero('subtitle', e.target.value)} className="w-full border p-2 rounded text-sm" />
                      </div>
                  </div>

                  {/* Call to Action Button */}
                  <div className={`space-y-4 transition-opacity ${heroConfig.isSeasonal ? 'opacity-50 pointer-events-none' : ''}`}>
                     <p className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">Call to Action Button</p>
                     <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Button Label</label>
                          <input type="text" value={heroConfig.buttonText} onChange={(e) => updateHero('buttonText', e.target.value)} className="w-full border p-2 rounded text-sm" />
                      </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Button Size</label>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                             {['small', 'medium', 'large'].map(s => (
                               <button
                                 key={s}
                                 onClick={() => updateHero('buttonSize', s)}
                                 className={`flex-1 text-xs py-1.5 capitalize rounded-md transition-all ${heroConfig.buttonSize === s ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500'}`}
                               >
                                 {s}
                               </button>
                             ))}
                         </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">Button Color</label>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {[
                              { value: 'gradient', bg: 'bg-gradient-to-r from-red-600 to-green-700', label: 'Gradient' },
                              { value: 'red', bg: 'bg-red-600', label: 'Red' },
                              { value: 'blue', bg: 'bg-blue-600', label: 'Blue' },
                              { value: 'green', bg: 'bg-green-600', label: 'Green' },
                              { value: 'orange', bg: 'bg-orange-600', label: 'Orange' },
                              { value: 'slate', bg: 'bg-slate-700', label: 'Slate' }
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => updateHero('buttonColor', opt.value)}
                                className={`w-8 h-8 rounded-full shadow-sm transition-transform hover:scale-110 flex items-center justify-center ${heroConfig.buttonColor === opt.value ? 'ring-2 ring-slate-900 ring-offset-2' : ''} ${opt.bg}`}
                                title={opt.label}
                              >
                                {heroConfig.buttonColor === opt.value && <CheckCircle size={14} className="text-white" />}
                              </button>
                            ))}
                        </div>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button onClick={handleResetDefaults} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-xl transition-colors flex items-center justify-center">
                      <RotateCcw size={14} className="mr-2" /> Reset to Defaults
                    </button>
                  </div>
              </div>
              
              {/* Preview Area */}
              <div className="flex-1 bg-slate-100 p-8 flex items-center justify-center overflow-y-auto">
                 <div className="w-full max-w-4xl transform scale-90 shadow-2xl rounded-[32px]">
                   <Hero 
                     onNavigate={() => {}} 
                     config={heroConfig.isSeasonal ? { ...heroConfig, ...{} } : heroConfig} 
                   />
                 </div>
              </div>
           </div>
        )}

        {/* === PAGE BUILDER TAB === */}
        {activeTab === 'BUILDER' && (
          <div className="flex flex-1 w-full overflow-hidden">
            
            {/* 1. Sidebar: Widgets & Properties */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto custom-scrollbar">
              
              {/* Page Selector */}
              <div className="p-4 border-b border-slate-100 space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase block">Editing Page</label>
                <div className="relative">
                  <select 
                    value={activeDeptTab}
                    onChange={(e) => {
                      setActiveDeptTab(e.target.value as DepartmentType);
                      setSelectedWidgetId(null);
                    }}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl py-3 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {departments.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>
                
                <button 
                  onClick={handleExportLayout}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  title="Export current layout as JSON"
                >
                  <Download size={14} /> Export Layout
                </button>
              </div>

              {/* Page Theme Settings */}
              {!selectedWidget && (
                <div className="p-4 border-b border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Individual Page Theme</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Page Background</label>
                    <div className="flex gap-2">
                      <div className="flex-1 border-2 border-dashed border-slate-200 rounded p-2 text-center cursor-pointer hover:bg-slate-50" onClick={() => pageThemeUploadRef.current?.click()}>
                        {currentPageTheme.backgroundImage ? (
                          <img src={currentPageTheme.backgroundImage} className="h-10 w-full object-cover rounded" />
                        ) : (
                          <span className="text-[10px] text-slate-400">Set Image</span>
                        )}
                      </div>
                      <input type="color" value={currentPageTheme.backgroundColor} onChange={(e) => updatePageTheme({ backgroundColor: e.target.value })} className="h-full w-10 rounded cursor-pointer border-none" />
                      <input type="file" ref={pageThemeUploadRef} className="hidden" accept="image/*" onChange={handlePageThemeImageSelect} />
                    </div>
                  </div>
                </div>
              )}

              {!selectedWidget ? (
                // WIDGET LIBRARY MODE
                <div className="p-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Drag Widgets</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { type: 'HERO', label: 'Hero', icon: Layout },
                      { type: 'TEXT_BLOCK', label: 'Text Block', icon: Type },
                      { type: 'IMAGE_FULL', label: 'Image', icon: ImageIcon },
                      { type: 'SPLIT_CONTENT', label: 'Split', icon: Sliders },
                      { type: 'VIDEO_EMBED', label: 'Video', icon: Film },
                      { type: 'SPACER', label: 'Spacer', icon: MoveVertical },
                    ].map((w) => (
                      <div
                        key={w.type}
                        draggable
                        onDragStart={(e) => handleWidgetDragStart(e, w.type as WidgetType)}
                        className="bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-grab transition-all"
                      >
                        <w.icon size={24} />
                        <span className="text-xs font-bold">{w.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-4 text-center">Drag items to the canvas on the right.</p>
                </div>
              ) : (
                // PROPERTY EDITOR MODE
                <div className="p-4 space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                     <h4 className="text-sm font-bold text-slate-800 flex items-center">
                       <Edit3 size={14} className="mr-2 text-blue-500" /> Edit {selectedWidget.type}
                     </h4>
                     <button onClick={() => setSelectedWidgetId(null)} className="text-xs text-blue-500 hover:underline">Close</button>
                  </div>
                  
                  {/* Content Fields */}
                  <div className="space-y-3">
                     <label className="text-xs font-bold text-slate-400 uppercase block">Content</label>
                     
                     {selectedWidget.type !== 'SPACER' && (
                       <div>
                         <span className="text-xs font-bold text-slate-700 block mb-1">Title / Headline</span>
                         <input 
                            type="text" 
                            value={selectedWidget.content.title || ''} 
                            onChange={(e) => updateWidget(selectedWidget.id, { content: { ...selectedWidget.content, title: e.target.value } })}
                            className="w-full border p-2 rounded text-sm"
                          />
                       </div>
                     )}

                     {(selectedWidget.type === 'HERO' || selectedWidget.type === 'TEXT_BLOCK' || selectedWidget.type === 'SPLIT_CONTENT') && (
                        <div>
                          <span className="text-xs font-bold text-slate-700 block mb-1">Main Text / Subtitle</span>
                          <textarea 
                              rows={3}
                              value={selectedWidget.content.text || selectedWidget.content.subtitle || ''} 
                              onChange={(e) => updateWidget(selectedWidget.id, { content: { ...selectedWidget.content, text: e.target.value, subtitle: e.target.value } })}
                              className="w-full border p-2 rounded text-sm"
                            />
                        </div>
                     )}

                     {(selectedWidget.type === 'IMAGE_FULL' || selectedWidget.type === 'SPLIT_CONTENT') && (
                       <div>
                          <span className="text-xs font-bold text-slate-700 block mb-1">Image URL</span>
                          <input 
                            type="text" 
                            value={selectedWidget.content.image || ''} 
                            onChange={(e) => updateWidget(selectedWidget.id, { content: { ...selectedWidget.content, image: e.target.value } })}
                            className="w-full border p-2 rounded text-sm mb-1"
                          />
                          <button 
                             onClick={() => {
                               const url = prompt("Enter image URL");
                               if(url) updateWidget(selectedWidget.id, { content: { ...selectedWidget.content, image: url } });
                             }}
                             className="text-xs text-blue-500 font-bold"
                          >
                             Set from URL
                          </button>
                       </div>
                     )}

                     {selectedWidget.type === 'VIDEO_EMBED' && (
                       <div>
                          <span className="text-xs font-bold text-slate-700 block mb-1">Video Source URL</span>
                          <input 
                            type="text" 
                            value={selectedWidget.content.videoUrl || ''} 
                            onChange={(e) => updateWidget(selectedWidget.id, { content: { ...selectedWidget.content, videoUrl: e.target.value } })}
                            className="w-full border p-2 rounded text-sm"
                            placeholder="https://..."
                          />
                       </div>
                     )}
                  </div>

                  {/* Style Fields */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-400 uppercase block">Style</label>
                    
                    <div className="grid grid-cols-2 gap-2">
                       <div>
                          <span className="text-xs font-bold text-slate-700 block mb-1">Bg Color</span>
                          <input 
                             type="color" 
                             value={selectedWidget.style.backgroundColor || '#ffffff'}
                             onChange={(e) => updateWidget(selectedWidget.id, { style: { ...selectedWidget.style, backgroundColor: e.target.value } })}
                             className="w-full h-8 rounded cursor-pointer"
                          />
                       </div>
                       <div>
                          <span className="text-xs font-bold text-slate-700 block mb-1">Text Color</span>
                          <input 
                             type="color" 
                             value={selectedWidget.style.textColor || '#000000'}
                             onChange={(e) => updateWidget(selectedWidget.id, { style: { ...selectedWidget.style, textColor: e.target.value } })}
                             className="w-full h-8 rounded cursor-pointer"
                          />
                       </div>
                    </div>

                    <div>
                        <span className="text-xs font-bold text-slate-700 block mb-1">Padding</span>
                        <div className="flex bg-slate-100 rounded p-1">
                          {['none', 'small', 'medium', 'large'].map(s => (
                             <button 
                                key={s} 
                                onClick={() => updateWidget(selectedWidget.id, { style: { ...selectedWidget.style, padding: s as any } })}
                                className={`flex-1 text-[10px] uppercase font-bold py-1 rounded ${selectedWidget.style.padding === s ? 'bg-white shadow text-black' : 'text-slate-500'}`}
                             >
                               {s[0]}
                             </button>
                          ))}
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-bold text-slate-700 block mb-1">Text Align</span>
                        <div className="flex bg-slate-100 rounded p-1">
                          {['left', 'center', 'right'].map(s => (
                             <button 
                                key={s} 
                                onClick={() => updateWidget(selectedWidget.id, { style: { ...selectedWidget.style, alignment: s as any } })}
                                className={`flex-1 text-[10px] uppercase font-bold py-1 rounded ${selectedWidget.style.alignment === s ? 'bg-white shadow text-black' : 'text-slate-500'}`}
                             >
                               {s}
                             </button>
                          ))}
                        </div>
                    </div>
                    
                    {selectedWidget.type === 'SPLIT_CONTENT' && (
                       <div className="flex items-center mt-2">
                          <input 
                            type="checkbox" 
                            id="reverse" 
                            checked={!!selectedWidget.style.reverseDirection}
                            onChange={(e) => updateWidget(selectedWidget.id, { style: { ...selectedWidget.style, reverseDirection: e.target.checked } })}
                            className="mr-2"
                          />
                          <label htmlFor="reverse" className="text-xs font-bold text-slate-700">Reverse Layout</label>
                       </div>
                    )}
                  </div>

                   <button 
                    onClick={() => removeWidget(selectedWidget.id)}
                    className="w-full py-2 bg-red-50 text-red-600 text-sm font-bold rounded hover:bg-red-100 flex items-center justify-center gap-2 mt-8"
                  >
                    <Trash2 size={14} /> Remove Widget
                  </button>
                </div>
              )}
            </div>

            {/* 2. Canvas Area */}
            <div 
              className="flex-1 bg-slate-200 p-8 overflow-y-auto custom-scrollbar"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div 
                  className="bg-white min-h-[800px] shadow-2xl mx-auto max-w-5xl rounded-lg relative overflow-hidden transition-colors duration-200 flex flex-col" 
                  style={{ 
                    backgroundColor: currentPageTheme.backgroundColor, 
                    backgroundImage: currentPageTheme.backgroundImage ? `url(${currentPageTheme.backgroundImage})` : undefined,
                    backgroundSize: 'cover',
                    outline: isDragging ? '4px dashed #3b82f6' : 'none',
                    outlineOffset: '-4px'
                  }}
              >
                 {currentLayout.length === 0 ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none bg-white/80">
                      <Layout size={64} className="mb-4" />
                      <p className="text-xl font-bold">Canvas is Empty</p>
                      <p>Drag widgets here to start building.</p>
                   </div>
                 ) : (
                   currentLayout.map((widget, index) => (
                     <div 
                        key={widget.id} 
                        onClick={(e) => { e.stopPropagation(); setSelectedWidgetId(widget.id); }}
                        className={`relative group border-2 transition-all cursor-pointer ${selectedWidgetId === widget.id ? 'border-blue-500 ring-4 ring-blue-500/20 z-10' : 'border-transparent hover:border-blue-200'}`}
                        style={{
                           padding: widget.style.padding === 'none' ? '0' : widget.style.padding === 'small' ? '1rem' : widget.style.padding === 'large' ? '4rem' : '2rem',
                           backgroundColor: widget.style.backgroundColor,
                           color: widget.style.textColor,
                           textAlign: widget.style.alignment,
                        }}
                     >
                        {/* Overlay for controls */}
                        <div className={`absolute top-2 right-2 flex gap-1 ${selectedWidgetId === widget.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity bg-white shadow-sm rounded-lg p-1 z-20`}>
                           <button onClick={(e) => { e.stopPropagation(); moveWidget(index, 'up'); }} className="p-1 hover:bg-slate-100 rounded text-slate-600" disabled={index === 0}><ArrowUp size={14} /></button>
                           <button onClick={(e) => { e.stopPropagation(); moveWidget(index, 'down'); }} className="p-1 hover:bg-slate-100 rounded text-slate-600" disabled={index === currentLayout.length - 1}><ArrowDown size={14} /></button>
                           <button onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }} className="p-1 hover:bg-red-100 text-red-500 rounded"><X size={14} /></button>
                        </div>
                        
                        {/* Widget Rendering Preview */}
                        {widget.type === 'HERO' && (
                           <div className="flex flex-col justify-center min-h-[300px]" style={{ backgroundImage: widget.style.backgroundImage ? `url(${widget.style.backgroundImage})` : 'none', backgroundSize: 'cover' }}>
                              <h1 className="text-4xl font-bold">{widget.content.title}</h1>
                              <p className="text-xl mt-2 opacity-90">{widget.content.subtitle}</p>
                           </div>
                        )}
                        
                        {widget.type === 'TEXT_BLOCK' && (
                           <div className="max-w-4xl mx-auto">
                              {widget.content.title && <h2 className="text-2xl font-bold mb-4">{widget.content.title}</h2>}
                              <p className="whitespace-pre-wrap">{widget.content.text}</p>
                           </div>
                        )}

                        {widget.type === 'IMAGE_FULL' && (
                           <div className={`flex ${widget.style.alignment === 'center' ? 'justify-center' : widget.style.alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
                              {widget.content.image ? (
                                <img src={widget.content.image} className={`${widget.style.width === 'small' ? 'w-1/4' : widget.style.width === 'large' ? 'w-3/4' : 'w-1/2'} rounded-xl shadow`} />
                              ) : (
                                <div className="bg-slate-100 h-64 w-full flex items-center justify-center text-slate-400">Image Placeholder</div>
                              )}
                           </div>
                        )}

                        {widget.type === 'SPLIT_CONTENT' && (
                           <div className={`flex flex-col md:flex-row gap-8 items-center ${widget.style.reverseDirection ? 'md:flex-row-reverse' : ''}`}>
                              <div className="flex-1 w-full">
                                {widget.content.image ? <img src={widget.content.image} className="w-full h-48 object-cover rounded-xl" /> : <div className="bg-slate-100 h-48 w-full rounded-xl"></div>}
                              </div>
                              <div className="flex-1">
                                 <h2 className="text-2xl font-bold mb-2">{widget.content.title}</h2>
                                 <p>{widget.content.text}</p>
                              </div>
                           </div>
                        )}

                        {widget.type === 'VIDEO_EMBED' && (
                           <div className="max-w-4xl mx-auto bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center text-white">
                              {widget.content.videoUrl ? 'Video Embed Preview' : 'No Video URL'}
                           </div>
                        )}

                        {widget.type === 'SPACER' && <div style={{ height: widget.style.height === 'large' ? '100px' : widget.style.height === 'medium' ? '50px' : '20px' }} className="border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-xs text-slate-400">Spacer</div>}
                     </div>
                   ))
                 )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;