import {
    Dna,
    DollarSign,
    Download,
    Heart,
    LayoutDashboard,
    LineChart,
    Package,
    Plus,
    Rat,
    Settings,
} from 'lucide-react';
import { VscSnake } from "react-icons/vsc";

export interface NavItem {
    name: string;
    href?: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    items?: NavItem[];
    section?: string;
    displayName?: string;
}
  
 export const NAV_ITEMS: NavItem[] = [
    {
      name: 'Overview',
      href: '/overview',
      icon: LayoutDashboard,
    },
    {
      section: 'Main',
      name: 'Sales',
      icon: DollarSign,
      items: [
        {
          name: 'Add New',
          href: '/sales/new',
          icon: Plus,
        },
        {
          name: 'All Sales',
          href: '/sales',
          icon: DollarSign,
          displayName: 'Sales Management', 
        },
      ],
    },
    {
      section: 'Main',
      name: 'Reptiles',
      icon: VscSnake,
      items: [
        {
          name: 'Add New',
          href: '/reptiles/new',
          icon: Plus,
        },
        {
          name: 'All Reptiles',
          href: '/reptiles',
          icon: VscSnake,
          displayName: 'Reptile Management', 
        },
      ],
    },
    {
      section: 'Main',
      name: 'Breeding',
      href: '/breeding',
      icon: Dna,
      displayName: 'Breeding Management', 

    },
    {
      section: 'Health & Growth',
      name: 'Enclosures',
      href: '/housing',
      icon: Package
    },
    {
      section: 'Health & Growth',
      name: 'Health',
      href: '/health',
      icon: Heart,
    },
    {
      section: 'Health & Growth',
      name: 'Growth',
      href: '/growth',
      icon: LineChart,
    },
    {
      section: 'Health & Growth',
      name: 'Feeding',
      href: '/feeding',
      icon: Rat,
    },
    {
      section: 'System',
      name: 'Backup',
      href: '/download',
      icon: Download,
    },
    {
      section: 'System',
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];