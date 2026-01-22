

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import Departments from './components/Departments';
import QuickAccess from './components/QuickAccess';
import FeaturedProducts from './components/FeaturedProducts';
import DepartmentDetail from './components/DepartmentDetail';
import ChatWidget from './components/ChatWidget';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import PreOrder from './components/PreOrder';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { DepartmentType, UploadedFile, HeroConfig, PageLayouts, GlobalTheme, Integration, StoreConfig, ProductItem, StoreWorkflow, PageThemes } from './types';
import { departments } from './data';
import { getFiles, saveFile, deleteFile, getSetting, saveSetting } from './services/db';

// Helper to determine seasonal content based on current date
export const getSeasonalHeroConfig = (): Partial<HeroConfig> => {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();

  // CHRISTMAS (Nov 15 - Dec 31)
  if ((month === 10 && day >= 15) || month === 11) {
    return {
       title: "Christmasland is Open",
       subtitle: "Visit the 2nd floor for the area's largest holiday display.",
       buttonText: "Shop Christmas",
       backgroundImage: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?q=80&w=2000&auto=format&fit=crop",
       buttonColor: 'gradient',
       buttonGradientStart: '#dc2626',
       buttonGradientEnd: '#15803d',
       alignment: 'center',
       overlayOpacity: 40,
       fontFamily: 'serif',
       backgroundImagePosition: 'center'
    };
  }

  // SUMMER / POOL (May 15 - Aug 31)
  if ((month === 4 && day >= 15) || (month >= 5 && month <= 7)) {
    return {
       title: "Summer Pool Essentials",
       subtitle: "Chemicals, filters, and professional free water testing.",
       buttonText: "Pool Supplies",
       backgroundImage: "https://images.unsplash.com/photo-1572331165267-854da2b00dc1?q=80&w=2000&auto=format&fit=crop",
       buttonColor: 'blue',
       alignment: 'left',
       overlayOpacity: 30,
       fontFamily: 'sans',
       backgroundImagePosition: 'center'
    };
  }

  // SPRING (Mar 15 - May 14)
  if ((month === 2 && day >= 15) || month === 3 || (month === 4 && day < 15)) {
     return {
       title: "Spring into Action",
       subtitle: "Get your lawn and garden ready with our premium tools and soils.",
       buttonText: "Lawn & Garden",
       backgroundImage: "https://images.unsplash.com/photo-1416879156036-70f5341cebe1?q=80&w=2000&auto=format&fit=crop",
       buttonColor: 'green',
       alignment: 'left',
       overlayOpacity: 25,
       fontFamily: 'sans',
       backgroundImagePosition: 'center'
     };
  }

  // FALL (Sep 1 - Nov 14)
  if (month === 8 || month === 9 || (month === 10 && day < 15)) {
     return {
       title: "Fall Clean Up",
       subtitle: "Rakes, leaf blowers, and bags for autumn maintenance.",
       buttonText: "Shop Hardware",
       backgroundImage: "https://images.unsplash.com/photo-1508020963102-c6c723be5764?q=80&w=2000&auto=format&fit=crop",
       buttonColor: 'orange',
       alignment: 'right',
       overlayOpacity: 40,
       fontFamily: 'serif',
       backgroundImagePosition: 'center'
     };
  }

  // WINTER / GENERAL (Jan 1 - Mar 14)
  return {
     title: "Main Hardware & Supply",
     subtitle: "Your hometown powerhouse for tools, parts, and service.",
     buttonText: "View Departments",
     backgroundImage: "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?q=80&w=2000&auto=format&fit=crop",
     buttonColor: 'slate',
     alignment: 'center',
     overlayOpacity: 50,
     fontFamily: 'sans',
     backgroundImagePosition: 'center'
  };
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'HOME' | 'DEPARTMENT' | 'SERVICES' | 'PREORDER' | 'ADMIN'>('HOME');
  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentType | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  // Admin Files State
  const [adminFiles, setAdminFiles] = useState<UploadedFile[]>([]);

  // Page Layouts State
  const [pageLayouts, setPageLayouts] = useState<PageLayouts>({});
  
  // Page Themes State
  const [pageThemes, setPageThemes] = useState<PageThemes>({});

  // Global Theme State
  const defaultTheme: GlobalTheme = {
    backgroundColor: '#e2e8f0',
    accentColor: '#f97316', // Orange-500
    glassOpacity: 40,
    backgroundImage: undefined,
    cursor: 'default'
  };

  const [globalTheme, setGlobalTheme] = useState<GlobalTheme>(defaultTheme);
  
  // Initial config uses seasonal logic by default
  const defaultHeroConfig: HeroConfig = {
    ...getSeasonalHeroConfig() as HeroConfig,
    height: 'medium',
    titleSize: 'normal',
    buttonSize: 'medium',
    overlayOpacity: 40, // Ensure defaults if seasonal returns partial
    backgroundImageScale: 100,
    isSeasonal: true
  };

  const [heroConfig, setHeroConfigState] = useState<HeroConfig>(defaultHeroConfig);

  // Integrations State
  const defaultIntegrations: Integration[] = [
    { id: '1', name: 'Google Calendar', provider: 'google', description: 'Sync store events and employee schedules.', connected: false },
    { id: '2', name: 'QuickBooks Online', provider: 'quickbooks', description: 'Automated accounting and inventory sync.', connected: false },
    { id: '3', name: 'Motion', provider: 'motion', description: 'Project management and task automation.', connected: false },
    { id: '4', name: 'Slack', provider: 'slack', description: 'Team communication and alerts.', connected: false },
    { id: '5', name: 'Shopify', provider: 'shopify', description: 'Sync e-commerce products and orders.', connected: false },
  ];

  const [integrations, setIntegrations] = useState<Integration[]>(defaultIntegrations);

  // New Store Config State
  const defaultStoreConfig: StoreConfig = {
    email: 'MainHardwaredps@Gmail.com',
    phone: '570-823-3938',
    address: '642 South Main St.\nWilkes-Barre, PA 18701',
    facebookUrl: 'https://www.facebook.com/MainHardwarePoolSupply',
    hours: 'Mon-Sat: 8am - 6pm\nSun: 9am - 4pm'
  };
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(defaultStoreConfig);

  // Products State
  const defaultProducts: ProductItem[] = [
    { id: '1', name: "DeWalt 20V Drill Kit", category: "Power Tools", price: "$99.00", image: "https://picsum.photos/200/200?random=10", url: '#', featured: true, inStock: true },
    { id: '2', name: "12ft Inflatable Santa", category: "Christmasland", price: "$129.99", image: "https://picsum.photos/200/200?random=11", url: '#', featured: true, inStock: true },
    { id: '3', name: "50lb Chlorine Tabs", category: "Pool Care", price: "$149.50", image: "https://picsum.photos/200/200?random=12", url: '#', featured: true, inStock: true }
  ];
  const [products, setProducts] = useState<ProductItem[]>(defaultProducts);

  // Workflows State
  const [workflows, setWorkflows] = useState<StoreWorkflow[]>([
    { id: '1', title: 'Daily Opening Procedure', description: 'Checklist for store opening', steps: ['Turn on lights', 'Count register', 'Unlock doors'], status: 'active' }
  ]);

  // Load Data from IndexedDB on Mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Files
        const files = await getFiles();
        if (files && files.length > 0) {
          setAdminFiles(files);
        }

        // Load Settings
        const savedTheme = await getSetting('globalTheme');
        if (savedTheme) setGlobalTheme(savedTheme);

        const savedPageThemes = await getSetting('pageThemes');
        if (savedPageThemes) setPageThemes(savedPageThemes);

        const savedHero = await getSetting('heroConfig');
        if (savedHero) setHeroConfigState(prev => ({ ...prev, ...savedHero }));

        const savedLayouts = await getSetting('pageLayouts');
        if (savedLayouts) setPageLayouts(savedLayouts);
        
        const savedIntegrations = await getSetting('integrations');
        if (savedIntegrations && Array.isArray(savedIntegrations)) setIntegrations(savedIntegrations);

        const savedStoreConfig = await getSetting('storeConfig');
        if (savedStoreConfig) setStoreConfig(savedStoreConfig);

        const savedProducts = await getSetting('products');
        if (savedProducts) setProducts(savedProducts);

        const savedWorkflows = await getSetting('workflows');
        if (savedWorkflows) setWorkflows(savedWorkflows);

      } catch (error) {
        console.error("Failed to load data from DB:", error);
      }
    };
    loadData();
  }, []);

  const handleUpdateGlobalTheme = async (newTheme: GlobalTheme) => {
    setGlobalTheme(newTheme);
    await saveSetting('globalTheme', newTheme);
  };

  const handleUpdatePageThemes = async (newThemes: PageThemes) => {
    setPageThemes(newThemes);
    await saveSetting('pageThemes', newThemes);
  };

  const handleUpdateHeroConfig = async (newConfig: HeroConfig) => {
    setHeroConfigState(newConfig);
    await saveSetting('heroConfig', newConfig);
  };

  const handleUpdatePageLayouts = async (newLayouts: PageLayouts) => {
    setPageLayouts(newLayouts);
    await saveSetting('pageLayouts', newLayouts);
  };

  const handleUpdateIntegrations = async (newIntegrations: Integration[]) => {
    setIntegrations(newIntegrations);
    await saveSetting('integrations', newIntegrations);
  };

  const handleUpdateStoreConfig = async (newConfig: StoreConfig) => {
    setStoreConfig(newConfig);
    await saveSetting('storeConfig', newConfig);
  };

  const handleUpdateProducts = async (newProducts: ProductItem[]) => {
    setProducts(newProducts);
    await saveSetting('products', newProducts);
  };

  const handleUpdateWorkflows = async (newWorkflows: StoreWorkflow[]) => {
    setWorkflows(newWorkflows);
    await saveSetting('workflows', newWorkflows);
  };

  const handleNavigate = (view: any) => {
    if (Object.values(DepartmentType).includes(view)) {
      setSelectedDeptId(view as DepartmentType);
      setCurrentView('DEPARTMENT');
    } else {
      setCurrentView(view);
      if (view === 'HOME') setSelectedDeptId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogin = (password: string) => {
    // Simple password check for demonstration
    if (password === 'main123') {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    handleNavigate('HOME');
  };

  const handleAddAdminFiles = async (newFiles: UploadedFile[]) => {
    // Optimistically update state
    setAdminFiles(prev => [...prev, ...newFiles]);
    
    // Save to IndexedDB
    try {
      for (const file of newFiles) {
        await saveFile(file);
      }
    } catch (e) {
      console.error("Failed to save file to DB", e);
      alert("Error saving file. Your browser storage might be full.");
    }
  };

  const handleRemoveAdminFile = async (id: string) => {
    setAdminFiles(prev => prev.filter(f => f.id !== id));
    await deleteFile(id);
  };

  const selectedDept = departments.find(d => d.id === selectedDeptId);

  // Compute Active Hero Config (Dynamic if seasonal)
  const activeHeroConfig = heroConfig.isSeasonal 
    ? { ...heroConfig, ...getSeasonalHeroConfig() } 
    : heroConfig;

  return (
    <div 
      className="min-h-screen flex flex-col transition-all duration-500 bg-fixed"
      style={{
        backgroundColor: globalTheme.backgroundColor,
        backgroundImage: globalTheme.backgroundImage ? `url(${globalTheme.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        cursor: globalTheme.cursor === 'default' ? 'auto' : globalTheme.cursor
      }}
    >
      {/* Navbar for Mobile/Tablet or general header access */}
      <Navbar onNavigate={handleNavigate} onHome={() => handleNavigate('HOME')} storeConfig={storeConfig} />

      <div className="flex-1 lg:p-8 flex gap-8">
        {/* Sidebar - Desktop & Mobile Drawer */}
        <Sidebar 
          activeView={currentView === 'DEPARTMENT' ? selectedDeptId || 'DEPARTMENTS' : currentView} 
          onNavigate={handleNavigate} 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        {/* Main Content Area - The "Glass Dashboard" */}
        <main className="flex-1 min-w-0">
          <div 
            className="backdrop-blur-xl border border-white/50 shadow-2xl rounded-none lg:rounded-[40px] p-6 lg:p-10 min-h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-10 overflow-hidden relative transition-all duration-300"
            style={{
              backgroundColor: `rgba(255, 255, 255, ${globalTheme.glassOpacity / 100})`
            }}
          >
            
            {/* Chrome/Metallic Background Effect within the card (Dynamic opacity) */}
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

            {currentView === 'HOME' ? (
              <>
                {/* Left/Center Column (Main Dashboard Feed) */}
                <div className="flex-1 flex flex-col gap-8 min-w-0 relative z-10">
                  
                  {/* Header Text */}
                  <div className="flex justify-between items-end px-2">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-800 serif">Welcome, Neighbor</h1>
                      <p className="text-slate-500 font-medium">Here's what's happening at Main Hardware today.</p>
                    </div>
                  </div>

                  {/* Hero / Welcome Card - Uses Active Computed Config */}
                  <Hero onNavigate={handleNavigate} config={activeHeroConfig} />

                  {/* Quick Access Circles */}
                  <QuickAccess />

                  {/* Bottom Section - Split */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <FeaturedProducts products={products} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-4 px-2">
                          <span className="font-bold text-slate-700 text-lg">Community Feed</span>
                      </div>
                      <div className="glass-card p-6 rounded-2xl h-full min-h-[200px] flex flex-col justify-center items-center text-center">
                          <p className="text-slate-500 italic mb-4">"The best place for pool supplies in Wilkes-Barre!"</p>
                          <div className="flex -space-x-2 mb-2">
                            {[1,2,3].map(i => (
                              <img key={i} className="w-8 h-8 rounded-full border-2 border-white" src={`https://picsum.photos/50/50?random=${i}`} alt="User" />
                            ))}
                            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">+42</div>
                          </div>
                          <button className="text-sm font-bold text-orange-600 mt-2 hover:underline">Read Reviews</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:hidden">
                    <Footer onNavigate={handleNavigate} storeConfig={storeConfig} />
                  </div>
                </div>

                {/* Right Panel (Desktop Only usually, but we stack on mobile) */}
                <div className="lg:w-80 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200/50 pt-8 lg:pt-0 lg:pl-10 relative z-10">
                  <Departments onNavigate={handleNavigate} />
                </div>
              </>
            ) : currentView === 'DEPARTMENT' && selectedDept ? (
              <div className="w-full h-full overflow-y-auto pr-2 custom-scrollbar relative z-10">
                <DepartmentDetail 
                  department={selectedDept} 
                  onBack={() => handleNavigate('HOME')}
                  customMedia={adminFiles.filter(f => f.dept === selectedDept.id)}
                  layout={pageLayouts[selectedDept.id] || null}
                  pageTheme={pageThemes[selectedDept.id] || null}
                />
              </div>
            ) : currentView === 'PREORDER' ? (
              <div className="w-full h-full overflow-y-auto pr-2 custom-scrollbar relative z-10">
                <button onClick={() => handleNavigate('HOME')} className="mb-4 text-slate-500 hover:text-orange-500 font-bold text-sm flex items-center gap-2">← Back to Dashboard</button>
                <PreOrder />
              </div>
            ) : currentView === 'ADMIN' ? (
              <div className="w-full h-full relative z-10">
                {isAdminAuthenticated ? (
                  <AdminDashboard 
                    onLogout={handleAdminLogout} 
                    files={adminFiles}
                    onAddFiles={handleAddAdminFiles}
                    onRemoveFile={handleRemoveAdminFile}
                    heroConfig={heroConfig}
                    onUpdateHeroConfig={handleUpdateHeroConfig}
                    pageLayouts={pageLayouts}
                    onUpdatePageLayouts={handleUpdatePageLayouts}
                    globalTheme={globalTheme}
                    onUpdateGlobalTheme={handleUpdateGlobalTheme}
                    integrations={integrations}
                    onUpdateIntegrations={handleUpdateIntegrations}
                    storeConfig={storeConfig}
                    onUpdateStoreConfig={handleUpdateStoreConfig}
                    products={products}
                    onUpdateProducts={handleUpdateProducts}
                    workflows={workflows}
                    onUpdateWorkflows={handleUpdateWorkflows}
                    pageThemes={pageThemes}
                    onUpdatePageThemes={handleUpdatePageThemes}
                  />
                ) : (
                  <AdminLogin onLogin={handleAdminLogin} />
                )}
              </div>
            ) : (
              <div className="w-full flex items-center justify-center text-slate-400 font-bold text-lg">
                Coming Soon...
                <button onClick={() => handleNavigate('HOME')} className="ml-4 text-orange-500 underline">Go Home</button>
              </div>
            )}

          </div>
        </main>
      </div>
      <div className="hidden lg:block">
        <Footer onNavigate={handleNavigate} storeConfig={storeConfig} />
      </div>

      <ChatWidget />
    </div>
  );
};

export default App;