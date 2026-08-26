import { Building2, CircleAlert, Package, ReceiptText, Store, Users, type LucideIcon } from 'lucide-react'

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
    title: 'Cage ERP Simulador',
    items: [
      { label: 'Clientes', path: '/clientes', icon: Users },
      { label: 'Unidades', path: '/unidades', icon: Building2 },
      { label: 'CageOuts', path: '/cageouts', icon: Store },
      { label: 'Produtos', path: '/produtos', icon: Package },
    ],
  },
  {
    title: 'Relatórios',
    items: [
      { label: 'Vendas', path: '/relatorios/vendas', icon: ReceiptText },
      { label: 'Rejeitos', path: '/relatorios/rejeitos', icon: CircleAlert },
    ],
  },
]
