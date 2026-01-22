

export enum DepartmentType {
  HARDWARE = 'HARDWARE',
  POOL = 'POOL',
  CHRISTMAS = 'CHRISTMAS',
  COMMERCIAL = 'COMMERCIAL'
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface Service {
  title: string;
  description: string;
  iconName: string;
}

export interface DepartmentContent {
  id: DepartmentType;
  title: string;
  subtitle: string;
  description: string[];
  fullDescription?: string; // Longer text for the detail page
  iconName: string;
  image: string;
  colorClass: string;
  highlight?: string;
  categories?: Category[];
  services?: Service[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  dept: DepartmentType;
}

export interface HeroConfig {
  title: string;
  subtitle: string;
  buttonText: string;
  backgroundImage: string;
  alignment: 'left' | 'center' | 'right';
  height: 'small' | 'medium' | 'large'; // 300px, 400px, 500px
  titleSize: 'normal' | 'large' | 'huge';
  overlayOpacity: number; // 0 to 100
  fontFamily: 'sans' | 'serif' | 'mono';
  buttonSize: 'small' | 'medium' | 'large';
  buttonColor: 'red' | 'blue' | 'green' | 'orange' | 'slate' | 'gradient';
  buttonGradientStart?: string;
  buttonGradientEnd?: string;
  backgroundImagePosition?: 'top' | 'center' | 'bottom';
  backgroundImageScale?: number; // Percentage 100-200
  isSeasonal?: boolean; // New: Auto-update based on season
}

export interface GlobalTheme {
  backgroundImage?: string;
  backgroundColor: string;
  accentColor: string;
  glassOpacity: number; // 0 to 100 for the main container
  cursor?: 'default' | 'crosshair' | 'cell' | 'move' | 'text' | 'pointer';
}

export interface Integration {
  id: string;
  name: string;
  provider: 'google' | 'quickbooks' | 'motion' | 'slack' | 'shopify' | 'custom';
  description: string;
  connected: boolean;
  apiKey?: string;
  lastSync?: string;
  settings?: Record<string, any>;
}

// --- New Types for Store Configuration ---

export interface StoreConfig {
  email: string;
  phone: string;
  address: string;
  facebookUrl: string;
  instagramUrl?: string;
  hours: string;
}

export interface ProductItem {
  id: string;
  name: string;
  price: string;
  category: string;
  url: string; // External web link
  image: string;
  featured: boolean;
  inStock: boolean;
}

export interface StoreWorkflow {
  id: string;
  title: string;
  description: string;
  steps: string[];
  status: 'active' | 'draft' | 'archived';
  assignedTo?: string;
}

// --- Page Builder Types ---

export type WidgetType = 'HERO' | 'TEXT_BLOCK' | 'IMAGE_FULL' | 'SPLIT_CONTENT' | 'SPACER' | 'VIDEO_EMBED';

export interface WidgetStyle {
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '4xl';
  padding?: 'none' | 'small' | 'medium' | 'large';
  height?: 'auto' | 'small' | 'medium' | 'large' | 'screen';
  width?: 'small' | 'medium' | 'large' | 'full'; // 25%, 50%, 75%, 100%
  backgroundImage?: string;
  alignment?: 'left' | 'center' | 'right';
  borderRadius?: 'none' | 'medium' | 'large' | 'full';
  reverseDirection?: boolean; // For split content
}

export interface WidgetContent {
  title?: string;
  subtitle?: string;
  text?: string;
  image?: string;
  videoUrl?: string;
  buttonText?: string;
  link?: string;
}

export interface PageWidget {
  id: string;
  type: WidgetType;
  content: WidgetContent;
  style: WidgetStyle;
}

export type PageLayouts = Record<string, PageWidget[]>;
export type PageThemes = Record<string, GlobalTheme>;

export type ViewType = 'HOME' | 'DEPARTMENT' | 'SERVICES' | 'PREORDER' | 'ADMIN';