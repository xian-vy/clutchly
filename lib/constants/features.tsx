import { Building2, Database, Dna, Globe, Heart, LineChart, MonitorSmartphone, Network, Package, Sprout, Worm } from 'lucide-react'
import { MdCurrencyExchange } from "react-icons/md";

export const FEATURE_LIST = [
    {
      icon: Database,
      title: 'Comprehensive Data Management',
      features: [
        'Reptile biological and genetic data management',
        'Complete lineage and acquisition history',
        'Upload existing records with intuitive import and export feature'
      ]
    },
    {
      icon: Globe,
      title: 'Free Website for your Store',
      features: [
        'Free URL link for your store/collections',
        'Showcase your featured reptiles and share your website to socials',
        'Customizable with minimal setup, list reptile directly from your collection',
      ]
    },
    {
      icon: Dna,
      title: 'Breeding and Lineage Management',
      features: [
        'AI-assisted breeding outcome predictions',
        'Manage breeding, clutch and hatchling records',
        'Comprehensive breeding, pair and offspring phenotype analysis'
      ]
    },
    {
      icon: MdCurrencyExchange,
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
        'Interactive pedigree tree visualization for ancestral tracking',
        'Visualize lineage genetic traits at a glance',
      ]
    },
  
    {
      icon: Worm,
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
      icon:Building2,
      title: 'Organization Management',
      features: [
        'Manage multiple staffs, admins in your organization/facility.',
        'Customize access levels and permission for each user',
      ]
    },
    {
      icon:MonitorSmartphone,
      title: 'Cross Platform',
      features: [
        'Installable on any devices: Windows, Mac, and Android',
        "Lightweight (< 1mb) for fast installation and minimal storage use."
      ]
    }
  ]
  
  export const PLANS_LIST = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for hobbyists managing a small collection',
      price: 4.99,
      badge: 'Get Started',
      features: [
        'Manage up to 99 reptiles',
        'Reptile Management',
        'Health Tracking',
        'Breeding Management',
        'Growth Management',
        'Feeding Management',
        'Shedding Management',
        'Finance Tracker',
        'Organization Management'
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
        'Manage up to 499 reptiles',
        'Reptile Management',
        'Health Tracking',
        'Breeding Management',
        'Growth Management',
        'Feeding Management',
        'Shedding Management',
        'Finance Tracker',
        'Organization Management'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      badge: 'Best Value',
      description: 'Complete solution for breeders & facilities',
      features: [
        'Manage up to 1499 reptiles',
        'Reptile Management',
        'Health Tracking',
        'Breeding Management',
        'Growth Management',
        'Feeding Management',
        'Shedding Management',
        'Finance Tracker',
        'Organization Management'
      ]
    }
  ]