"use client"

import { useState } from "react"
import { ProductTable } from "@/components/product-table"
import { ProductTableV2 } from "@/components/product-table-v2"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Save, HelpCircle, Bell } from "lucide-react"
import {
  PromoBookPanel,
  PromoBookButton,
  ActivePromoBookBanner,
  type PromoBook,
  type PromoBookProduct,
} from "@/components/promobook-panel"

// Types
export type PromotionType = "absolute" | "percentage" | "free" | null

export type { PromoConfig }
export interface PromoConfig {
  id: string
  currentPrice: number | null
  promotionType: PromotionType
  promotionValue: number | null
  minQuantity: number | null
  startDate: string | null
  endDate: string | null
  gamme: "M" | "D"
  label?: string // Optional label like "Promo Été", "Black Friday", etc.
}

// Mock data
const MOCK_PRODUCTS = [
  {
    id: "P001",
    name: "Perceuse sans fil 18V",
    category: "Outillage électrique",
    supplier: "Bosch",
    initialPrice: 149.99,
    stock: 45,
    status: "draft",
    promoConfigs: [
      {
        id: "pc1",
        currentPrice: 129.99,
        promotionType: "absolute" as PromotionType,
        promotionValue: 20,
        minQuantity: null,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        gamme: "M" as "M" | "D",
        label: "Promo Été 2024",
      },
      {
        id: "pc2",
        currentPrice: 119.99,
        promotionType: "absolute" as PromotionType,
        promotionValue: 30,
        minQuantity: 5,
        startDate: "2024-09-01",
        endDate: "2024-09-30",
        gamme: "M" as "M" | "D",
        label: "Achat en volume",
      },
    ],
  },
  {
    id: "P002",
    name: "Marteau piqueur 1500W",
    category: "Outillage électrique",
    supplier: "Bosch",
    initialPrice: 299.99,
    stock: 12,
    status: "draft",
    promoConfigs: [
      {
        id: "pc3",
        currentPrice: 269.99,
        promotionType: "absolute" as PromotionType,
        promotionValue: 30,
        minQuantity: null,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        gamme: "D" as "M" | "D",
        label: "Promo Été 2024",
      },
      {
        id: "pc4",
        currentPrice: 239.99,
        promotionType: "percentage" as PromotionType,
        promotionValue: 20,
        minQuantity: 3,
        startDate: "2024-11-25",
        endDate: "2024-11-29",
        gamme: "D" as "M" | "D",
        label: "Black Friday",
      },
      {
        id: "pc5",
        currentPrice: 254.99,
        promotionType: "absolute" as PromotionType,
        promotionValue: 45,
        minQuantity: 10,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        gamme: "D" as "M" | "D",
        label: "Pro - Volume",
      },
    ],
  },
  {
    id: "P009",
    name: "Peinture murale blanche 10L",
    category: "Peinture",
    supplier: "Dulux",
    initialPrice: 45.99,
    stock: 89,
    status: "draft",
    promoConfigs: [
      {
        id: "pc6",
        currentPrice: 39.99,
        promotionType: "absolute" as PromotionType,
        promotionValue: 6,
        minQuantity: null,
        startDate: "2024-03-01",
        endDate: "2024-03-31",
        gamme: "M" as "M" | "D",
        label: "Printemps 2024",
      },
      {
        id: "pc7",
        currentPrice: 36.79,
        promotionType: "percentage" as PromotionType,
        promotionValue: 20,
        minQuantity: 5,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        gamme: "M" as "M" | "D",
        label: "Pro - Volume annuel",
      },
      {
        id: "pc8",
        currentPrice: 32.19,
        promotionType: "percentage" as PromotionType,
        promotionValue: 30,
        minQuantity: 2,
        startDate: "2024-11-25",
        endDate: "2024-11-29",
        gamme: "D" as "M" | "D",
        label: "Black Friday",
      },
    ],
  },
  {
    id: "P004",
    name: "Tournevis électrique",
    category: "Outillage électrique",
    supplier: "Makita",
    initialPrice: 79.99,
    currentPrice: null as number | null,
    stock: 67,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P005",
    name: "Ponceuse orbitale 250W",
    category: "Outillage électrique",
    supplier: "DeWalt",
    initialPrice: 119.99,
    currentPrice: null as number | null,
    stock: 34,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P006",
    name: "Scie sauteuse 600W",
    category: "Outillage électrique",
    supplier: "Bosch",
    initialPrice: 89.99,
    currentPrice: null as number | null,
    stock: 52,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P007",
    name: "Meuleuse d'angle 125mm",
    category: "Outillage électrique",
    supplier: "DeWalt",
    initialPrice: 109.99,
    currentPrice: null as number | null,
    stock: 41,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P008",
    name: "Cloueuse pneumatique",
    category: "Outillage électrique",
    supplier: "Makita",
    initialPrice: 249.99,
    currentPrice: null as number | null,
    stock: 19,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P009",
    name: "Peinture acrylique blanche 10L",
    category: "Peinture",
    supplier: "Dulux",
    initialPrice: 45.99,
    currentPrice: null as number | null,
    stock: 156,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P010",
    name: "Rouleau de peinture professionnel",
    category: "Peinture",
    supplier: "Dulux",
    initialPrice: 12.99,
    currentPrice: null as number | null,
    stock: 234,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P011",
    name: "Pinceaux assortis pack 12",
    category: "Peinture",
    supplier: "Dulux",
    initialPrice: 24.99,
    currentPrice: null as number | null,
    stock: 189,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P012",
    name: "Bâche de protection 4x5m",
    category: "Peinture",
    supplier: "Stanley",
    initialPrice: 8.99,
    currentPrice: null as number | null,
    stock: 342,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P013",
    name: "Marteau menuisier 500g",
    category: "Outillage à main",
    supplier: "Stanley",
    initialPrice: 15.99,
    currentPrice: null as number | null,
    stock: 98,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P014",
    name: "Set de tournevis 10 pièces",
    category: "Outillage à main",
    supplier: "Stanley",
    initialPrice: 22.99,
    currentPrice: null as number | null,
    stock: 145,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P015",
    name: "Niveau à bulle 60cm",
    category: "Outillage à main",
    supplier: "Bosch",
    initialPrice: 18.99,
    currentPrice: null as number | null,
    stock: 76,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P016",
    name: "Mètre ruban 5m",
    category: "Outillage à main",
    supplier: "Stanley",
    initialPrice: 9.99,
    currentPrice: null as number | null,
    stock: 267,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P017",
    name: "Serre-joints rapides 30cm lot de 2",
    category: "Outillage à main",
    supplier: "Wolfcraft",
    initialPrice: 16.99,
    currentPrice: null as number | null,
    stock: 112,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P018",
    name: "Carrelage sol 30x30 blanc",
    category: "Carrelage",
    supplier: "Leroy",
    initialPrice: 1.99,
    currentPrice: null as number | null,
    stock: 1850,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P019",
    name: "Carrelage mural 20x20 beige",
    category: "Carrelage",
    supplier: "Leroy",
    initialPrice: 1.49,
    currentPrice: null as number | null,
    stock: 2340,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P020",
    name: "Colle carrelage 25kg",
    category: "Carrelage",
    supplier: "Weber",
    initialPrice: 14.99,
    currentPrice: null as number | null,
    stock: 287,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P021",
    name: "Joint carrelage gris 5kg",
    category: "Carrelage",
    supplier: "Weber",
    initialPrice: 9.99,
    currentPrice: null as number | null,
    stock: 456,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P022",
    name: "Parquet stratifié chêne clair m²",
    category: "Revêtement de sol",
    supplier: "Quick-Step",
    initialPrice: 12.99,
    currentPrice: null as number | null,
    stock: 890,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P023",
    name: "Moquette aiguilletée grise m²",
    category: "Revêtement de sol",
    supplier: "Tarkett",
    initialPrice: 5.99,
    currentPrice: null as number | null,
    stock: 1230,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P024",
    name: "Lino imitation bois m²",
    category: "Revêtement de sol",
    supplier: "Tarkett",
    initialPrice: 8.99,
    currentPrice: null as number | null,
    stock: 678,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P025",
    name: "Sous-couche parquet 3mm rouleau",
    category: "Revêtement de sol",
    supplier: "Quick-Step",
    initialPrice: 19.99,
    currentPrice: null as number | null,
    stock: 234,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P026",
    name: "Plaque de plâtre BA13 2.5m",
    category: "Matériaux de construction",
    supplier: "Placo",
    initialPrice: 7.99,
    currentPrice: null as number | null,
    stock: 567,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P027",
    name: "Rail métallique 3m",
    category: "Matériaux de construction",
    supplier: "Placo",
    initialPrice: 4.99,
    currentPrice: null as number | null,
    stock: 789,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P028",
    name: "Laine de verre 100mm rouleau",
    category: "Isolation",
    supplier: "Isover",
    initialPrice: 29.99,
    currentPrice: null as number | null,
    stock: 345,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P029",
    name: "Polystyrène extrudé 60mm panneau",
    category: "Isolation",
    supplier: "Isover",
    initialPrice: 15.99,
    currentPrice: null as number | null,
    stock: 456,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
  {
    id: "P030",
    name: "Robinet mélangeur lavabo chromé",
    category: "Plomberie",
    supplier: "Grohe",
    initialPrice: 69.99,
    currentPrice: null as number | null,
    stock: 87,
    status: "draft",
    promotionType: null as PromotionType,
    promotionValue: null as number | null,
    minQuantity: null as number | null,
    startDate: null as string | null,
    endDate: null as string | null,
    gamme: "M" as "M" | "D",
  },
]

export type Product = (typeof MOCK_PRODUCTS)[0]

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [listStatus, setListStatus] = useState<"draft" | "pending" | "validated">("draft")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  // PromoBook state
  const [promoBookPanelOpen, setPromoBookPanelOpen] = useState(false)
  const [activePromoBook, setActivePromoBook] = useState<PromoBook | null>(null)
  const [userPromoBooks, setUserPromoBooks] = useState<PromoBook[]>([])
  const [tableResetKey, setTableResetKey] = useState(0)

  // Count modified products (products with any promotion applied)
  const modifiedProductsCount = products.filter(
    (p) => p.currentPrice !== null || p.promotionType !== null
  ).length

  const handlePriceChange = (productId: string, newPrice: number) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, currentPrice: newPrice } : p)))
  }

  const handleDifferenceChange = (
    productId: string,
    differenceValue: number,
    type: PromotionType,
    value: number | null,
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p
        const newPrice = Math.max(0, p.initialPrice + differenceValue)
        return {
          ...p,
          currentPrice: Number(newPrice.toFixed(2)),
          promotionType: type,
          promotionValue: value,
        }
      }),
    )
  }

  const handleMinQuantityChange = (productId: string, minQty: number | null) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, minQuantity: minQty } : p)))
  }

  const handleDateChange = (productId: string, field: "startDate" | "endDate", date: string | null) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, [field]: date } : p)))
  }

  const handleBulkPromotion = (type: PromotionType, value?: number) => {
    if (selectedProducts.size === 0) return

    setProducts((prev) =>
      prev.map((p) => {
        if (!selectedProducts.has(p.id)) return p

        let newPrice = p.initialPrice
        if (type === "absolute" && value) {
          newPrice = Math.max(0, p.initialPrice - value)
        } else if (type === "percentage" && value) {
          newPrice = p.initialPrice * (1 - value / 100)
        } else if (type === "free") {
          newPrice = 0
        }

        return {
          ...p,
          currentPrice: Number(newPrice.toFixed(2)),
          promotionType: type,
          promotionValue: value || null,
        }
      }),
    )
    return selectedProducts.size
  }

  const handleBulkMinQuantity = (minQty: number | null) => {
    if (selectedProducts.size === 0) return 0
    setProducts((prev) =>
      prev.map((p) => (selectedProducts.has(p.id) ? { ...p, minQuantity: minQty } : p)),
    )
    return selectedProducts.size
  }

  const handleBulkStartDate = (date: string | null) => {
    if (selectedProducts.size === 0) return 0
    setProducts((prev) =>
      prev.map((p) => (selectedProducts.has(p.id) ? { ...p, startDate: date } : p)),
    )
    return selectedProducts.size
  }

  const handleBulkEndDate = (date: string | null) => {
    if (selectedProducts.size === 0) return 0
    setProducts((prev) =>
      prev.map((p) => (selectedProducts.has(p.id) ? { ...p, endDate: date } : p)),
    )
    return selectedProducts.size
  }

  const handleGammeChange = (productId: string, gamme: "M" | "D") => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, gamme } : p)))
  }

  const handleBulkGamme = (gamme: "M" | "D") => {
    if (selectedProducts.size === 0) return 0
    setProducts((prev) =>
      prev.map((p) => (selectedProducts.has(p.id) ? { ...p, gamme } : p)),
    )
    return selectedProducts.size
  }

  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) return 0
    const count = selectedProducts.size
    setProducts((prev) => prev.filter((p) => !selectedProducts.has(p.id)))
    setSelectedProducts(new Set())
    return count
  }

  const handleValidate = () => {
    setListStatus("validated")
    setTimeout(() => {
      setProducts((prev) => prev.map((p) => ({ ...p, status: "validated" as const })))
    }, 500)
  }

  // PromoBook handlers
  const handleActivatePromoBook = (promoBook: PromoBook) => {
    console.log("[v0] Activating PromoBook:", promoBook.name)
    console.log("[v0] Products to restore:", promoBook.products.length)
    console.log("[v0] Filters:", promoBook.filters)
    console.log("[v0] Sorts:", promoBook.sorts)
    
    setActivePromoBook(promoBook)
    
    // Restore products state from the PromoBook
    if (promoBook.products.length > 0) {
      setProducts((prev) =>
        prev.map((p) => {
          const savedProduct = promoBook.products.find((sp) => sp.productId === p.id)
          if (savedProduct) {
            console.log("[v0] Restoring product:", p.id, savedProduct)
            return {
              ...p,
              currentPrice: savedProduct.currentPrice,
              promotionType: savedProduct.promotionType,
              promotionValue: savedProduct.promotionValue,
              minQuantity: savedProduct.minQuantity,
              startDate: savedProduct.startDate,
              endDate: savedProduct.endDate,
              gamme: savedProduct.gamme,
            }
          }
          return p
        })
      )
    }
    
    // Increment reset key to trigger filter/sort application
    setTableResetKey((prev) => prev + 1)
    setPromoBookPanelOpen(false)
  }

  const handleClosePromoBook = () => {
    // Save current state to the PromoBook before closing
    if (activePromoBook) {
      const modifiedProducts: PromoBookProduct[] = products
        .filter((p) => p.currentPrice !== null || p.promotionType !== null)
        .map((p) => ({
          productId: p.id,
          currentPrice: p.currentPrice,
          promotionType: p.promotionType,
          promotionValue: p.promotionValue,
          minQuantity: p.minQuantity,
          startDate: p.startDate,
          endDate: p.endDate,
          gamme: p.gamme,
        }))

      setUserPromoBooks((prev) =>
        prev.map((pb) =>
          pb.id === activePromoBook.id
            ? { ...pb, products: modifiedProducts, productCount: modifiedProducts.length }
            : pb
        )
      )
    }
    setActivePromoBook(null)
    // Reset products to initial state
    setProducts(MOCK_PRODUCTS)
    // Increment reset key to clear filters/sorts
    setTableResetKey((prev) => prev + 1)
  }

  const handleCreatePromoBook = (name: string, description: string) => {
    const modifiedProducts: PromoBookProduct[] = products
      .filter((p) => p.currentPrice !== null || p.promotionType !== null)
      .map((p) => ({
        productId: p.id,
        currentPrice: p.currentPrice,
        promotionType: p.promotionType,
        promotionValue: p.promotionValue,
        minQuantity: p.minQuantity,
        startDate: p.startDate,
        endDate: p.endDate,
        gamme: p.gamme,
      }))

    const newPromoBook: PromoBook = {
      id: `pb-${Date.now()}`,
      name,
      description: description || undefined,
      createdAt: new Date().toISOString().split("T")[0],
      owner: "Utilisateur actuel",
      productCount: modifiedProducts.length,
      tags: [],
      products: modifiedProducts,
      filters: {
        categoryTypes: [],
        supplierTypes: [],
        gammeTypes: [],
        stockRange: [0, 1000],
        initialPriceRange: [0, 500],
        currentPriceRange: [0, 500],
        reductionTypes: [],
      },
      sorts: [],
    }

    setUserPromoBooks((prev) => [newPromoBook, ...prev])
    setActivePromoBook(newPromoBook)
  }

  const handleDeletePromoBook = (id: string) => {
    setUserPromoBooks((prev) => prev.filter((pb) => pb.id !== id))
    if (activePromoBook?.id === id) {
      setActivePromoBook(null)
    }
  }

  // Promo Config handlers
  const handleAddPromoConfig = (productId: string, config: PromoConfig) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, promoConfigs: [...p.promoConfigs, config] } : p))
    )
  }

  const handleUpdatePromoConfig = (productId: string, configId: string, updates: Partial<PromoConfig>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              promoConfigs: p.promoConfigs.map((c) => (c.id === configId ? { ...c, ...updates } : c)),
            }
          : p
      )
    )
  }

  const handleDeletePromoConfig = (productId: string, configId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              promoConfigs: p.promoConfigs.filter((c) => c.id !== configId),
            }
          : p
      )
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-secondary">Gestion des Prix Fournisseurs</h1>
                <p className="mt-1 text-sm text-muted-foreground">Modification en masse des informations produits</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                <PromoBookButton
                  onClick={() => setPromoBookPanelOpen(true)}
                  activePromoBook={activePromoBook}
                  promoBookCount={userPromoBooks.length + 2}
                />
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="size-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Bell className="size-5" />
                </Button>
                <div className="h-6 w-px bg-border" />
                <Badge variant={listStatus === "validated" ? "default" : "secondary"} className="px-3 py-1">
                  {listStatus === "validated" ? (
                    <>
                      <Check className="mr-1 size-3" />
                      Validé
                    </>
                  ) : (
                    "Brouillon"
                  )}
                </Badge>
                <Button onClick={handleValidate} size="sm" disabled={listStatus === "validated"}>
                  <Save className="mr-2 size-4" />
                  Valider les modifications
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Active PromoBook Banner */}
        {activePromoBook && (
          <ActivePromoBookBanner
            promoBook={activePromoBook}
            onClose={handleClosePromoBook}
          />
        )}

        {/* Content */}
        <div className="w-full p-6">
          <ProductTableV2
            products={products}
            selectedProducts={selectedProducts}
            onSelectProducts={setSelectedProducts}
            onAddPromoConfig={handleAddPromoConfig}
            onUpdatePromoConfig={handleUpdatePromoConfig}
            onDeletePromoConfig={handleDeletePromoConfig}
          />
        </div>
      </div>

      {/* PromoBook Panel */}
      <PromoBookPanel
        isOpen={promoBookPanelOpen}
        onOpenChange={setPromoBookPanelOpen}
        activePromoBook={activePromoBook}
        onActivatePromoBook={handleActivatePromoBook}
        onClosePromoBook={handleClosePromoBook}
        onCreatePromoBook={handleCreatePromoBook}
        modifiedProductsCount={modifiedProductsCount}
        promoBooks={userPromoBooks}
        onDeletePromoBook={handleDeletePromoBook}
      />
    </div>
  )
}
