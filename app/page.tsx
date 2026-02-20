"use client"

import { useState, useEffect } from "react"
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

// Re-export PromoBook for other components
export type { PromoBook }

export type { PromoConfig }
export interface PromoConfig {
  id: string
  currentPrice: number | null
  promotionType: PromotionType
  promotionValue: number | null
  minQuantity: number | null
  moq: number | null // Minimum Order Quantity
  som: number | null // Standard Order Multiple
  startDate: string | null
  endDate: string | null
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
    gamme: "M" as "M" | "D",
    promoConfigs: [
      {
        id: "pc1",
        currentPrice: 129.99,
        promotionType: "absolute" as PromotionType,
        promotionValue: 20,
        minQuantity: null,
        moq: 10,
        som: 5,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        label: "Promo Été 2024",
      },
      {
        id: "pc2",
        currentPrice: 119.99,
        promotionType: "absolute" as PromotionType,
        promotionValue: 30,
        minQuantity: 5,
        moq: 20,
        som: 10,
        startDate: "2024-09-01",
        endDate: "2024-09-30",
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
    gamme: "D" as "M" | "D",
    promoConfigs: [
      {
        id: "pc3",
        currentPrice: 269.99,
        promotionType: "percentage" as PromotionType,
        promotionValue: 10,
        minQuantity: 3,
        moq: 15,
        som: 3,
        startDate: "2024-11-25",
        endDate: "2024-11-29",
        label: "Black Friday",
      },
    ],
  },
  {
    id: "P003",
    name: "Scie circulaire pro",
    category: "Outillage électrique",
    supplier: "DeWalt",
    initialPrice: 299.99,
    stock: 15,
    status: "draft",
    gamme: "D" as "M" | "D",
    promoConfigs: [
      {
        id: "pc4",
        currentPrice: 239.99,
        promotionType: "percentage" as PromotionType,
        promotionValue: 20,
        minQuantity: 3,
        moq: 15,
        som: 3,
        startDate: "2024-11-25",
        endDate: "2024-11-29",
        label: "Black Friday",
      },
      {
        id: "pc5",
        currentPrice: 254.99,
        promotionType: "absolute" as PromotionType,
        promotionValue: 45,
        minQuantity: 10,
        moq: 50,
        som: 10,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
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
    gamme: "M" as "M" | "D",
    promoConfigs: [
      {
        id: "pc6",
        currentPrice: 39.99,
        promotionType: "absolute" as PromotionType,
        promotionValue: 6,
        minQuantity: null,
        moq: 12,
        som: 6,
        startDate: "2024-03-01",
        endDate: "2024-03-31",
        label: "Printemps 2024",
      },
      {
        id: "pc7",
        currentPrice: 36.79,
        promotionType: "percentage" as PromotionType,
        promotionValue: 20,
        minQuantity: 5,
        moq: 24,
        som: 12,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        label: "Pro - Volume annuel",
      },
      {
        id: "pc8",
        currentPrice: 32.19,
        promotionType: "percentage" as PromotionType,
        promotionValue: 30,
        minQuantity: 2,
        moq: 6,
        som: 2,
        startDate: "2024-11-25",
        endDate: "2024-11-29",
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
    stock: 67,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P005",
    name: "Ponceuse orbitale 250W",
    category: "Outillage électrique",
    supplier: "DeWalt",
    initialPrice: 119.99,
    stock: 34,
    status: "draft",
    gamme: "D" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P006",
    name: "Scie sauteuse 600W",
    category: "Outillage électrique",
    supplier: "Bosch",
    initialPrice: 89.99,
    stock: 52,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P007",
    name: "Meuleuse d'angle 125mm",
    category: "Outillage électrique",
    supplier: "DeWalt",
    initialPrice: 109.99,
    stock: 41,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P008",
    name: "Cloueuse pneumatique",
    category: "Outillage électrique",
    supplier: "Makita",
    initialPrice: 249.99,
    stock: 19,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P009",
    name: "Peinture acrylique blanche 10L",
    category: "Peinture",
    supplier: "Dulux",
    initialPrice: 45.99,
    stock: 156,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P010",
    name: "Rouleau de peinture professionnel",
    category: "Peinture",
    supplier: "Dulux",
    initialPrice: 12.99,
    stock: 234,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P011",
    name: "Pinceaux assortis pack 12",
    category: "Peinture",
    supplier: "Dulux",
    initialPrice: 24.99,
    stock: 189,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P012",
    name: "Bâche de protection 4x5m",
    category: "Peinture",
    supplier: "Stanley",
    initialPrice: 8.99,
    stock: 342,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P013",
    name: "Marteau menuisier 500g",
    category: "Outillage à main",
    supplier: "Stanley",
    initialPrice: 15.99,
    stock: 98,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P014",
    name: "Set de tournevis 10 pièces",
    category: "Outillage à main",
    supplier: "Stanley",
    initialPrice: 22.99,
    stock: 145,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P015",
    name: "Niveau à bulle 60cm",
    category: "Outillage à main",
    supplier: "Bosch",
    initialPrice: 18.99,
    stock: 76,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P016",
    name: "Mètre ruban 5m",
    category: "Outillage à main",
    supplier: "Stanley",
    initialPrice: 9.99,
    stock: 267,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P017",
    name: "Serre-joints rapides 30cm lot de 2",
    category: "Outillage à main",
    supplier: "Wolfcraft",
    initialPrice: 16.99,
    stock: 112,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P018",
    name: "Carrelage sol 30x30 blanc",
    category: "Carrelage",
    supplier: "Leroy",
    initialPrice: 1.99,
    stock: 1850,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P019",
    name: "Carrelage mural 20x20 beige",
    category: "Carrelage",
    supplier: "Leroy",
    initialPrice: 1.49,
    stock: 2340,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P020",
    name: "Colle carrelage 25kg",
    category: "Carrelage",
    supplier: "Weber",
    initialPrice: 14.99,
    stock: 287,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P021",
    name: "Joint carrelage gris 5kg",
    category: "Carrelage",
    supplier: "Weber",
    initialPrice: 9.99,
    stock: 456,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P022",
    name: "Parquet stratifié chêne clair m²",
    category: "Revêtement de sol",
    supplier: "Quick-Step",
    initialPrice: 12.99,
    stock: 890,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P023",
    name: "Moquette aiguilletée grise m²",
    category: "Revêtement de sol",
    supplier: "Tarkett",
    initialPrice: 5.99,
    stock: 1230,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P024",
    name: "Lino imitation bois m²",
    category: "Revêtement de sol",
    supplier: "Tarkett",
    initialPrice: 8.99,
    stock: 678,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P025",
    name: "Sous-couche parquet 3mm rouleau",
    category: "Revêtement de sol",
    supplier: "Quick-Step",
    initialPrice: 19.99,
    stock: 234,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P026",
    name: "Plaque de plâtre BA13 2.5m",
    category: "Matériaux de construction",
    supplier: "Placo",
    initialPrice: 7.99,
    stock: 567,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P027",
    name: "Rail métallique 3m",
    category: "Matériaux de construction",
    supplier: "Placo",
    initialPrice: 4.99,
    stock: 789,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P028",
    name: "Laine de verre 100mm rouleau",
    category: "Isolation",
    supplier: "Isover",
    initialPrice: 29.99,
    stock: 345,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P029",
    name: "Polystyrène extrudé 60mm panneau",
    category: "Isolation",
    supplier: "Isover",
    initialPrice: 15.99,
    stock: 456,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
  {
    id: "P030",
    name: "Robinet mélangeur lavabo chromé",
    category: "Plomberie",
    supplier: "Grohe",
    initialPrice: 69.99,
    stock: 87,
    status: "draft",
    gamme: "M" as "M" | "D",
    promoConfigs: [],
  },
]

export type Product = (typeof MOCK_PRODUCTS)[0]

// Product Group / Palette type
export interface ProductGroup {
  id: string
  name: string
  description: string
  category: string
  productIds: string[] // References to products in this group
  products: Product[] // Actual product objects for display
  totalPrice: number // Sum of all product prices
  stock: number // Minimum stock across all products
  status: "draft" | "validated"
  gamme: "M" | "D"
  promoConfigs: PromoConfig[]
}

// Mock data for Product Groups
const MOCK_PRODUCT_GROUPS: ProductGroup[] = [
  {
    id: "PG001",
    name: "Pack Outillage Pro Bosch",
    description: "Ensemble complet d'outillage électrique professionnel",
    category: "Outillage électrique",
    productIds: ["P001", "P002", "P003"],
    products: [],
    totalPrice: 449.97,
    stock: 25,
    status: "draft",
    gamme: "M",
    promoConfigs: [
      {
        id: "pgc1",
        currentPrice: 399.99,
        promotionType: "absolute",
        promotionValue: 49.98,
        minQuantity: 1,
        moq: 5,
        som: 1,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        label: "Pack Été Professionnel",
      },
    ],
  },
  {
    id: "PG002",
    name: "Palette Peinture Murale 50L",
    description: "Palette de 50L de peinture murale blanche haute qualité",
    category: "Peinture",
    productIds: ["P008", "P009", "P010"],
    products: [],
    totalPrice: 249.95,
    stock: 120,
    status: "draft",
    gamme: "M",
    promoConfigs: [
      {
        id: "pgc2",
        currentPrice: 199.99,
        promotionType: "percentage",
        promotionValue: 20,
        minQuantity: 1,
        moq: 10,
        som: 5,
        startDate: "2024-05-01",
        endDate: "2024-06-30",
        label: "Promo Palette Printemps",
      },
    ],
  },
  {
    id: "PG003",
    name: "Ensemble Carrelage Salle de Bain",
    description: "Kit complet carrelage + joint pour salle de bain 10m²",
    category: "Carrelage",
    productIds: ["P019", "P020", "P021"],
    products: [],
    totalPrice: 159.97,
    stock: 45,
    status: "draft",
    gamme: "D",
    promoConfigs: [],
  },
  {
    id: "PG004",
    name: "Pack Revêtement Sol Complet",
    description: "Ensemble parquet + sous-couche + accessoires pour 20m²",
    category: "Revêtement de sol",
    productIds: ["P022", "P023", "P024"],
    products: [],
    totalPrice: 549.77,
    stock: 67,
    status: "draft",
    gamme: "M",
    promoConfigs: [
      {
        id: "pgc4",
        currentPrice: 479.99,
        promotionType: "absolute",
        promotionValue: 69.78,
        minQuantity: 1,
        moq: 3,
        som: 1,
        startDate: "2024-07-01",
        endDate: "2024-09-30",
        label: "Offre Rénovation",
      },
    ],
  },
  {
    id: "PG005",
    name: "Palette Quincaillerie Pro",
    description: "Assortiment de quincaillerie pour professionnels - 500 pièces",
    category: "Quincaillerie",
    productIds: ["P004", "P005", "P006"],
    products: [],
    totalPrice: 189.97,
    stock: 89,
    status: "validated",
    gamme: "D",
    promoConfigs: [],
  },
]

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [productGroups, setProductGroups] = useState<ProductGroup[]>(MOCK_PRODUCT_GROUPS)
  const [viewMode, setViewMode] = useState<"products" | "groups">("products")
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [listStatus, setListStatus] = useState<"draft" | "pending" | "validated">("draft")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  // PromoBook state
  const [promoBookPanelOpen, setPromoBookPanelOpen] = useState(false)
  const [activePromoBook, setActivePromoBook] = useState<PromoBook | null>(null)
  const [userPromoBooks, setUserPromoBooks] = useState<PromoBook[]>([])
  const [tableResetKey, setTableResetKey] = useState(0)
  const [promoBookProductIds, setPromoBookProductIds] = useState<Set<string>>(new Set())
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Count modified products (products with any promotion applied)
  const modifiedProductsCount = products.filter(
    (p) => p.currentPrice !== null || p.promotionType !== null
  ).length

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && activePromoBook) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges, activePromoBook])

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
  const handleAddToPromoBook = (productId: string) => {
    setPromoBookProductIds((prev) => {
      const newSet = new Set(prev)
      newSet.add(productId)
      return newSet
    })
    setHasUnsavedChanges(true)
  }

  const handleRemoveFromPromoBook = (productId: string) => {
    setPromoBookProductIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })
    setHasUnsavedChanges(true)
  }

  const handleImportProducts = (importedProducts: Product[]) => {
    // Add imported products to the existing products list
    setProducts((prev) => [...prev, ...importedProducts])
  }

  const handleSavePromoBook = () => {
    if (!activePromoBook) return
    
    // Save logic here - for now just mark as saved
    setHasUnsavedChanges(false)
    
    // Update the active promobook with current products
    const updatedPromoBook = {
      ...activePromoBook,
      products: Array.from(promoBookProductIds).map((productId) => {
        const product = products.find((p) => p.id === productId)
        return {
          productId,
          currentPrice: product?.currentPrice || null,
          promotionType: product?.promotionType || null,
          promotionValue: product?.promotionValue || null,
          minQuantity: product?.minQuantity || null,
          startDate: product?.startDate || null,
          endDate: product?.endDate || null,
          gamme: product?.gamme || "M",
        }
      }),
      productCount: promoBookProductIds.size,
    }
    
    // Update in userPromoBooks if it exists there
    setUserPromoBooks((prev) =>
      prev.map((pb) => (pb.id === activePromoBook.id ? updatedPromoBook : pb))
    )
    setActivePromoBook(updatedPromoBook)
  }

  const handleActivatePromoBook = (promoBook: PromoBook) => {
    console.log("[v0] Activating PromoBook:", promoBook.name)
    console.log("[v0] Products to restore:", promoBook.products.length)
    console.log("[v0] Filters:", promoBook.filters)
    console.log("[v0] Sorts:", promoBook.sorts)
    
    setActivePromoBook(promoBook)
    setPromoBookProductIds(new Set(promoBook.products.map((p) => p.productId)))
    setHasUnsavedChanges(false)
    
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
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        "Vous avez des modifications non sauvegardées. Voulez-vous vraiment fermer le PromoBook ?"
      )
      if (!confirmClose) return
    }
    setActivePromoBook(null)
    setPromoBookProductIds(new Set())
    setHasUnsavedChanges(false)
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
                <Button 
                  onClick={activePromoBook ? handleSavePromoBook : handleValidate} 
                  size="sm" 
                  disabled={activePromoBook ? !hasUnsavedChanges : listStatus === "validated"}
                  variant={activePromoBook && hasUnsavedChanges ? "default" : "outline"}
                  className="relative"
                >
                  <Save className="mr-2 size-4" />
                  Valider les modifications
                  {activePromoBook && hasUnsavedChanges && (
                    <span className="ml-2 size-2 rounded-full bg-destructive" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="size-5" />
                </Button>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                  <Bell className="size-5" />
                  <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full"></span>
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
            activePromoBook={activePromoBook}
            promoBookProductIds={promoBookProductIds}
            onAddToPromoBook={handleAddToPromoBook}
            onRemoveFromPromoBook={handleRemoveFromPromoBook}
            hasUnsavedChanges={hasUnsavedChanges}
            onSavePromoBook={handleSavePromoBook}
            onImportProducts={handleImportProducts}
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
