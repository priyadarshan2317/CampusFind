import {
  Smartphone,
  CreditCard,
  Wallet,
  KeyRound,
  BookOpen,
  Backpack,
  Laptop,
  Package,
} from 'lucide-react'

const ICONS = {
  Phone: Smartphone,
  'ID Card': CreditCard,
  Wallet: Wallet,
  Keys: KeyRound,
  Books: BookOpen,
  Bag: Backpack,
  Electronics: Laptop,
  Others: Package,
}

export default function CategoryIcon({ name, className }) {
  const Icon = ICONS[name] || Package
  return <Icon className={className} />
}