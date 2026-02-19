"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { X, ChevronDown, ChevronRight, Plus, Pencil, CalendarIcon, Euro, Percent, Gift, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import type { Product, PromotionType, PromoConfig } from "@/app/page"

interface ProductTableV2Props {
  products: Product[]
  selectedProducts: Set<string>
  onSelectProducts: (selected: Set<string>) => void
  onAddPromoConfig: (productId: string, config: PromoConfig) => void
  onUpdatePromoConfig: (productId: string, configId: string, config: Partial<PromoConfig>) => void
  onDeletePromoConfig: (productId: string, configId: string) => void
}

export function ProductTableV2({
  products,
  selectedProducts,
  onSelectProducts,
  onAddPromoConfig,
  onUpdatePromoConfig,
  onDeletePromoConfig,
}: ProductTableV2Props) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [editingField, setEditingField] = useState<{ productId: string; configId: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState("")
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

  // Filter products by name or promo config labels
  const filteredProducts = products.filter((product) => {
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
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher un produit ou un promoparamétrage..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
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
                  Référence
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  Nom du produit
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  Rayon
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  Fournisseur
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  Stock
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  Prix initial
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  Gamme
                </th>
                <th className="border-l border-border p-4 text-left text-xs font-medium uppercase tracking-wide text-secondary">
                  Nb Promos
                </th>
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
                        <Select
                          value={product.gamme}
                          onValueChange={(v) => {
                            // Update product gamme - would need a callback prop
                            toast({
                              title: "Gamme mise à jour",
                              description: `Gamme changée en ${v}`,
                            })
                          }}
                        >
                          <SelectTrigger className="h-8 w-16">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">M</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 text-left">
                        <div className="flex items-center gap-2">
                          <Badge variant={hasConfigs ? "default" : "secondary"}>
                            {promoConfigs.length}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
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
                    </tr>

                    {/* Expanded Promo Configs */}
                    {isExpanded && hasConfigs && (
                      <tr>
                        <td colSpan={9} className="bg-muted/20 p-0">
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
    </div>
  )
}
