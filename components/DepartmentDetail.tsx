

import React from 'react';
import { DepartmentContent, DepartmentType, UploadedFile, PageWidget, GlobalTheme } from '../types';
import HardwareServicesWidget from './HardwareServicesWidget';
import HolidayVideoGenerator from './HolidayVideoGenerator';
import { ArrowLeft, CheckCircle, Wrench, Palette, Grid, Settings, Gift, Lightbulb, Briefcase, FlaskConical, CreditCard, Calendar, Truck, Percent, UserCheck, FileText, Key, Image as ImageIcon } from 'lucide-react';

interface Props {
  department: DepartmentContent;
  onBack: () => void;
  customMedia?: UploadedFile[];
  layout?: PageWidget[] | null;
  pageTheme?: GlobalTheme | null;
}

const DepartmentDetail: React.FC<Props> = ({ department, onBack, customMedia, layout, pageTheme }) => {

  // Helper to render service icons dynamically
  const renderServiceIcon = (iconName: string) => {
    const size = 24;
    const className = `text-${department.colorClass.split('-')[1]}-600`;
    
    switch (iconName) {
      case 'key': return <Key size={size} className={className} />;
      case 'palette': return <Palette size={size} className={className} />;
      case 'grid': return <Grid size={size} className={className} />;
      case 'settings': return <Settings size={size} className={className} />;
      case 'gift': return <Gift size={size} className={className} />;
      case 'lightbulb': return <Lightbulb size={size} className={className} />;
      case 'briefcase': return <Briefcase size={size} className={className} />;
      case 'flask': return <FlaskConical size={size} className={className} />;
      case 'credit-card': return <CreditCard size={size} className={className} />;
      case 'tool': return <Wrench size={size} className={className} />;
      case 'calendar': return <Calendar size={size} className={className} />;
      case 'truck': return <Truck size={size} className={className} />;
      case 'percent': return <Percent size={size} className={className} />;
      case 'user-check': return <UserCheck size={size} className={className} />;
      case 'file-text': return <FileText size={size} className={className} />;
      default: return <CheckCircle size={size} className={className} />;
    }
  };

  // --- Dynamic Layout Renderer ---
  const renderWidget = (widget: PageWidget) => {
    // Basic Style Mapper
    const style: React.CSSProperties = {
      backgroundColor: widget.style.backgroundColor,
      color: widget.style.textColor,
      textAlign: widget.style.alignment || 'left',
      backgroundImage: widget.style.backgroundImage ? `url(${widget.style.backgroundImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };

    const containerClass = `w-full relative ${
      widget.style.padding === 'none' ? 'p-0' :
      widget.style.padding === 'small' ? 'p-4' :
      widget.style.padding === 'large' ? 'p-16' : 'p-8'
    }`;

    const textClass = `
      ${widget.style.fontFamily === 'serif' ? 'serif' : widget.style.fontFamily === 'mono' ? 'font-mono' : 'font-sans'}
      ${widget.style.fontSize === 'sm' ? 'text-sm' : 
        widget.style.fontSize === 'lg' ? 'text-lg' : 
        widget.style.fontSize === 'xl' ? 'text-xl' : 
        widget.style.fontSize === '2xl' ? 'text-2xl' : 
        widget.style.fontSize === '4xl' ? 'text-4xl' : 'text-base'}
    `;

    switch (widget.type) {
      case 'HERO':
        return (
          <div key={widget.id} className={`${containerClass} min-h-[400px] flex flex-col justify-center text-white`} style={style}>
            {widget.style.backgroundImage && <div className="absolute inset-0 bg-black/40" />}
            <div className="relative z-10 max-w-4xl mx-auto w-full">
              <h1 className={`${textClass} font-bold mb-4`}>{widget.content.title}</h1>
              <p className="text-xl opacity-90">{widget.content.subtitle}</p>
            </div>
          </div>
        );
      
      case 'TEXT_BLOCK':
        return (
          <div key={widget.id} className={containerClass} style={style}>
             <div className="max-w-4xl mx-auto">
                {widget.content.title && <h2 className="text-2xl font-bold mb-4">{widget.content.title}</h2>}
                <div className={`${textClass} whitespace-pre-wrap`}>{widget.content.text}</div>
             </div>
          </div>
        );

      case 'IMAGE_FULL':
        // Handle alignment and width for images
        const widthClass = 
          widget.style.width === 'small' ? 'w-full md:w-1/4' : 
          widget.style.width === 'medium' ? 'w-full md:w-1/2' : 
          widget.style.width === 'large' ? 'w-full md:w-3/4' : 'w-full';
        
        const alignmentClass = 
          widget.style.alignment === 'center' ? 'justify-center' : 
          widget.style.alignment === 'right' ? 'justify-end' : 'justify-start';

        return (
          <div key={widget.id} className={`${containerClass} flex ${alignmentClass}`} style={{ backgroundColor: widget.style.backgroundColor, padding: widget.style.padding === 'none' ? 0 : undefined }}>
             <img 
               src={widget.content.image} 
               alt={widget.content.title} 
               className={`${widthClass} h-auto rounded-xl shadow-lg`} 
             />
          </div>
        );
      
      case 'SPLIT_CONTENT':
        const flexDirection = widget.style.reverseDirection ? 'md:flex-row-reverse' : 'md:flex-row';
        return (
          <div key={widget.id} className={`${containerClass} flex flex-col ${flexDirection} gap-8 items-center`} style={style}>
             <div className="flex-1">
                <img src={widget.content.image} alt="Split" className="w-full h-64 object-cover rounded-xl shadow-md" />
             </div>
             <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">{widget.content.title}</h2>
                <p className={textClass}>{widget.content.text}</p>
             </div>
          </div>
        );

      case 'VIDEO_EMBED':
        return (
          <div key={widget.id} className={containerClass} style={style}>
             <div className="max-w-4xl mx-auto bg-black rounded-xl overflow-hidden aspect-video shadow-2xl">
                {widget.content.videoUrl ? (
                  <video src={widget.content.videoUrl} controls className="w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">No Video URL</div>
                )}
             </div>
          </div>
        );
      
      case 'SPACER':
        return <div key={widget.id} style={{ height: widget.style.height === 'large' ? '100px' : widget.style.height === 'medium' ? '50px' : '20px' }} />;

      default:
        return null;
    }
  };

  // Check for custom Page Theme styles
  const pageStyle: React.CSSProperties = pageTheme ? {
    backgroundColor: pageTheme.backgroundColor,
    backgroundImage: pageTheme.backgroundImage ? `url(${pageTheme.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  } : {};

  // If a custom layout is present, use it. Otherwise, fallback to the hardcoded default layout.
  if (layout && layout.length > 0) {
    return (
      <div className="bg-slate-50 min-h-screen animate-fade-in pb-20" style={pageStyle}>
         <button 
            onClick={onBack}
            className="fixed top-24 left-4 z-50 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-white transition-all text-slate-800"
          >
            <ArrowLeft size={20} />
          </button>
        {layout.map(widget => renderWidget(widget))}
        
        {/* Always render critical functionality widgets at bottom of custom pages */}
        <div className="max-w-7xl mx-auto px-6 pt-12">
            {department.id === DepartmentType.CHRISTMAS && <HolidayVideoGenerator />}
            {department.id === DepartmentType.HARDWARE && <HardwareServicesWidget />}
        </div>
      </div>
    );
  }

  // --- DEFAULT HARDCODED LAYOUT ---
  return (
    <div className="bg-slate-50 min-h-screen animate-fade-in" style={pageStyle}>
      {/* Hero Section */}
      <div className="relative h-[400px] lg:h-[500px] overflow-hidden">
        <div className={`absolute inset-0 ${department.colorClass} opacity-90`}></div>
        <img 
          src={department.image} 
          alt={department.title} 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <button 
            onClick={onBack}
            className="absolute top-8 left-4 sm:left-8 flex items-center text-white/80 hover:text-white transition-colors group"
          >
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-white serif mb-4 drop-shadow-lg">
            {department.title}
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 font-medium max-w-2xl">
            {department.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-t-4 border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 serif">About the Department</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                {department.fullDescription || department.description.join(' ')}
              </p>
              
              {department.highlight && (
                <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg flex items-start">
                  <CreditCard className="text-yellow-600 mt-1 mr-3 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-yellow-800 uppercase text-sm">Special Offer</h4>
                    <p className="text-yellow-900">{department.highlight}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Christmas Video Generator */}
            {department.id === DepartmentType.CHRISTMAS && (
              <HolidayVideoGenerator />
            )}

            {/* Hardware Specific Services Widget */}
            {department.id === DepartmentType.HARDWARE && (
               <HardwareServicesWidget />
            )}

            {/* Categories Grid */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Grid className="mr-3 text-slate-400" />
                Shop Categories
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {department.categories?.map((cat) => (
                  <div key={cat.id} className="group cursor-pointer">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 mb-3 shadow-md relative">
                      <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10`} />
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-center">
                      {cat.name}
                    </h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Admin Gallery (If files exist) */}
            {customMedia && customMedia.length > 0 && (
              <div className="mb-12 bg-slate-100 p-6 rounded-2xl border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <ImageIcon className="mr-3 text-slate-500" />
                  Store Gallery
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customMedia.map((file) => (
                    <div key={file.id} className="group relative rounded-xl overflow-hidden shadow-lg bg-white aspect-[4/3] hover:shadow-2xl transition-all duration-300">
                      {file.type === 'video' ? (
                        <video controls src={file.url} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <span className="text-white text-xs font-medium truncate w-full">{file.name}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Services */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
                Department Services
              </h3>
              
              <div className="space-y-6">
                {department.services?.map((service, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="flex-shrink-0 p-2 bg-slate-50 rounded-lg mr-4 text-slate-700">
                      {renderServiceIcon(service.iconName)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{service.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2 text-sm">Need Help?</h4>
                <p className="text-sm text-slate-500 mb-4">
                  Our experts are ready to assist you with any project or question.
                </p>
                <button className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-transform active:scale-95 ${department.colorClass}`}>
                  Contact Department
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DepartmentDetail;