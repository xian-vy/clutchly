import {
  CircleDollarSign,
  Dna,
  Globe,
  Heart,
  House,
  LineChart,
  Network,
  Package,
  Settings2,
  ShoppingBag,
  Sprout,
  Turtle,
  Users2,
  Worm
} from 'lucide-react';

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
      icon: House,
    },
    {
      section: 'Main',
      name: 'Website',
      icon: Globe,
      href: '/catalog',
    },
    {
      section: 'Main',
      name: 'Reptiles',
      href: '/reptiles',
      icon: Turtle,
      displayName: 'Reptile Management', 
    },
    {
      section: 'Main',
      name: 'Users',
      href: '/users',
      icon: Users2,
      displayName: 'User Management', 
    },
    {
      section: 'Finance',
      name: 'Sales',
      href: '/sales',
      icon: CircleDollarSign,
      displayName: 'Sales', 
    },
    {
      section: 'Finance',
      name: 'Expenses',
      href: '/expenses',
      icon: ShoppingBag,
      displayName: 'Expenses', 
    },

    {
      section: 'Breeding',
      name: 'Breeding',
      href: '/breeding',
      icon: Dna,
      displayName: 'Breeding', 
    },
    {
      section: 'Breeding',
      name: 'Genetic Calculator',
      href: '/genetic-calculator',
      icon: Network,
      displayName: 'Genetic Calculator', 
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