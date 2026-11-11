import { Building2, CircleAlert, Package, ReceiptText, Store, Users, Wifi, Workflow, type LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

export interface NavModule {
  title: string
  items: NavItem[]
}

export const navModules: NavModule[] = [
  {
    title: 'CageCloud DEMO',
    items: [
      { label: 'Clientes', path: '/clientes', icon: Users },
      { label: 'Unidades', path: '/unidades', icon: Building2 },
      { label: 'Funcionários', path: '/funcionarios', icon: Users },
      { label: 'Cage ID', path: '/cageouts', icon: Store },
      { label: 'CageCluster', path: '/cageclusters', icon: Workflow }, 
    ],
  },
  {
    title: 'Relatórios',
    items: [
      { label: 'Vendas', path: '/relatorios/vendas', icon: ReceiptText },
      { label: 'Paradas', path: '/relatorios/rejeitos', icon: CircleAlert },
      { label: 'Monitoramento', path: '/relatorios/monitoramento', icon: Wifi },
    ],
  },
  {
    title: 'Downloads',
    items: [
      { label: 'Instaladores', path: '/instaladores', icon: Package },
    ],
  },
]