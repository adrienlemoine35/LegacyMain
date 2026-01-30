"use client"

  import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Package, Sparkles, Euro, Percent, Gift, Pencil, ArrowUpDown, Filter, X, CalendarIcon, Trash2, Hash, Tags } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format, parse } from "date-fns"
import { fr } from "date-fns/locale"
import type { Product, PromotionType } from "@/app/page"

interface ProductTableProps {
  products: Product[]
  selectedProducts: Set<string>
  onSelectProducts: (selected: Set<string>) => void
  onPriceChange: (productId: string, newPrice: number) => void
  onDifferenceChange: (productId: string, differenceValue: number, type: PromotionType, value: number | null) => void
  onBulkPromotion: (type: PromotionType, value: number) => number
  onMinQuantityChange: (productId: string, minQty: number | null) => void
  onDateChange: (productId: string, field: "startDate" | "endDate", date: string | null) => void
  onGammeChange: (productId: string, gamme: "M" | "D") => void
  onBulkMinQuantity: (minQty: number) => number
  onBulkStartDate: (date: Date) => number
  onBulkEndDate: (date: Date) => number
  onBulkGamme: (gamme: "M" | "D") => number
  onBulkDelete: () => void
  initialFilters?: {
    categoryTypes?: string[]
    supplierTypes?: string[]
    gammeTypes?: ("M" | "D")[]
    stockRange?: [number, number]
    initialPriceRange?: [number, number]
    currentPriceRange?: [number, number]
    reductionTypes?: ("absolute" | "percentage" | "free")[]
  }
  initialSorts?: Array<{
    field: string
    direction: "asc" | "desc"
    priority: number
  }>
  resetKey?: number
}

type SortField = "id" | "name" | "category" | "supplier" | "gamme" | "stock" | "initialPrice" | "currentPrice"
type SortDirection = "asc" | "desc"

interface SortConfig {
  field: SortField
  direction: SortDirection
  priority: number
}

export function ProductTable({
  products,
  selectedProducts,
  onSelectProducts,
  onPriceChange,
  onDifferenceChange,
  onBulkPromotion,
  onMinQuantityChange,
  onDateChange,
  onGammeChange,
  onBulkMinQuantity,
  onBulkStartDate,
  onBulkEndDate,
  onBulkGamme,
  onBulkDelete,
  initialFilters,
  initialSorts,
  resetKey,
}: ProductTableProps) {
  const { toast } = useToast()
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [editingDifferenceId, setEditingDifferenceId] = useState<string | null>(null)
  const [editingMinQtyId, setEditingMinQtyId] = useState<string | null>(null)
  const [editingGammeId, setEditingGammeId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const [editMinQtyValue, setEditMinQtyValue] = useState<string>("")
  const [editPromotionType, setEditPromotionType] = useState<PromotionType>("absolute")

  const [promotionType, setPromotionType] = useState<PromotionType>(null)
  const [promotionValue, setPromotionValue] = useState<string>("")
  const [bulkMinQty, setBulkMinQty] = useState<string>("")
  const [bulkGamme, setBulkGamme] = useState<"M" | "D" | null>(null)
  const [bulkStartDate, setBulkStartDate] = useState<Date | undefined>(undefined)
  const [bulkEndDate, setBulkEndDate] = useState<Date | undefined>(undefined)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([])

  // Apply initial filters and sorts when resetKey changes (PromoBook loaded)
  useEffect(() => {
    if (initialFilters) {
      console.log("[v0] Applying initial filters:", initialFilters)
      if (initialFilters.categoryTypes) {
        setFilterCategoryTypes(new Set(initialFilters.categoryTypes))
      }
      if (initialFilters.supplierTypes) {
        setFilterSupplierTypes(new Set(initialFilters.supplierTypes))
      }
      if (initialFilters.gammeTypes) {
        setFilterGammeTypes(new Set(initialFilters.gammeTypes))
      }
      if (initialFilters.stockRange) {
        setFilterStockRange(initialFilters.stockRange)
      }
      if (initialFilters.initialPriceRange) {
        setFilterInitialPriceRange(initialFilters.initialPriceRange)
      }
      if (initialFilters.currentPriceRange) {
        setFilterCurrentPriceRange(initialFilters.currentPriceRange)
      }
      if (initialFilters.reductionTypes) {
        setFilterReductionTypes(new Set(initialFilters.reductionTypes))
      }
    }
    
    if (initialSorts) {
      console.log("[v0] Applying initial sorts:", initialSorts)
      setSortConfigs(
        initialSorts.map((s) => ({
          field: s.field as SortField,
          direction: s.direction,
          priority: s.priority,
        }))
      )
    }
  }, [resetKey, initialFilters, initialSorts])

  const [filterRef, setFilterRef] = useState<string>("")
  const [filterName, setFilterName] = useState<string>("")
  const [filterCategory, setFilterCategory] = useState<string>("")
  const [filterCategorySearch, setFilterCategorySearch] = useState<string>("")
  const [filterCategoryTypes, setFilterCategoryTypes] = useState<Set<string>>(new Set())
  const [filterSupplierTypes, setFilterSupplierTypes] = useState<Set<string>>(new Set())
  const [filterSupplierSearch, setFilterSupplierSearch] = useState<string>("")
  const [filterSupplier, setFilterSupplier] = useState<string>("")
  const [filterGammeTypes, setFilterGammeTypes] = useState<Set<"M" | "D">>(new Set())
  const [filterStockRange, setFilterStockRange] = useState<[number, number]>([0, 1000])
  const [filterInitialPriceRange, setFilterInitialPriceRange] = useState<[number, number]>([0, 500])
  const [filterCurrentPriceRange, setFilterCurrentPriceRange] = useState<[number, number]>([0, 500])

  const [filterReductionTypes, setFilterReductionTypes] = useState<Set<PromotionType>>(new Set())

  const allSelected = products.length > 0 && products.every((p) => selectedProducts.has(p.id))

  const stockMax = Math.max(...products.map((p) => p.stock), 1000)
  const priceMax = Math.max(...products.map((p) => Math.max(p.initialPrice, p.currentPrice ?? 0)), 500)

  const uniqueCategories = Array.from(new Set(products.map((p) => p.category)))
  const filteredCategoryList = uniqueCategories.filter((cat) =>
    cat.toLowerCase().includes(filterCategorySearch.toLowerCase()),
  )

  const uniqueSuppliers = Array.from(new Set(products.map((p) => p.supplier)))
  const filteredSupplierList = uniqueSuppliers.filter((sup) =>
    sup.toLowerCase().includes(filterSupplierSearch.toLowerCase()),
  )

  const filteredProducts = products.filter((product) => {
    if (filterRef && !product.id.toLowerCase().includes(filterRef.toLowerCase())) return false
    if (filterName && !product.name.toLowerCase().includes(filterName.toLowerCase())) return false
    if (filterCategory && !product.category.toLowerCase().includes(filterCategory.toLowerCase())) return false
    if (filterCategoryTypes.size > 0 && !filterCategoryTypes.has(product.category)) return false
    if (filterSupplierTypes.size > 0 && !filterSupplierTypes.has(product.supplier)) return false
    if (filterSupplier && !product.supplier.toLowerCase().includes(filterSupplier.toLowerCase())) return false
    if (filterGammeTypes.size > 0 && product.gamme && !filterGammeTypes.has(product.gamme)) return false
    if (product.stock < filterStockRange[0] || product.stock > filterStockRange[1]) return false
    if (product.initialPrice < filterInitialPriceRange[0] || product.initialPrice > filterInitialPriceRange[1])
      return false
    if (product.currentPrice !== null && (product.currentPrice < filterCurrentPriceRange[0] || product.currentPrice > filterCurrentPriceRange[1]))
      return false
    if (filterReductionTypes.size > 0 && !filterReductionTypes.has(product.promotionType)) return false
    return true
  })

  const sortedProducts =
    sortConfigs.length > 0
      ? [...filteredProducts].sort((a, b) => {
          for (const config of sortConfigs) {
            const aVal = a[config.field]
            const bVal = b[config.field]
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
            if (comparison !== 0) {
              return config.direction === "asc" ? comparison : -comparison
            }
          }
          return 0
        })
      : filteredProducts

  const handleSort = (field: SortField) => {
    const existingIndex = sortConfigs.findIndex((s) => s.field === field)

    if (existingIndex >= 0) {
      const existing = sortConfigs[existingIndex]
      if (existing.direction === "asc") {
        // Change to desc
        const newConfigs = [...sortConfigs]
        newConfigs[existingIndex] = { ...existing, direction: "desc" }
        setSortConfigs(newConfigs)
      } else {
        // Remove this sort
        setSortConfigs(sortConfigs.filter((_, i) => i !== existingIndex))
      }
    } else {
      // Add new sort
      setSortConfigs([...sortConfigs, { field, direction: "asc", priority: sortConfigs.length + 1 }])
    }
  }

  const clearFilters = () => {
    setFilterRef("")
    setFilterName("")
    setFilterCategory("")
    setFilterCategoryTypes(new Set())
    setFilterCategorySearch("")
    setFilterSupplierTypes(new Set())
    setFilterSupplierSearch("")
    setFilterSupplier("")
    setFilterGammeTypes(new Set())
    setFilterStockRange([0, stockMax])
    setFilterInitialPriceRange([0, priceMax])
    setFilterCurrentPriceRange([0, priceMax])
    setFilterReductionTypes(new Set())
  }

  const hasActiveFilters =
    filterRef ||
    filterName ||
    filterCategory ||
    filterCategoryTypes.size > 0 ||
    filterSupplierTypes.size > 0 ||
    filterSupplier ||
    filterGammeTypes.size > 0 ||
    filterStockRange[0] > 0 ||
    filterStockRange[1] < stockMax ||
    filterInitialPriceRange[0] > 0 ||
    filterInitialPriceRange[1] < priceMax ||
    filterCurrentPriceRange[0] > 0 ||
    filterCurrentPriceRange[1] < priceMax ||
    filterReductionTypes.size > 0

  // Active filters list for display chips
  const activeFilters: Array<{ label: string; onRemove: () => void }> = []

  if (filterRef) activeFilters.push({ label: `Référence: ${filterRef}`, onRemove: () => setFilterRef("") })
  if (filterName) activeFilters.push({ label: `Nom: ${filterName}`, onRemove: () => setFilterName("") })

  filterCategoryTypes.forEach((cat) => {
    activeFilters.push({
      label: `Rayon: ${cat}`,
      onRemove: () => {
        const newSet = new Set(filterCategoryTypes)
        newSet.delete(cat)
        setFilterCategoryTypes(newSet)
      },
    })
  })

  filterSupplierTypes.forEach((sup) => {
    activeFilters.push({
      label: `Fournisseur: ${sup}`,
      onRemove: () => {
        const newSet = new Set(filterSupplierTypes)
        newSet.delete(sup)
        setFilterSupplierTypes(newSet)
      },
    })
  })

  filterGammeTypes.forEach((gamme) => {
    activeFilters.push({
      label: `Gamme: ${gamme}`,
      onRemove: () => {
        const newSet = new Set(filterGammeTypes)
        newSet.delete(gamme)
        setFilterGammeTypes(newSet)
      },
    })
  })

  if (filterStockRange[0] > 0 || filterStockRange[1] < stockMax) {
    activeFilters.push({
      label: `Stock: ${filterStockRange[0]}-${filterStockRange[1]}`,
      onRemove: () => setFilterStockRange([0, stockMax]),
    })
  }

  if (filterInitialPriceRange[0] > 0 || filterInitialPriceRange[1] < priceMax) {
    activeFilters.push({
      label: `Prix Avant: ${filterInitialPriceRange[0]}€-${filterInitialPriceRange[1]}€`,
      onRemove: () => setFilterInitialPriceRange([0, priceMax]),
    })
  }

  if (filterCurrentPriceRange[0] > 0 || filterCurrentPriceRange[1] < priceMax) {
    activeFilters.push({
      label: `Prix Après: ${filterCurrentPriceRange[0]}€-${filterCurrentPriceRange[1]}€`,
      onRemove: () => setFilterCurrentPriceRange([0, priceMax]),
    })
  }

  filterReductionTypes.forEach((type) => {
    const label = type === "absolute" ? "Nette" : type === "percentage" ? "Pourcentage" : "Gratuité"
    activeFilters.push({
      label: `Réduction: ${label}`,
      onRemove: () => {
        const newSet = new Set(filterReductionTypes)
        newSet.delete(type)
        setFilterReductionTypes(newSet)
      },
    })
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectProducts(new Set(sortedProducts.map((p) => p.id)))
    } else {
      onSelectProducts(new Set())
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts)
    if (checked) {
      newSelected.add(productId)
    } else {
      newSelected.delete(productId)
    }
    onSelectProducts(newSelected)
  }

  const handleStartEditPrice = (product: Product) => {
    setEditingPriceId(product.id)
    setEditValue(product.currentPrice?.toString() ?? "")
  }

  const handleSaveEditPrice = (productId: string) => {
    const newPrice = Number.parseFloat(editValue)
    if (!isNaN(newPrice) && newPrice >= 0) {
      onPriceChange(productId, newPrice)
    }
    setEditingPriceId(null)
  }

  const handleStartEditDifference = (product: Product) => {
    setEditingDifferenceId(product.id)
    const diff = (product.currentPrice ?? product.initialPrice) - product.initialPrice
    setEditValue(Math.abs(diff).toFixed(2))
    setEditPromotionType(product.promotionType || "absolute")
  }

  const handleSaveEditDifference = (productId: string) => {
    const value = Number.parseFloat(editValue)
    if (isNaN(value) && editPromotionType !== "free") return

    const product = sortedProducts.find((p) => p.id === productId)
    if (!product) return

    let differenceValue = 0

    if (editPromotionType === "free") {
      differenceValue = -product.initialPrice
    } else if (editPromotionType === "percentage") {
      differenceValue = -(product.initialPrice * value) / 100
    } else {
      // absolute
      differenceValue = -value
    }

    onDifferenceChange(productId, differenceValue, editPromotionType, editPromotionType === "free" ? null : value)
    setEditingDifferenceId(null)
  }

  const handleCancelEditDifference = () => {
    setEditingDifferenceId(null)
  }

  const handleStartEditMinQty = (product: Product) => {
    setEditingMinQtyId(product.id)
    setEditMinQtyValue(product.minQuantity?.toString() || "")
  }

  const handleSaveEditMinQty = (productId: string) => {
    const value = editMinQtyValue ? Number.parseInt(editMinQtyValue) : null
    onMinQuantityChange(productId, value)
    setEditingMinQtyId(null)
  }

  const handleStartEditGamme = (product: Product) => {
    setEditingGammeId(product.id)
  }

  const handleGammeChange = (productId: string, gamme: "M" | "D") => {
    onGammeChange(productId, gamme)
    setEditingGammeId(null)
  }

  const handleCancelEditGamme = () => {
    setEditingGammeId(null)
  }

  const handleApplyBulkPromotion = () => {
    if (!promotionType) return
    const value = promotionValue ? Number.parseFloat(promotionValue) : undefined
    onBulkPromotion(promotionType, value)
    setPromotionValue("")
    setPromotionType(null)
  }

  const handleToggleCategoryFilter = (category: string) => {
    const newSet = new Set(filterCategoryTypes)
    if (newSet.has(category)) {
      newSet.delete(category)
    } else {
      newSet.add(category)
    }
    setFilterCategoryTypes(newSet)
  }

  const handleToggleSupplierFilter = (supplier: string) => {
    const newSet = new Set(filterSupplierTypes)
    if (newSet.has(supplier)) {
      newSet.delete(supplier)
    } else {
      newSet.add(supplier)
    }
    setFilterSupplierTypes(newSet)
  }

  const handleToggleReductionFilter = (type: PromotionType) => {
    const newSet = new Set(filterReductionTypes)
    if (newSet.has(type)) {
      newSet.delete(type)
    } else {
      newSet.add(type)
    }
    setFilterReductionTypes(newSet)
  }

  const handleToggleGammeFilter = (gamme: "M" | "D") => {
    const newSet = new Set(filterGammeTypes)
    if (newSet.has(gamme)) {
      newSet.delete(gamme)
    } else {
      newSet.add(gamme)
    }
    setFilterGammeTypes(newSet)
  }

  const handleSelectAllCategories = (checked: boolean) => {
    if (checked) {
      setFilterCategoryTypes(new Set(filteredCategoryList))
    } else {
      setFilterCategoryTypes(new Set())
    }
  }

  const handleSelectAllSuppliers = (checked: boolean) => {
    if (checked) {
      setFilterSupplierTypes(new Set(filteredSupplierList))
    } else {
      setFilterSupplierTypes(new Set())
    }
  }

  const handleSelectAllReductions = (checked: boolean) => {
    if (checked) {
      setFilterReductionTypes(new Set(["absolute", "percentage", "free"] as PromotionType[]))
    } else {
      setFilterReductionTypes(new Set())
    }
  }

  const handleSelectAllGammes = (checked: boolean) => {
    if (checked) {
      setFilterGammeTypes(new Set(["M", "D"] as ("M" | "D")[]))
    } else {
      setFilterGammeTypes(new Set())
    }
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <Package className="mx-auto mb-4 size-12 text-muted-foreground" />
        <p className="text-muted-foreground">Aucun produit ne correspond à ces critères</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Filters Section - Full Width, Responsive */}
      {activeFilters.length > 0 && (
        <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-card px-2">
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Filtres:</span>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="h-6 gap-1 px-2 py-0 text-xs whitespace-nowrap shrink-0">
                {filter.label}
                <button onClick={filter.onRemove} className="ml-0.5 rounded-sm hover:bg-muted">
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
          <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap">
            Effacer tout
          </button>
        </div>
      )}

      {hasActiveFilters && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {filteredProducts.length} / {products.length} produit{filteredProducts.length > 1 ? "s" : ""} affiché
            {filteredProducts.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Bulk Actions Section - Full Width, Responsive */}
      {selectedProducts.size > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 border-r border-border pr-4">
              <Badge variant="default" className="px-3 py-1">
                {selectedProducts.size}
              </Badge>
              <span className="text-sm font-medium">
                produit{selectedProducts.size > 1 ? "s" : ""} sélectionné{selectedProducts.size > 1 ? "s" : ""}
              </span>
            </div>

            {/* Réduction */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 bg-transparent">
                  <Euro className="mr-2 size-4" />
                  Réduction
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <h4 className="font-medium">Appliquer une réduction</h4>
                  <div className="space-y-2">
                    <Label className="text-sm">Type</Label>
                    <Select value={promotionType || ""} onValueChange={(v) => setPromotionType(v as PromotionType)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Choisir un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="absolute">
                          <span className="flex items-center gap-2"><Euro className="size-3" /> Nette</span>
                        </SelectItem>
                        <SelectItem value="percentage">
                          <span className="flex items-center gap-2"><Percent className="size-3" /> Pourcentage</span>
                        </SelectItem>
                        <SelectItem value="free">
                          <span className="flex items-center gap-2"><Gift className="size-3" /> Gratuité</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {promotionType && promotionType !== "free" && (
                    <div className="space-y-2">
                      <Label className="text-sm">Valeur</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={promotionType === "percentage" ? "10" : "5.00"}
                        value={promotionValue}
                        onChange={(e) => setPromotionValue(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  )}
                  <Button
                    onClick={() => {
                      const count = handleApplyBulkPromotion()
                      if (count) {
                        toast({
                          title: "Réduction appliquée",
                          description: `${count} produit${count > 1 ? "s" : ""} modifié${count > 1 ? "s" : ""}`,
                        })
                      }
                    }}
                    disabled={!promotionType || (promotionType !== "free" && !promotionValue)}
                    className="w-full"
                    size="sm"
                  >
                    <Sparkles className="mr-2 size-4" />
                    Appliquer
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Quantité minimale */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 bg-transparent">
                  <Hash className="mr-2 size-4" />
                  Qté Min
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="start">
                <div className="space-y-4">
                  <h4 className="font-medium">Quantité minimale</h4>
                  <div className="space-y-2">
                    <Label className="text-sm">Valeur</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="ex: 10"
                      value={bulkMinQty}
                      onChange={(e) => setBulkMinQty(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const count = onBulkMinQuantity(bulkMinQty ? Number.parseInt(bulkMinQty) : null)
                      if (count) {
                        toast({
                          title: "Quantité minimale appliquée",
                          description: `${count} produit${count > 1 ? "s" : ""} modifié${count > 1 ? "s" : ""}`,
                        })
                        setBulkMinQty("")
                      }
                    }}
                    className="w-full"
                    size="sm"
                  >
                    Appliquer
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Gamme */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 bg-transparent">
                  <Tags className="mr-2 size-4" />
                  Gamme
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="start">
                <div className="space-y-4">
                  <h4 className="font-medium">Définir la gamme</h4>
                  <div className="space-y-2">
                    <Label className="text-sm">Valeur</Label>
                    <Select value={bulkGamme || "M"} onValueChange={(v) => setBulkGamme(v as "M" | "D")}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Choisir une gamme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => {
                      const count = onBulkGamme(bulkGamme)
                      if (count) {
                        toast({
                          title: "Gamme appliquée",
                          description: `${count} produit${count > 1 ? "s" : ""} modifié${count > 1 ? "s" : ""}`,
                        })
                        setBulkGamme(null)
                      }
                    }}
                    className="w-full"
                    size="sm"
                  >
                    Appliquer
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Date de début */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 bg-transparent">
                  <CalendarIcon className="mr-2 size-4" />
                  Date début
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b">
                  <h4 className="font-medium">Date de début</h4>
                </div>
                <Calendar
                  mode="single"
                  selected={bulkStartDate}
                  onSelect={setBulkStartDate}
                  locale={fr}
                  initialFocus
                />
                <div className="border-t p-3">
                  <Button
                    onClick={() => {
                      const count = onBulkStartDate(bulkStartDate ? format(bulkStartDate, "yyyy-MM-dd") : null)
                      if (count) {
                        toast({
                          title: "Date de début appliquée",
                          description: `${count} produit${count > 1 ? "s" : ""} modifié${count > 1 ? "s" : ""}`,
                        })
                        setBulkStartDate(undefined)
                      }
                    }}
                    className="w-full"
                    size="sm"
                    disabled={!bulkStartDate}
                  >
                    Appliquer
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Date de fin */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 bg-transparent">
                  <CalendarIcon className="mr-2 size-4" />
                  Date fin
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b">
                  <h4 className="font-medium">Date de fin</h4>
                </div>
                <Calendar
                  mode="single"
                  selected={bulkEndDate}
                  onSelect={setBulkEndDate}
                  locale={fr}
                  initialFocus
                />
                <div className="border-t p-3">
                  <Button
                    onClick={() => {
                      const count = onBulkEndDate(bulkEndDate ? format(bulkEndDate, "yyyy-MM-dd") : null)
                      if (count) {
                        toast({
                          title: "Date de fin appliquée",
                          description: `${count} produit${count > 1 ? "s" : ""} modifié${count > 1 ? "s" : ""}`,
                        })
                        setBulkEndDate(undefined)
                      }
                    }}
                    className="w-full"
                    size="sm"
                    disabled={!bulkEndDate}
                  >
                    Appliquer
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex-1" />

            {/* Supprimer */}
            <Popover open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <PopoverTrigger asChild>
                <Button variant="destructive" size="sm" className="h-9">
                  <Trash2 className="mr-2 size-4" />
                  Supprimer
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-destructive">Confirmer la suppression</h4>
                  <p className="text-sm text-muted-foreground">
                    Êtes-vous sûr de vouloir supprimer {selectedProducts.size} produit{selectedProducts.size > 1 ? "s" : ""} ?
                    Cette action est irréversible.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const count = onBulkDelete()
                        toast({
                          title: "Produits supprimés",
                          description: `${count} produit${count > 1 ? "s" : ""} supprimé${count > 1 ? "s" : ""}`,
                        })
                        setShowDeleteConfirm(false)
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Désélectionner */}
            <Button variant="ghost" size="sm" className="h-9" onClick={() => onSelectProducts(new Set())}>
              <X className="mr-2 size-4" />
              Désélectionner
            </Button>
          </div>
        </div>
      )}

      {/* Table Section - Horizontal Scroll Only */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-12 p-4">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    className="border-2 data-[state=checked]:border-primary"
                  />
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center gap-2">
                    <span>Référence</span>
                    <Button variant="ghost" size="sm" className="relative h-6 w-6 p-0" onClick={() => handleSort("id")}>
                      <ArrowUpDown
                        className={`size-3 ${sortConfigs.find((s) => s.field === "id") ? "text-primary" : ""}`}
                      />
                      {sortConfigs.find((s) => s.field === "id") && (
                        <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                          {sortConfigs.findIndex((s) => s.field === "id") + 1}
                        </span>
                      )}
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="relative h-6 w-6 p-0">
                          <Filter className={`size-3 ${filterRef ? "text-primary" : ""}`} />
                          {filterRef && (
                            <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                              1
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-64">
                        <div className="space-y-2">
                          <Label>Filtrer par référence</Label>
                          <Input
                            placeholder="Rechercher..."
                            value={filterRef}
                            onChange={(e) => setFilterRef(e.target.value)}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center gap-2">
                    <span>Nom du produit</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative h-6 w-6 p-0"
                      onClick={() => handleSort("name")}
                    >
                      <ArrowUpDown
                        className={`size-3 ${sortConfigs.find((s) => s.field === "name") ? "text-primary" : ""}`}
                      />
                      {sortConfigs.find((s) => s.field === "name") && (
                        <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                          {sortConfigs.findIndex((s) => s.field === "name") + 1}
                        </span>
                      )}
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="relative h-6 w-6 p-0">
                          <Filter className={`size-3 ${filterName ? "text-primary" : ""}`} />
                          {filterName && (
                            <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                              1
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-64">
                        <div className="space-y-2">
                          <Label>Filtrer par nom</Label>
                          <Input
                            placeholder="Rechercher..."
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center gap-2">
                    <span>Rayon</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative h-6 w-6 p-0"
                      onClick={() => handleSort("category")}
                    >
                      <ArrowUpDown
                        className={`size-3 ${sortConfigs.find((s) => s.field === "category") ? "text-primary" : ""}`}
                      />
                      {sortConfigs.find((s) => s.field === "category") && (
                        <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                          {sortConfigs.findIndex((s) => s.field === "category") + 1}
                        </span>
                      )}
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="relative h-6 w-6 p-0">
                          <Filter className={`size-3 ${filterCategoryTypes.size > 0 ? "text-primary" : ""}`} />
                          {filterCategoryTypes.size > 0 && (
                            <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                              {filterCategoryTypes.size}
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-72">
                        <div className="space-y-3">
                          <Label>Filtrer par rayon</Label>
                          <Input
                            placeholder="Rechercher un rayon..."
                            value={filterCategorySearch}
                            onChange={(e) => setFilterCategorySearch(e.target.value)}
                          />
                          <div className="flex items-center space-x-2 border-b border-border pb-2">
                            <Checkbox
                              id="select-all-categories"
                              checked={
                                filterCategoryTypes.size === filteredCategoryList.length &&
                                filteredCategoryList.length > 0
                              }
                              onCheckedChange={handleSelectAllCategories}
                              className="border-2 data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor="select-all-categories"
                              className="cursor-pointer text-sm font-medium leading-none"
                            >
                              Tout sélectionner
                            </label>
                          </div>
                          <div className="max-h-48 space-y-2 overflow-y-auto">
                            {filteredCategoryList.map((category) => (
                              <div key={category} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`cat-${category}`}
                                  checked={filterCategoryTypes.has(category)}
                                  onCheckedChange={() => handleToggleCategoryFilter(category)}
                                  className="border-2 data-[state=checked]:border-primary"
                                />
                                <label
                                  htmlFor={`cat-${category}`}
                                  className="flex-1 cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {category}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center gap-2">
                    <span>Fournisseur</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative h-6 w-6 p-0"
                      onClick={() => handleSort("supplier")}
                    >
                      <ArrowUpDown
                        className={`size-3 ${sortConfigs.find((s) => s.field === "supplier") ? "text-primary" : ""}`}
                      />
                      {sortConfigs.find((s) => s.field === "supplier") && (
                        <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                          {sortConfigs.findIndex((s) => s.field === "supplier") + 1}
                        </span>
                      )}
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="relative h-6 w-6 p-0">
                          <Filter className={`size-3 ${filterSupplierTypes.size > 0 ? "text-primary" : ""}`} />
                          {filterSupplierTypes.size > 0 && (
                            <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                              {filterSupplierTypes.size}
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-72">
                        <div className="space-y-3">
                          <Label>Filtrer par fournisseur</Label>
                          <Input
                            placeholder="Rechercher un fournisseur..."
                            value={filterSupplierSearch}
                            onChange={(e) => setFilterSupplierSearch(e.target.value)}
                          />
                          <div className="flex items-center space-x-2 border-b border-border pb-2">
                            <Checkbox
                              id="select-all-suppliers"
                              checked={
                                filterSupplierTypes.size === filteredSupplierList.length &&
                                filteredSupplierList.length > 0
                              }
                              onCheckedChange={handleSelectAllSuppliers}
                              className="border-2 data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor="select-all-suppliers"
                              className="cursor-pointer text-sm font-medium leading-none"
                            >
                              Tout sélectionner
                            </label>
                          </div>
                          <div className="max-h-[196px] space-y-2 overflow-y-auto">
                            {filteredSupplierList.map((supplier) => (
                              <div key={supplier} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`sup-${supplier}`}
                                  checked={filterSupplierTypes.has(supplier)}
                                  onCheckedChange={() => handleToggleSupplierFilter(supplier)}
                                  className="border-2 data-[state=checked]:border-primary"
                                />
                                <label
                                  htmlFor={`sup-${supplier}`}
                                  className="flex-1 cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {supplier}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center gap-2">
                    <span>Gamme</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative h-6 w-6 p-0"
                      onClick={() => handleSort("gamme")}
                    >
                      <ArrowUpDown
                        className={`size-3 ${sortConfigs.find((s) => s.field === "gamme") ? "text-primary" : ""}`}
                      />
                      {sortConfigs.find((s) => s.field === "gamme") && (
                        <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                          {sortConfigs.findIndex((s) => s.field === "gamme") + 1}
                        </span>
                      )}
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="relative h-6 w-6 p-0">
                          <Filter className={`size-3 ${filterGammeTypes.size > 0 ? "text-primary" : ""}`} />
                          {filterGammeTypes.size > 0 && (
                            <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                              {filterGammeTypes.size}
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-64">
                        <div className="space-y-3">
                          <Label>Filtrer par gamme</Label>
                          <div className="flex items-center space-x-2 border-b border-border pb-2">
                            <Checkbox
                              id="select-all-gammes"
                              checked={filterGammeTypes.size === 2}
                              onCheckedChange={handleSelectAllGammes}
                              className="border-2 data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor="select-all-gammes"
                              className="cursor-pointer text-sm font-medium leading-none"
                            >
                              Tout sélectionner
                            </label>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="gamme-M"
                                checked={filterGammeTypes.has("M")}
                                onCheckedChange={() => handleToggleGammeFilter("M")}
                                className="border-2 data-[state=checked]:border-primary"
                              />
                              <label
                                htmlFor="gamme-M"
                                className="flex-1 cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                M
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="gamme-D"
                                checked={filterGammeTypes.has("D")}
                                onCheckedChange={() => handleToggleGammeFilter("D")}
                                className="border-2 data-[state=checked]:border-primary"
                              />
                              <label
                                htmlFor="gamme-D"
                                className="flex-1 cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                D
                              </label>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center gap-2">
                    <span>Stock</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative h-6 w-6 p-0"
                      onClick={() => handleSort("stock")}
                    >
                      <ArrowUpDown
                        className={`size-3 ${sortConfigs.find((s) => s.field === "stock") ? "text-primary" : ""}`}
                      />
                      {sortConfigs.find((s) => s.field === "stock") && (
                        <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                          {sortConfigs.findIndex((s) => s.field === "stock") + 1}
                        </span>
                      )}
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="relative h-6 w-6 p-0">
                          <Filter
                            className={`size-3 ${filterStockRange[0] > 0 || filterStockRange[1] < stockMax ? "text-primary" : ""}`}
                          />
                          {(filterStockRange[0] > 0 || filterStockRange[1] < stockMax) && (
                            <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                              1
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-72">
                        <div className="space-y-4">
                          <Label>Filtrer par stock</Label>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{filterStockRange[0]}</span>
                              <span>{filterStockRange[1]}</span>
                            </div>
                            <Slider
                              min={0}
                              max={stockMax}
                              step={10}
                              value={filterStockRange}
                              onValueChange={(val) => setFilterStockRange(val as [number, number])}
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center gap-2">
                    <span>Prix Avant</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative h-6 w-6 p-0"
                      onClick={() => handleSort("initialPrice")}
                    >
                      <ArrowUpDown
                        className={`size-3 ${sortConfigs.find((s) => s.field === "initialPrice") ? "text-primary" : ""}`}
                      />
                      {sortConfigs.find((s) => s.field === "initialPrice") && (
                        <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                          {sortConfigs.findIndex((s) => s.field === "initialPrice") + 1}
                        </span>
                      )}
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="relative h-6 w-6 p-0">
                          <Filter
                            className={`size-3 ${filterInitialPriceRange[0] > 0 || filterInitialPriceRange[1] < priceMax ? "text-primary" : ""}`}
                          />
                          {(filterInitialPriceRange[0] > 0 || filterInitialPriceRange[1] < priceMax) && (
                            <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                              1
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-72">
                        <div className="space-y-4">
                          <Label>Filtrer par prix avant</Label>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{filterInitialPriceRange[0].toFixed(2)} €</span>
                              <span>{filterInitialPriceRange[1].toFixed(2)} €</span>
                            </div>
                            <Slider
                              min={0}
                              max={priceMax}
                              step={1}
                              value={filterInitialPriceRange}
                              onValueChange={(val) => setFilterInitialPriceRange(val as [number, number])}
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="border-l border-border p-4 text-center text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center justify-center gap-2">
                    <Pencil className="size-3" />
                    Réduction
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="relative h-6 w-6 p-0">
                          <Filter className={`size-3 ${filterReductionTypes.size > 0 ? "text-primary" : ""}`} />
                          {filterReductionTypes.size > 0 && (
                            <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                              {filterReductionTypes.size}
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="center" className="w-64">
                        <div className="space-y-3">
                          <Label>Filtrer par type de réduction</Label>
                          <div className="flex items-center space-x-2 border-b border-border pb-2">
                            <Checkbox
                              id="select-all-reductions"
                              checked={filterReductionTypes.size === 3}
                              onCheckedChange={handleSelectAllReductions}
                              className="border-2 data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor="select-all-reductions"
                              className="cursor-pointer text-sm font-medium leading-none"
                            >
                              Tout sélectionner
                            </label>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="filter-absolute"
                                checked={filterReductionTypes.has("absolute")}
                                onCheckedChange={() => handleToggleReductionFilter("absolute")}
                                className="border-2 data-[state=checked]:border-primary"
                              />
                              <label htmlFor="filter-absolute" className="flex-1 cursor-pointer text-sm leading-none">
                                Nette
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="filter-percentage"
                                checked={filterReductionTypes.has("percentage")}
                                onCheckedChange={() => handleToggleReductionFilter("percentage")}
                                className="border-2 data-[state=checked]:border-primary"
                              />
                              <label htmlFor="filter-percentage" className="flex-1 cursor-pointer text-sm leading-none">
                                Pourcentage
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="filter-free"
                                checked={filterReductionTypes.has("free")}
                                onCheckedChange={() => handleToggleReductionFilter("free")}
                                className="border-2 data-[state=checked]:border-primary"
                              />
                              <label htmlFor="filter-free" className="flex-1 cursor-pointer text-sm leading-none">
                                Gratuité
                              </label>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center gap-2">
                    <span>Prix Après</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative h-6 w-6 p-0"
                      onClick={() => handleSort("currentPrice")}
                    >
                      <ArrowUpDown
                        className={`size-3 ${sortConfigs.find((s) => s.field === "currentPrice") ? "text-primary" : ""}`}
                      />
                      {sortConfigs.find((s) => s.field === "currentPrice") && (
                        <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                          {sortConfigs.findIndex((s) => s.field === "currentPrice") + 1}
                        </span>
                      )}
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="relative h-6 w-6 p-0">
                          <Filter
                            className={`size-3 ${filterCurrentPriceRange[0] > 0 || filterCurrentPriceRange[1] < priceMax ? "text-primary" : ""}`}
                          />
                          {(filterCurrentPriceRange[0] > 0 || filterCurrentPriceRange[1] < priceMax) && (
                            <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                              1
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-72">
                        <div className="space-y-4">
                          <Label>Filtrer par prix après</Label>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{filterCurrentPriceRange[0].toFixed(2)} €</span>
                              <span>{filterCurrentPriceRange[1].toFixed(2)} €</span>
                            </div>
                            <Slider
                              min={0}
                              max={priceMax}
                              step={1}
                              value={filterCurrentPriceRange}
                              onValueChange={(val) => setFilterCurrentPriceRange(val as [number, number])}
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center gap-2">
                    <span>Qté Min</span>
                  </div>
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center gap-2">
                    <span>Date Début</span>
                  </div>
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center gap-2">
                    <span>Date Fin</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => {
                const isSelected = selectedProducts.has(product.id)
                const hasPromotion = product.promotionType !== null
                const difference = hasPromotion && product.currentPrice !== null ? product.currentPrice - product.initialPrice : 0
                const differencePercent = hasPromotion && product.currentPrice !== null ? ((difference / product.initialPrice) * 100).toFixed(1) : "0.0"

                return (
                  <tr
                    key={product.id}
                    className={`border-b border-border transition-colors hover:bg-muted/50 ${isSelected ? "bg-primary/5" : ""}`}
                  >
                    <td className="p-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                        className="border-2 data-[state=checked]:border-primary"
                      />
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm">{product.id}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{product.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{product.category}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{product.supplier}</span>
                    </td>
                    <td className="p-4">
                      {editingGammeId === product.id ? (
                        <div
                          className="flex items-center gap-2 rounded-lg border border-border bg-background p-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                  <Select
                    value={product.gamme}
                    onValueChange={(v) => handleGammeChange(product.id, v as "M" | "D")}
                  >
                    <SelectTrigger className="h-8 w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEditGamme}
                            className="h-8 shrink-0 bg-transparent"
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleStartEditGamme(product)}
                          className="group flex cursor-pointer items-center gap-2 rounded border-2 border-dashed border-transparent bg-primary/5 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-primary/10"
                        >
                          <Badge variant="secondary" className="shrink-0 px-2 py-0.5">
                            {product.gamme}
                          </Badge>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-left">
                      <span className="text-sm">{product.stock}</span>
                    </td>
                    <td className="p-4 text-left">
                      <span className="font-medium">{product.initialPrice.toFixed(2)} €</span>
                    </td>
                    <td className="p-4">
                      {editingDifferenceId === product.id ? (
                        <div
                          className="flex items-center gap-2 rounded-lg border border-border bg-background p-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Select
                            value={editPromotionType || ""}
                            onValueChange={(v) => setEditPromotionType(v as PromotionType)}
                          >
                            <SelectTrigger className="h-8 w-32 shrink-0">
                              <div className="flex items-center gap-2">
                                {editPromotionType === "absolute" && <Euro className="size-4" />}
                                {editPromotionType === "percentage" && <Percent className="size-4" />}
                                {editPromotionType === "free" && <Gift className="size-4" />}
                                <span>
                                  {editPromotionType === "absolute" && "Nette"}
                                  {editPromotionType === "percentage" && "Pourcentage"}
                                  {editPromotionType === "free" && "Gratuité"}
                                </span>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="absolute">
                                <div className="flex items-center gap-2">
                                  <Euro className="size-4" />
                                  <span>Nette</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="percentage">
                                <div className="flex items-center gap-2">
                                  <Percent className="size-4" />
                                  <span>Pourcentage</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="free">
                                <div className="flex items-center gap-2">
                                  <Gift className="size-4" />
                                  <span>Gratuité</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {editPromotionType !== "free" && (
                            <Input
                              type="number"
                              step="0.01"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveEditDifference(product.id)
                                if (e.key === "Escape") handleCancelEditDifference()
                              }}
                              className="h-8 w-20 shrink-0"
                              placeholder={editPromotionType === "percentage" ? "10" : "5.00"}
                            />
                          )}
                          <Button size="sm" onClick={() => handleSaveEditDifference(product.id)} className="h-8 shrink-0">
                            Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEditDifference}
                            className="h-8 shrink-0 bg-transparent"
                          >
                            Annuler
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleStartEditDifference(product)}
                          className="group flex cursor-pointer items-center gap-3 rounded border-2 border-dashed border-transparent bg-primary/5 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-primary/10"
                        >
                          {product.promotionType ? (
                            <>
                              <Badge variant="secondary" className="shrink-0 gap-1 px-2 py-0.5">
                                {product.promotionType === "absolute" && (
                                  <>
                                    <Euro className="size-3" />
                                    Nette
                                  </>
                                )}
                                {product.promotionType === "percentage" && (
                                  <>
                                    <Percent className="size-3" />
                                    Pourcentage
                                  </>
                                )}
                                {product.promotionType === "free" && (
                                  <>
                                    <Gift className="size-3" />
                                    Gratuité
                                  </>
                                )}
                              </Badge>
                              <div className="h-8 w-px bg-border shrink-0" />
                              <div className="flex flex-col items-end">
                                <span className="text-sm font-medium whitespace-nowrap">{difference.toFixed(2)} €</span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">({differencePercent}%)</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <Pencil className="size-3 text-muted-foreground transition-colors group-hover:text-primary" />
                              <span className="text-xs text-muted-foreground">Cliquer pour modifier</span>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-left">
                      {hasPromotion && product.currentPrice !== null ? (
                        editingPriceId === product.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleSaveEditPrice(product.id)}
                              onKeyDown={(e) => e.key === "Enter" && handleSaveEditPrice(product.id)}
                              className="h-8 w-24 text-right"
                              autoFocus
                            />
                            <span className="text-sm">€</span>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEditPrice(product)}
                            className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-muted"
                          >
                            <span className="font-medium">{product.currentPrice.toFixed(2)} €</span>
                            <Pencil className="size-3 text-muted-foreground" />
                          </div>
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-left">
                      {editingMinQtyId === product.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={editMinQtyValue}
                            onChange={(e) => setEditMinQtyValue(e.target.value)}
                            onBlur={() => handleSaveEditMinQty(product.id)}
                            onKeyDown={(e) => e.key === "Enter" && handleSaveEditMinQty(product.id)}
                            className="h-8 w-20"
                            autoFocus
                            placeholder="1"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => handleStartEditMinQty(product)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-muted"
                        >
                          {product.minQuantity !== null ? (
                            <>
                              <span className="text-sm">{product.minQuantity}</span>
                              <Pencil className="size-3 text-muted-foreground" />
                            </>
                          ) : (
                            <>
                              <Pencil className="size-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Définir</span>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-left">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="inline-flex cursor-pointer items-center gap-2 rounded border border-transparent px-2 py-1 text-sm transition-colors hover:border-border hover:bg-muted">
                            <CalendarIcon className="size-4 text-muted-foreground" />
                            {product.startDate ? (
                              <span>{format(parse(product.startDate, "yyyy-MM-dd", new Date()), "dd/MM/yyyy")}</span>
                            ) : (
                              <span className="text-muted-foreground">Définir</span>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={product.startDate ? parse(product.startDate, "yyyy-MM-dd", new Date()) : undefined}
                            onSelect={(date) => onDateChange(product.id, "startDate", date ? format(date, "yyyy-MM-dd") : null)}
                            locale={fr}
                            initialFocus
                          />
                          {product.startDate && (
                            <div className="border-t p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={() => onDateChange(product.id, "startDate", null)}
                              >
                                <X className="mr-2 size-3" />
                                Effacer
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </td>
                    <td className="p-4 text-left">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="inline-flex cursor-pointer items-center gap-2 rounded border border-transparent px-2 py-1 text-sm transition-colors hover:border-border hover:bg-muted">
                            <CalendarIcon className="size-4 text-muted-foreground" />
                            {product.endDate ? (
                              <span>{format(parse(product.endDate, "yyyy-MM-dd", new Date()), "dd/MM/yyyy")}</span>
                            ) : (
                              <span className="text-muted-foreground">Définir</span>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={product.endDate ? parse(product.endDate, "yyyy-MM-dd", new Date()) : undefined}
                            onSelect={(date) => onDateChange(product.id, "endDate", date ? format(date, "yyyy-MM-dd") : null)}
                            locale={fr}
                            initialFocus
                          />
                          {product.endDate && (
                            <div className="border-t p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={() => onDateChange(product.id, "endDate", null)}
                              >
                                <X className="mr-2 size-3" />
                                Effacer
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
