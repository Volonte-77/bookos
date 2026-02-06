import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import localforage from 'localforage'
import app from '../lib/firebase.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)
const CART_STORAGE_KEY = 'bookos_cart_v1'

const normalizeId = (id) => String(id)

const readLocalCart = async () => {
  try {
    const stored = await localforage.getItem(CART_STORAGE_KEY)
    return Array.isArray(stored) ? stored : []
  } catch (error) {
    return []
  }
}

const writeLocalCart = async (items) => {
  await localforage.setItem(CART_STORAGE_KEY, items)
}

export function CartProvider({ children }) {
  const { currentUser } = useAuth()
  const db = useMemo(() => getFirestore(app), [])
  const [items, setItems] = useState([])
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    let mounted = true
    readLocalCart().then((stored) => {
      if (mounted) {
        setItems(stored)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    writeLocalCart(items)
  }, [items])

  const syncWithRemote = async () => {
    if (!currentUser) return

    setSyncing(true)
    try {
      const cartRef = collection(db, 'users', currentUser.uid, 'cart')
      const snapshot = await getDocs(cartRef)
      const remoteItems = snapshot.docs.map((docItem) => docItem.data())

      const mergedMap = new Map()
      items.forEach((item) => mergedMap.set(normalizeId(item.id), item))
      remoteItems.forEach((item) => {
        const id = normalizeId(item.id)
        if (!mergedMap.has(id)) {
          mergedMap.set(id, item)
        }
      })

      const merged = Array.from(mergedMap.values())
      const batch = writeBatch(db)
      const remoteIds = new Set(snapshot.docs.map((docItem) => docItem.id))

      merged.forEach((item) => {
        const id = normalizeId(item.id)
        batch.set(
          doc(cartRef, id),
          { ...item, id, updatedAt: serverTimestamp() },
          { merge: true },
        )
        remoteIds.delete(id)
      })

      remoteIds.forEach((id) => {
        batch.delete(doc(cartRef, id))
      })

      await batch.commit()
      setItems(merged)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      syncWithRemote()
    }
  }, [currentUser])

  const addItem = async (book) => {
    const id = normalizeId(book.id)
    const exists = items.some((item) => normalizeId(item.id) === id)
    if (exists) return

    const newItem = {
      id,
      title: book.title,
      author: book.author,
      price: book.price,
      cover: book.cover || null,
      addedAt: new Date().toISOString(),
    }

    setItems((prev) => [...prev, newItem])

    if (currentUser) {
      await setDoc(
        doc(db, 'users', currentUser.uid, 'cart', id),
        { ...newItem, updatedAt: serverTimestamp() },
        { merge: true },
      )
    }
  }

  const removeItem = async (bookId) => {
    const id = normalizeId(bookId)
    setItems((prev) => prev.filter((item) => normalizeId(item.id) !== id))

    if (currentUser) {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'cart', id))
    }
  }

  const clearCart = async () => {
    setItems([])

    if (currentUser) {
      const cartRef = collection(db, 'users', currentUser.uid, 'cart')
      const snapshot = await getDocs(cartRef)
      const batch = writeBatch(db)
      snapshot.docs.forEach((docItem) => batch.delete(docItem.ref))
      await batch.commit()
    }
  }

  const isInCart = (bookId) =>
    items.some((item) => normalizeId(item.id) === normalizeId(bookId))

  const hasPurchased = async (bookId) => {
    if (!currentUser) return false
    const purchaseId = `${currentUser.uid}_${normalizeId(bookId)}`
    const snap = await getDoc(doc(db, 'purchases', purchaseId))
    return snap.exists()
  }

  const validateCartForPurchase = async () => {
    if (!currentUser) {
      return { ok: false, blockedIds: [] }
    }

    const checks = await Promise.all(
      items.map(async (item) => ({
        id: normalizeId(item.id),
        exists: await hasPurchased(item.id),
      })),
    )

    const blockedIds = checks.filter((c) => c.exists).map((c) => c.id)
    return { ok: blockedIds.length === 0, blockedIds }
  }

  const createPurchaseRecords = async () => {
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    const validation = await validateCartForPurchase()
    if (!validation.ok) {
      return { success: false, blockedIds: validation.blockedIds }
    }

    const batch = writeBatch(db)

    items.forEach((item) => {
      const purchaseId = `${currentUser.uid}_${normalizeId(item.id)}`
      batch.set(doc(db, 'purchases', purchaseId), {
        userId: currentUser.uid,
        bookId: normalizeId(item.id),
        price: item.price,
        createdAt: serverTimestamp(),
      })
    })

    await batch.commit()
    await clearCart()

    return { success: true, blockedIds: [] }
  }

  const value = useMemo(
    () => ({
      items,
      cartCount: items.length,
      syncing,
      addItem,
      removeItem,
      clearCart,
      isInCart,
      hasPurchased,
      validateCartForPurchase,
      createPurchaseRecords,
    }),
    [items, syncing],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider')
  }
  return context
}
