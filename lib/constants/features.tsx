import { Bug, Database, Dna, Globe, Heart, LineChart, MonitorSmartphone, Network, Package, Sprout, User2 } from 'lucide-react'
import { PiChartLineUp } from 'react-icons/pi'
export const FEATURE_LIST = [
    {
      icon: Database,
      title: 'Comprehensive Data Management',
      features: [
        'Reptile biological and genetic data management',
        'Complete lineage and acquisition history',
        'Data import and export'
      ]
    },
    {
      icon: Globe,
      title: 'Free Website For your Store',
      features: [
        'Free URL link to your website',
        'Clean, modern and cuztomizable website.',
        'Minimal setup, list reptile to your website directly from your collection',
      ]
    },
    {
      icon: Dna,
      title: 'Breeding Management',
      features: [
        'AI-assisted breeding compatibility analysis',
        'Brood management and tracking',
        'Comprehensive breeding reports'
      ]
    },
    {
      icon: PiChartLineUp,
      title: 'Sales and Expense Tracking',
      features: [
        'Sales and expense tracking record tracking',
        'Interactive sales and expenses analytics dashboard',
      ]
    },
    {
      icon: Heart,
      title: 'Health Management',
      features: [
        'Record and monitor health events',
        'Display records in reptile pdf organization',
        'Reports and analytics'
      ]
    },
    {
      icon: LineChart,
      title: 'Growth Management',
      features: [
        'Detailed growth history tracking',
        'Interactive growth trend visualization',
        'Comparative species benchmarking'
      ]
    },
    {
      icon: Package,
      title: 'Enclosure Management',
      features: [
        'Enclosure setup and reptile assignment tracking',
        'Rack system management',
        'Room and shelf organization'
      ]
    },
    {
      icon: Network,
      title: 'Pedigree Analysis',
      features: [
        'Interactive pedigree tree visualization',
        'Detailed lineage and ancestry tracking',
      ]
    },
  
    {
      icon: Bug,
      title: 'Feeding Management',
      features: [
        'Customizable feeding schedule',
        'Feeding by selected reptiles, room or rack',
        'Reports and feeding history',
      ]
    },
    {
      icon:Sprout,
      title: 'Shedding Management',
      features: [
        'Create and manage shedding records',
        'Batch shedding records',
        'Reports and shedding history',
      ]
    },
    {
      icon:User2,
      title: 'User Management',
      features: [
        'Add and manage multiple users',
        'Customize access levels per user',
      ]
    },
    {
      icon:MonitorSmartphone,
      title: 'Cross Platform',
      features: [
        'Installable on Windows, Mac, Linux and Android',
        'Sync data across all devices',
      ]
    }
  ]
  
  export const PLANS_LIST = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for hobbyists managing a small collection',
      price: 4.99,
      badge: 'Get Started',
      features: [
        'Manage up to 50 reptiles',
        'Basic health tracking',
        'Breeding records',
        'Growth Analytics',
        'Pedigree analysis', 
      ]
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 9.99,
      badge: 'Most Popular',
      recommended: true,
      description: 'Enhanced tracking for serious keepers',
      features: [
        'Manage up to 999 reptiles',
        'Advanced health tracking',
        'Breeding records',
        'Growth analytics',
        'Pedigree analysis',
        'Premium support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      badge: 'Best Value',
      description: 'Complete solution for breeders & facilities',
      features: [
        'Unlimited reptiles',
        'Complete genetic tracking',
        'Advanced breeding projects',
        'Full analytics dashboard',
        'User management',
        'Pedigree analysis',
        'Priority support'
      ]
    }
  ]