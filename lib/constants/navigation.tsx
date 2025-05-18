import {
  Bug,
    Dna,
    DollarSign,
    Download,
    Globe,
    Heart,
    LayoutDashboard,
    LineChart,
    Network,
    Package,
    Plus,
    Settings,
} from 'lucide-react';
import { VscSnake } from "react-icons/vsc";
import { PiChartLineUp,PiChartLineDown } from "react-icons/pi";

export interface NavItem {
    name: string;
    href?: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    items?: NavItem[];
    section?: string;
    displayName?: string;
    type? :  "Reptile" | "Sale" | "Expense"
    action? : boolean
}
  
 export const NAV_ITEMS: NavItem[] = [
    {
      name: 'Overview',
      href: '/overview',
      icon: LayoutDashboard,
    },
    {
        section: 'Main',
        name: 'Website',
        icon: Globe,
        href: '/catalog',
      },
      {
      section: 'Main',
      name: 'Sales',
      icon: PiChartLineUp,
      items: [
        {
          name: 'Add New',
          href: '/sales/new',
          icon: Plus,
          type: "Sale",
          action : true
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
      name: 'Expenses',
      icon: PiChartLineDown,
      items: [
        {
          name: 'Add New',
          href: '/expenses/new',
          icon: Plus,
          type: "Expense",
          action : true
        },
        {
          name: 'All Expenses',
          href: '/expenses',
          icon: DollarSign,
          displayName: 'Expenses Management', 
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
          type: "Reptile",
          action : true
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
      items: [
        {
          name: 'Genetic Calculator',
          href: '/genetic-calculator',
          icon: Network,
        },
        {
          name: 'Breeding Projects',
          href: '/breeding',
          icon: Dna,
        },
      ],
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
      icon: Bug,
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