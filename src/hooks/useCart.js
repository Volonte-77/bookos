import { useCartContext } from '../context/CartContext.jsx'

export default function useCart() {
  return useCartContext()
}
