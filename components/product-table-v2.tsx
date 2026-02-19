"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { X, ChevronDown, ChevronRight, Plus, Pencil, CalendarIcon, Euro, Percent, Gift, Search, Filter, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import type { Product, PromotionType, PromoConfig, PromoBook } from "@/app/page"

type ColumnFilters = {
  reference: Set<string>
  name: Set<string>
  category: Set<string>
  supplier: Set<string>
  gamme: Set<string>
}

interface ProductTableV2Props {
  products: Product[]
  selectedProducts: Set<string>
  onSelectProducts: (selected: Set<string>) => void
  onAddPromoConfig: (productId: string, config: PromoConfig) => void
  onUpdatePromoConfig: (productId: string, configId: string, config: Partial<PromoConfig>) => void
  onDeletePromoConfig: (productId: string, configId: string) => void
  activePromoBook: PromoBook | null
  promoBookProductIds: Set<string>
  onAddToPromoBook: (productId: string) => void
  onRemoveFromPromoBook: (productId: string) => void
  hasUnsavedChanges: boolean
  onSavePromoBook: () => void
}

export function ProductTableV2({
  products,
  selectedProducts,
  onSelectProducts,
  onAddPromoConfig,
  onUpdatePromoConfig,
  onDeletePromoConfig,
  activePromoBook,
  promoBookProductIds,
  onAddToPromoBook,
  onRemoveFromPromoBook,
  hasUnsavedChanges,
  onSavePromoBook,
}: ProductTableV2Props) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [showOnlyWithPromo, setShowOnlyWithPromo] = useState(false)
  const [showPromoBookOnly, setShowPromoBookOnly] = useState(false)
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
    reference: new Set(),
    name: new Set(),
    category: new Set(),
    supplier: new Set(),
    gamme: new Set(),
  })
  const [editingField, setEditingField] = useState<{ productId: string; configId: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [bulkPromoData, setBulkPromoData] = useState<Partial<PromoConfig>>({
    label: "",
    promotionType: null,
    promotionValue: null,
    minQuantity: null,
    moq: null,
    som: null,
    startDate: null,
    endDate: null,
  })
  const { toast } = useToast()

  const toggleExpanded = (productId: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const next = new Set(selectedProducts)
    if (checked) {
      next.add(productId)
    } else {
      next.delete(productId)
    }
    onSelectProducts(next)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectProducts(new Set(products.map((p) => p.id)))
    } else {
      onSelectProducts(new Set())
    }
  }

  const startEditing = (productId: string, configId: string, field: string, currentValue: any) => {
    setEditingField({ productId, configId, field })
    setEditValue(currentValue?.toString() || "")
  }

  const saveEdit = (productId: string, configId: string, field: string) => {
    const updates: Partial<PromoConfig> = {}
    
    if (field === "currentPrice" || field === "promotionValue" || field === "minQuantity" || field === "moq" || field === "som") {
      const numValue = parseFloat(editValue)
      if (!isNaN(numValue)) {
        updates[field] = numValue
      } else if (editValue === "") {
        updates[field] = null
      }
    } else if (field === "label") {
      updates[field] = editValue
    }
    
    onUpdatePromoConfig(productId, configId, updates)
    setEditingField(null)
    setEditValue("")
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValue("")
  }

  // Get unique values for each column
  // Get unique values for each column
  const getUniqueValues = (column: keyof ColumnFilters) => {
    const values = new Set<string>()
    products.forEach((product) => {
      if (column === "reference") values.add(product.id)
      else if (column === "name") values.add(product.name)
      else if (column === "category") values.add(product.category)
      else if (column === "supplier") values.add(product.supplier)
      else if (column === "gamme") values.add(product.gamme)
    })
    return Array.from(values).sort()
  }

  // Column Filter Component
  const ColumnFilterPopover = ({ column, title }: { column: keyof ColumnFilters; title: string }) => {
    const [filterSearch, setFilterSearch] = useState("")
    const uniqueValues = getUniqueValues(column)
    const activeFilters = columnFilters[column]
    
    const filteredValues = uniqueValues.filter((value) =>
      value.toLowerCase().includes(filterSearch.toLowerCase())
    )

    const toggleFilter = (value: string) => {
      setColumnFilters((prev) => {
        const newFilters = { ...prev }
        const columnSet = new Set(prev[column])
        if (columnSet.has(value)) {
          columnSet.delete(value)
        } else {
          columnSet.add(value)
        }
        newFilters[column] = columnSet
        return newFilters
      })
    }

    const selectAll = () => {
      setColumnFilters((prev) => ({
        ...prev,
        [column]: new Set(filteredValues),
      }))
    }

    const clearAll = () => {
      setColumnFilters((prev) => ({
        ...prev,
        [column]: new Set(),
      }))
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
            <Filter className={`ml-2 size-3.5 ${activeFilters.size > 0 ? "text-primary" : "text-muted-foreground"}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="flex flex-col">
            <div className="border-b p-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder={`Rechercher ${title.toLowerCase()}...`}
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll} className="h-7 flex-1 text-xs">
                  Tout
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll} className="h-7 flex-1 text-xs">
                  Aucun
                </Button>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {filteredValues.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground">Aucun résultat</div>
              ) : (
                filteredValues.map((value) => (
                  <div
                    key={value}
                    className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted"
                  >
                    <Checkbox
                      checked={activeFilters.has(value)}
                      onCheckedChange={() => toggleFilter(value)}
                    />
                    <span className="flex-1 text-xs">{value}</span>
                  </div>
                ))
              )}
            </div>
            {activeFilters.size > 0 && (
              <div className="border-t p-2 text-xs text-muted-foreground">
                {activeFilters.size} filtre(s) actif(s)
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Filter products by name or promo config labels
  const filteredProducts = products.filter((product) => {
    // Filter by promo toggle
    if (showOnlyWithPromo && (!product.promoConfigs || product.promoConfigs.length === 0)) {
      return false
    }

    // Filter by PromoBook
    if (showPromoBookOnly && activePromoBook && !promoBookProductIds.has(product.id)) {
      return false
    }

    // Column filters
    if (columnFilters.reference.size > 0 && !columnFilters.reference.has(product.id)) return false
    if (columnFilters.name.size > 0 && !columnFilters.name.has(product.name)) return false
    if (columnFilters.category.size > 0 && !columnFilters.category.has(product.category)) return false
    if (columnFilters.supplier.size > 0 && !columnFilters.supplier.has(product.supplier)) return false
    if (columnFilters.gamme.size > 0 && !columnFilters.gamme.has(product.gamme)) return false
    
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    
    // Search in product name
    if (product.name.toLowerCase().includes(query)) return true
    
    // Search in promo config labels
    const hasMatchingPromo = product.promoConfigs?.some((config) =>
      config.label?.toLowerCase().includes(query)
    )
    return hasMatchingPromo
  })

  return (
    <div className="w-full space-y-4">
      {/* Search Bar and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un produit ou un promoparamétrage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap rounded-md border border-border bg-white px-3 py-2">
          <Switch
            checked={showOnlyWithPromo}
            onCheckedChange={setShowOnlyWithPromo}
          />
          <span className="text-sm font-medium">Produits avec promotion</span>
        </div>
        {activePromoBook && (
          <div className="flex items-center gap-2 whitespace-nowrap rounded-md border border-border bg-white px-3 py-2">
            <Switch
              checked={showPromoBookOnly}
              onCheckedChange={setShowPromoBookOnly}
            />
            <span className="text-sm font-medium">PromoBook uniquement</span>
          </div>
        )}
        {selectedProducts.size > 0 && (
          <Button onClick={() => setBulkDialogOpen(true)} className="whitespace-nowrap">
            <Plus className="mr-2 size-4" />
            Ajouter promotion ({selectedProducts.size})
          </Button>
        )}
      </div>

      {/* Table Section - Horizontal Scroll Only */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-12 p-4">
                  <Checkbox
                    checked={selectedProducts.size === products.length && products.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="w-12 p-4"></th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center">
                    Référence
                    <ColumnFilterPopover column="reference" title="Référence" />
                  </div>
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center">
                    Nom du produit
                    <ColumnFilterPopover column="name" title="Nom du produit" />
                  </div>
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center">
                    Rayon
                    <ColumnFilterPopover column="category" title="Rayon" />
                  </div>
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center">
                    Fournisseur
                    <ColumnFilterPopover column="supplier" title="Fournisseur" />
                  </div>
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  Stock
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  Prix initial
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  <div className="flex items-center">
                    Gamme
                    <ColumnFilterPopover column="gamme" title="Gamme" />
                  </div>
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  Nb Promos
                </th>
                {activePromoBook && (
                  <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                    Au PromoBook
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isExpanded = expandedProducts.has(product.id)
                const isSelected = selectedProducts.has(product.id)
                const promoConfigs = product.promoConfigs || []
                const hasConfigs = promoConfigs.length > 0

                return (
                  <>
                    {/* Main Product Row */}
                    <tr key={product.id} className="border-t border-border transition-colors hover:bg-muted/30">
                      <td className="p-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                          className="border-2 data-[state=checked]:border-primary"
                        />
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleExpanded(product.id)}
                          className="rounded p-1 hover:bg-muted"
                          disabled={!hasConfigs}
                        >
                          {hasConfigs ? (
                            isExpanded ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )
                          ) : (
                            <div className="size-4" />
                          )}
                        </button>
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
                      <td className="p-4 text-left">
                        <span className="text-sm">{product.stock}</span>
                      </td>
                      <td className="p-4 text-left">
                        <span className="font-medium">{product.initialPrice.toFixed(2)} €</span>
                      </td>
                      <td className="p-4 text-left">
                        <span className="text-sm">{product.gamme}</span>
                      </td>
                      <td className="p-4 text-left">
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={hasConfigs ? "bg-blue-600 text-white hover:bg-blue-600" : "bg-blue-100 text-blue-700 hover:bg-blue-100"}
                          >
                            {promoConfigs.length}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-muted"
                            onClick={() => {
                              const newConfig: PromoConfig = {
                                id: `pc-${Date.now()}`,
                                currentPrice: null,
                                promotionType: null,
                                promotionValue: null,
                                minQuantity: null,
                                moq: null,
                                som: null,
                                startDate: null,
                                endDate: null,
                                label: "Nouvelle promo",
                              }
                              onAddPromoConfig(product.id, newConfig)
                              setExpandedProducts((prev) => new Set(prev).add(product.id))
                            }}
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                      </td>
                      {activePromoBook && (
                        <td className="p-4 text-left">
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-7 w-7 p-0 hover:bg-muted hover:text-foreground ${promoBookProductIds.has(product.id) ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}`}
                            onClick={() => {
                              if (promoBookProductIds.has(product.id)) {
                                onRemoveFromPromoBook(product.id)
                              } else {
                                onAddToPromoBook(product.id)
                              }
                            }}
                            title={promoBookProductIds.has(product.id) ? "Retirer du PromoBook" : "Ajouter au PromoBook"}
                          >
                            <BookOpen className="size-4" />
                          </Button>
                        </td>
                      )}
                    </tr>

                    {/* Expanded Promo Configs */}
                    {isExpanded && hasConfigs && (
                      <tr>
                        <td colSpan={activePromoBook ? 11 : 10} className="bg-muted/20 p-0">
                          <div className="p-4">
                            <div className="space-y-3">
                              {promoConfigs.map((config, index) => (
                                <div
                                  key={config.id}
                                  className="flex w-full items-center gap-3 rounded border border-border bg-card px-3 py-2"
                                >
                                  {/* Label - Column */}
                                  <div className="flex min-w-[140px] flex-1 items-center gap-1">
                                    <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                                    {editingField?.productId === product.id && editingField?.configId === config.id && editingField?.field === "label" ? (
                                      <Input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={() => saveEdit(product.id, config.id, "label")}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") saveEdit(product.id, config.id, "label")
                                          if (e.key === "Escape") cancelEdit()
                                        }}
                                        className="h-6 flex-1 text-xs"
                                        autoFocus
                                      />
                                    ) : (
                                      <div
                                        onClick={() => startEditing(product.id, config.id, "label", config.label)}
                                        className="flex flex-1 cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-muted"
                                      >
                                        <span className="text-xs font-medium">{config.label || "Sans nom"}</span>
                                        <Pencil className="size-3 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="h-4 w-px bg-border" />

                                  {/* All fields in table-like columns */}
                                  <div className="flex flex-[3] items-center gap-3 overflow-x-auto">
                                        {/* Réduction: Type + Valeur - Column */}
                                        <div className="flex min-w-[130px] flex-1 items-center gap-1.5">
                                          <span className="w-[30px] text-xs text-muted-foreground">Réd:</span>
                                          <Select
                                            value={config.promotionType || ""}
                                            onValueChange={(v) => {
                                              const newType = v as PromotionType
                                              // Calculate currentPrice if we have promotionValue
                                              if (newType !== "free" && config.promotionValue && product.initialPrice) {
                                                const newCurrentPrice = newType === "percentage" 
                                                  ? product.initialPrice * (1 - config.promotionValue / 100)
                                                  : product.initialPrice - config.promotionValue
                                                onUpdatePromoConfig(product.id, config.id, { 
                                                  promotionType: newType,
                                                  currentPrice: newCurrentPrice 
                                                })
                                              } else if (newType === "free") {
                                                onUpdatePromoConfig(product.id, config.id, { 
                                                  promotionType: newType,
                                                  currentPrice: 0,
                                                  promotionValue: 0
                                                })
                                              } else {
                                                onUpdatePromoConfig(product.id, config.id, { promotionType: newType })
                                              }
                                            }}
                                          >
                                            <SelectTrigger className="h-6 w-[45px] text-xs">
                                              <SelectValue placeholder="-" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="absolute">€</SelectItem>
                                              <SelectItem value="percentage">%</SelectItem>
                                              <SelectItem value="free">Gratuit</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <div className="w-[50px]">
                                            {config.promotionType === "free" ? (
                                              <span className="text-xs font-medium text-muted-foreground">Gratuit</span>
                                            ) : config.promotionType && (
                                              <>
                                                {editingField?.productId === product.id && editingField?.configId === config.id && editingField?.field === "promotionValue" ? (
                                                  <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={() => {
                                                      const value = Number.parseFloat(editValue)
                                                      if (!Number.isNaN(value) && product.initialPrice) {
                                                        const newCurrentPrice = config.promotionType === "percentage"
                                                          ? product.initialPrice * (1 - value / 100)
                                                          : product.initialPrice - value
                                                        onUpdatePromoConfig(product.id, config.id, { 
                                                          promotionValue: value,
                                                          currentPrice: newCurrentPrice
                                                        })
                                                      }
                                                      setEditingField(null)
                                                    }}
                                                    onKeyDown={(e) => {
                                                      if (e.key === "Enter") {
                                                        const value = Number.parseFloat(editValue)
                                                        if (!Number.isNaN(value) && product.initialPrice) {
                                                          const newCurrentPrice = config.promotionType === "percentage"
                                                            ? product.initialPrice * (1 - value / 100)
                                                            : product.initialPrice - value
                                                          onUpdatePromoConfig(product.id, config.id, { 
                                                            promotionValue: value,
                                                            currentPrice: newCurrentPrice
                                                          })
                                                        }
                                                        setEditingField(null)
                                                      }
                                                      if (e.key === "Escape") cancelEdit()
                                                    }}
                                                    className="h-6 w-full text-xs"
                                                    autoFocus
                                                  />
                                                ) : (
                                                  <div
                                                    onClick={() => startEditing(product.id, config.id, "promotionValue", config.promotionValue)}
                                                    className="cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-muted"
                                                  >
                                                    <span className="text-xs font-medium">
                                                      {config.promotionValue ? `${config.promotionValue}${config.promotionType === "percentage" ? "%" : "€"}` : "-"}
                                                    </span>
                                                  </div>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        </div>

                                        {/* Prix après promo - Column */}
                                        <div className="flex min-w-[170px] flex-1 items-center gap-1.5">
                                          <span className="whitespace-nowrap text-xs text-muted-foreground">Prix après Promo:</span>
                                          {config.promotionType === "free" ? (
                                            <span className="text-xs font-medium text-muted-foreground">Gratuit</span>
                                          ) : (
                                            <>
                                              {editingField?.productId === product.id && editingField?.configId === config.id && editingField?.field === "currentPrice" ? (
                                                <Input
                                                  type="number"
                                                  step="0.01"
                                                  value={editValue}
                                                  onChange={(e) => setEditValue(e.target.value)}
                                                  onBlur={() => {
                                                    const newPrice = Number.parseFloat(editValue)
                                                    if (!Number.isNaN(newPrice) && product.initialPrice) {
                                                      // Calculate reduction as absolute value (default)
                                                      const reduction = product.initialPrice - newPrice
                                                      onUpdatePromoConfig(product.id, config.id, { 
                                                        currentPrice: newPrice,
                                                        promotionType: "absolute",
                                                        promotionValue: reduction
                                                      })
                                                    }
                                                    setEditingField(null)
                                                  }}
                                                  onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                      const newPrice = Number.parseFloat(editValue)
                                                      if (!Number.isNaN(newPrice) && product.initialPrice) {
                                                        const reduction = product.initialPrice - newPrice
                                                        onUpdatePromoConfig(product.id, config.id, { 
                                                          currentPrice: newPrice,
                                                          promotionType: "absolute",
                                                          promotionValue: reduction
                                                        })
                                                      }
                                                      setEditingField(null)
                                                    }
                                                    if (e.key === "Escape") cancelEdit()
                                                  }}
                                                  className="h-6 w-[65px] text-xs"
                                                  autoFocus
                                                />
                                              ) : (
                                                <div
                                                  onClick={() => startEditing(product.id, config.id, "currentPrice", config.currentPrice)}
                                                  className="cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-muted"
                                                >
                                                  <span className="text-xs font-medium">
                                                    {config.currentPrice ? `${config.currentPrice.toFixed(2)}€` : "-"}
                                                  </span>
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </div>

                                        {/* Quantité minimale - Column */}
                                        <div className="flex min-w-[70px] flex-[0.5] items-center gap-1.5">
                                          <span className="whitespace-nowrap text-xs text-muted-foreground">Qmin:</span>
                                          {editingField?.productId === product.id && editingField?.configId === config.id && editingField?.field === "minQuantity" ? (
                                            <Input
                                              type="number"
                                              min="0"
                                              value={editValue}
                                              onChange={(e) => setEditValue(e.target.value)}
                                              onBlur={() => saveEdit(product.id, config.id, "minQuantity")}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") saveEdit(product.id, config.id, "minQuantity")
                                                if (e.key === "Escape") cancelEdit()
                                              }}
                                              className="h-6 w-[35px] text-xs"
                                              autoFocus
                                            />
                                          ) : (
                                            <div
                                              onClick={() => startEditing(product.id, config.id, "minQuantity", config.minQuantity)}
                                              className="cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-muted"
                                            >
                                              <span className="text-xs">{config.minQuantity || "-"}</span>
                                            </div>
                                          )}
                                        </div>

                                        {/* MOQ - Column */}
                                        <div className="flex min-w-[70px] flex-[0.5] items-center gap-1.5">
                                          <span className="whitespace-nowrap text-xs text-muted-foreground">MOQ:</span>
                                          {editingField?.productId === product.id && editingField?.configId === config.id && editingField?.field === "moq" ? (
                                            <Input
                                              type="number"
                                              min="0"
                                              value={editValue}
                                              onChange={(e) => setEditValue(e.target.value)}
                                              onBlur={() => saveEdit(product.id, config.id, "moq")}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") saveEdit(product.id, config.id, "moq")
                                                if (e.key === "Escape") cancelEdit()
                                              }}
                                              className="h-6 w-[35px] text-xs"
                                              autoFocus
                                            />
                                          ) : (
                                            <div
                                              onClick={() => startEditing(product.id, config.id, "moq", config.moq)}
                                              className="cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-muted"
                                            >
                                              <span className="text-xs font-medium">{config.moq || "-"}</span>
                                            </div>
                                          )}
                                        </div>

                                        {/* SOM - Column */}
                                        <div className="flex min-w-[70px] flex-[0.5] items-center gap-1.5">
                                          <span className="whitespace-nowrap text-xs text-muted-foreground">SOM:</span>
                                          {editingField?.productId === product.id && editingField?.configId === config.id && editingField?.field === "som" ? (
                                            <Input
                                              type="number"
                                              min="0"
                                              value={editValue}
                                              onChange={(e) => setEditValue(e.target.value)}
                                              onBlur={() => saveEdit(product.id, config.id, "som")}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") saveEdit(product.id, config.id, "som")
                                                if (e.key === "Escape") cancelEdit()
                                              }}
                                              className="h-6 w-[35px] text-xs"
                                              autoFocus
                                            />
                                          ) : (
                                            <div
                                              onClick={() => startEditing(product.id, config.id, "som", config.som)}
                                              className="cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-muted"
                                            >
                                              <span className="text-xs font-medium">{config.som || "-"}</span>
                                            </div>
                                          )}
                                        </div>

                                        {/* Date début - Column */}
                                        <div className="flex min-w-[130px] flex-1 items-center gap-1.5">
                                          <span className="whitespace-nowrap text-xs text-muted-foreground">Début:</span>
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button variant="outline" className="h-6 flex-1 justify-start text-xs font-normal bg-transparent">
                                                <CalendarIcon className="mr-1 size-3" />
                                                {config.startDate ? format(new Date(config.startDate), "dd/MM/yy") : "-"}
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                              <Calendar
                                                mode="single"
                                                selected={config.startDate ? new Date(config.startDate) : undefined}
                                                onSelect={(date) => {
                                                  if (date) {
                                                    onUpdatePromoConfig(product.id, config.id, {
                                                      startDate: format(date, "yyyy-MM-dd"),
                                                    })
                                                  }
                                                }}
                                                initialFocus
                                              />
                                            </PopoverContent>
                                          </Popover>
                                        </div>

                                        {/* Date fin - Column */}
                                        <div className="flex min-w-[110px] flex-1 items-center gap-1.5">
                                          <span className="whitespace-nowrap text-xs text-muted-foreground">Fin:</span>
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button variant="outline" className="h-6 flex-1 justify-start text-xs font-normal bg-transparent">
                                                <CalendarIcon className="mr-1 size-3" />
                                                {config.endDate ? format(new Date(config.endDate), "dd/MM/yy") : "-"}
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                              <Calendar
                                                mode="single"
                                                selected={config.endDate ? new Date(config.endDate) : undefined}
                                                onSelect={(date) => {
                                                  if (date) {
                                                    onUpdatePromoConfig(product.id, config.id, {
                                                      endDate: format(date, "yyyy-MM-dd"),
                                                    })
                                                  }
                                                }}
                                                initialFocus
                                              />
                                            </PopoverContent>
                                          </Popover>
                                        </div>

                                      </div>

                                    {/* Delete button */}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 shrink-0 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                      onClick={() => onDeletePromoConfig(product.id, config.id)}
                                    >
                                      <X className="size-3" />
                                    </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Action Sheet */}
      <Sheet open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <SheetContent side="right" className="w-full p-6 sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Ajouter une promotion en masse</SheetTitle>
            <SheetDescription>
              Créer une nouvelle ligne de promoparamétrage pour {selectedProducts.size} produit(s) sélectionné(s)
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-4 overflow-y-auto py-6">
            {/* Label */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nom de la promotion</label>
              <Input
                value={bulkPromoData.label || ""}
                onChange={(e) => setBulkPromoData({ ...bulkPromoData, label: e.target.value })}
                placeholder="ex: Black Friday 2024"
              />
            </div>

            {/* Promotion Type and Value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Type de réduction</label>
                <Select
                  value={bulkPromoData.promotionType || ""}
                  onValueChange={(v) => setBulkPromoData({ ...bulkPromoData, promotionType: v as PromotionType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="absolute">Montant fixe (€)</SelectItem>
                    <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                    <SelectItem value="free">Gratuit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Valeur</label>
                <Input
                  type="number"
                  step="0.01"
                  value={bulkPromoData.promotionValue || ""}
                  onChange={(e) => setBulkPromoData({ ...bulkPromoData, promotionValue: e.target.value ? Number(e.target.value) : null })}
                  placeholder="0"
                  disabled={bulkPromoData.promotionType === "free"}
                />
              </div>
            </div>

            {/* MOQ, SOM, Min Quantity */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">MOQ</label>
                <Input
                  type="number"
                  value={bulkPromoData.moq || ""}
                  onChange={(e) => setBulkPromoData({ ...bulkPromoData, moq: e.target.value ? Number(e.target.value) : null })}
                  placeholder="0"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">SOM</label>
                <Input
                  type="number"
                  value={bulkPromoData.som || ""}
                  onChange={(e) => setBulkPromoData({ ...bulkPromoData, som: e.target.value ? Number(e.target.value) : null })}
                  placeholder="0"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Qté Min</label>
                <Input
                  type="number"
                  value={bulkPromoData.minQuantity || ""}
                  onChange={(e) => setBulkPromoData({ ...bulkPromoData, minQuantity: e.target.value ? Number(e.target.value) : null })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Date de début</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 size-4" />
                      {bulkPromoData.startDate ? format(new Date(bulkPromoData.startDate), "dd/MM/yyyy") : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bulkPromoData.startDate ? new Date(bulkPromoData.startDate) : undefined}
                      onSelect={(date) => setBulkPromoData({ ...bulkPromoData, startDate: date ? format(date, "yyyy-MM-dd") : null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Date de fin</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 size-4" />
                      {bulkPromoData.endDate ? format(new Date(bulkPromoData.endDate), "dd/MM/yyyy") : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bulkPromoData.endDate ? new Date(bulkPromoData.endDate) : undefined}
                      onSelect={(date) => setBulkPromoData({ ...bulkPromoData, endDate: date ? format(date, "yyyy-MM-dd") : null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <SheetFooter className="flex-row gap-2">
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                // Create promo config for all selected products
                const selectedProductIds = Array.from(selectedProducts)
                selectedProductIds.forEach((productId) => {
                  const product = products.find((p) => p.id === productId)
                  if (!product) return

                  const newConfig: PromoConfig = {
                    id: `pc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    currentPrice: bulkPromoData.promotionType === "free" ? 0 : null,
                    promotionType: bulkPromoData.promotionType || null,
                    promotionValue: bulkPromoData.promotionValue || null,
                    minQuantity: bulkPromoData.minQuantity || null,
                    moq: bulkPromoData.moq || null,
                    som: bulkPromoData.som || null,
                    startDate: bulkPromoData.startDate || null,
                    endDate: bulkPromoData.endDate || null,
                    label: bulkPromoData.label || "Nouvelle promo",
                  }

                  // Calculate current price if needed
                  if (bulkPromoData.promotionType && bulkPromoData.promotionValue && product.initialPrice) {
                    if (bulkPromoData.promotionType === "absolute") {
                      newConfig.currentPrice = product.initialPrice - bulkPromoData.promotionValue
                    } else if (bulkPromoData.promotionType === "percentage") {
                      newConfig.currentPrice = product.initialPrice * (1 - bulkPromoData.promotionValue / 100)
                    }
                  }

                  onAddPromoConfig(productId, newConfig)
                })

                toast({
                  title: "Promotions créées",
                  description: `${selectedProductIds.length} promotion(s) ajoutée(s) avec succès`,
                })

                // Reset form and close dialog
                setBulkPromoData({
                  label: "",
                  promotionType: null,
                  promotionValue: null,
                  minQuantity: null,
                  moq: null,
                  som: null,
                  startDate: null,
                  endDate: null,
                })
                setBulkDialogOpen(false)
              }}
              disabled={!bulkPromoData.label || !bulkPromoData.promotionType}
            >
              Créer les promotions
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
