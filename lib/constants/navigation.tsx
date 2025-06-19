import {
    Dna,
    DollarSign,
    Globe,
    Heart,
    LayoutDashboard,
    LineChart,
    Network,
    Package,
    Plus,
    Settings2,
    Sprout,
    Users2,
    Worm,
} from 'lucide-react';
import { MdCurrencyExchange } from "react-icons/md";

import { VscSnake } from "react-icons/vsc";

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
      name: 'Finance',
      icon: MdCurrencyExchange,
      items: [
        {
          name: 'New Sales',
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
        {
          name: 'New Expense',
          href: '/expenses/new',
          icon: Plus,
          type: "Expense",
          action : true
        },
        {
          name: 'All Expenses',
          href: '/expenses',
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
      section: 'Main',
      name: 'Users',
      href: '/users',
      icon: Users2,
      displayName: 'User Management', 
    },
    {
      section: 'Health & Growth',
      name: 'Feeding',
      href: '/feeding',
      icon: Worm,
    },
    {
      section: 'Health & Growth',
      name: 'Shedding',
      href: '/shedding',
      icon: Sprout
    },
    {
      section: 'Health & Growth',
      name: 'Enclosures',
      href: '/enclosures',
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
      section: 'System',
      name: 'Settings',
      href: '/settings',
      icon: Settings2,
    },
  ];