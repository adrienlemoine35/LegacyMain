"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { X, ChevronDown, ChevronRight, Plus, Pencil, CalendarIcon, Euro, Percent, Gift } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import type { Product, PromotionType, PromoConfig } from "@/app/page"

interface ProductTableProps {
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
}: ProductTableProps) {
  const { toast } = useToast()
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [editingField, setEditingField] = useState<{ productId: string; configId: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState("")

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

  return (
    <div className="w-full space-y-4">
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
                  Nb Promos
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
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
                                gamme: "M",
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
                                  className="rounded-lg border border-border bg-card p-4"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1 space-y-3">
                                      {/* Header */}
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                                        {editingField?.productId === product.id && editingField?.configId === config.id && editingField?.field === "label" ? (
                                          <div className="flex items-center gap-2">
                                            <Input
                                              value={editValue}
                                              onChange={(e) => setEditValue(e.target.value)}
                                              onBlur={() => saveEdit(product.id, config.id, "label")}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") saveEdit(product.id, config.id, "label")
                                                if (e.key === "Escape") cancelEdit()
                                              }}
                                              className="h-7 w-40"
                                              autoFocus
                                            />
                                          </div>
                                        ) : (
                                          <div
                                            onClick={() => startEditing(product.id, config.id, "label", config.label)}
                                            className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 transition-colors hover:bg-muted"
                                          >
                                            <Badge variant="outline" className="text-xs">
                                              {config.label || "Sans nom"}
                                            </Badge>
                                            <Pencil className="size-3 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Grid of editable fields */}
                                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
                                        {/* Prix actuel */}
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-muted-foreground">Prix actuel</span>
                                          {editingField?.productId === product.id && editingField?.configId === config.id && editingField?.field === "currentPrice" ? (
                                            <div className="flex items-center gap-1">
                                              <Input
                                                type="number"
                                                step="0.01"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => saveEdit(product.id, config.id, "currentPrice")}
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") saveEdit(product.id, config.id, "currentPrice")
                                                  if (e.key === "Escape") cancelEdit()
                                                }}
                                                className="h-7 w-20 text-sm"
                                                autoFocus
                                              />
                                              <span className="text-sm">€</span>
                                            </div>
                                          ) : (
                                            <div
                                              onClick={() => startEditing(product.id, config.id, "currentPrice", config.currentPrice)}
                                              className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-muted"
                                            >
                                              <span className="text-sm font-medium">
                                                {config.currentPrice ? `${config.currentPrice.toFixed(2)} €` : "-"}
                                              </span>
                                              <Pencil className="size-3 text-muted-foreground" />
                                            </div>
                                          )}
                                        </div>

                                        {/* Type de réduction */}
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-muted-foreground">Réduction</span>
                                          <Select
                                            value={config.promotionType || ""}
                                            onValueChange={(v) => onUpdatePromoConfig(product.id, config.id, { promotionType: v as PromotionType })}
                                          >
                                            <SelectTrigger className="h-8 w-full">
                                              <SelectValue placeholder="Type" />
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
                                                  <span>%</span>
                                                </div>
                                              </SelectItem>
                                              <SelectItem value="free">
                                                <div className="flex items-center gap-2">
                                                  <Gift className="size-4" />
                                                  <span>Gratuit</span>
                                                </div>
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        {/* Valeur de réduction */}
                                        {config.promotionType && config.promotionType !== "free" && (
                                          <div className="flex flex-col gap-1">
                                            <span className="text-xs text-muted-foreground">Valeur</span>
                                            {editingField?.productId === product.id && editingField?.configId === config.id && editingField?.field === "promotionValue" ? (
                                              <Input
                                                type="number"
                                                step="0.01"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => saveEdit(product.id, config.id, "promotionValue")}
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") saveEdit(product.id, config.id, "promotionValue")
                                                  if (e.key === "Escape") cancelEdit()
                                                }}
                                                className="h-7 w-20 text-sm"
                                                autoFocus
                                              />
                                            ) : (
                                              <div
                                                onClick={() => startEditing(product.id, config.id, "promotionValue", config.promotionValue)}
                                                className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-muted"
                                              >
                                                <span className="text-sm font-medium">
                                                  {config.promotionValue
                                                    ? config.promotionType === "percentage"
                                                      ? `${config.promotionValue}%`
                                                      : `${config.promotionValue}€`
                                                    : "-"}
                                                </span>
                                                <Pencil className="size-3 text-muted-foreground" />
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* Quantité minimale */}
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-muted-foreground">Qté min</span>
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
                                              className="h-7 w-16 text-sm"
                                              autoFocus
                                            />
                                          ) : (
                                            <div
                                              onClick={() => startEditing(product.id, config.id, "minQuantity", config.minQuantity)}
                                              className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-muted"
                                            >
                                              <span className="text-sm">{config.minQuantity || "-"}</span>
                                              <Pencil className="size-3 text-muted-foreground" />
                                            </div>
                                          )}
                                        </div>

                                        {/* MOQ */}
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-muted-foreground">MOQ</span>
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
                                              className="h-7 w-16 text-sm"
                                              autoFocus
                                            />
                                          ) : (
                                            <div
                                              onClick={() => startEditing(product.id, config.id, "moq", config.moq)}
                                              className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-muted"
                                            >
                                              <span className="text-sm font-medium">{config.moq || "-"}</span>
                                              <Pencil className="size-3 text-muted-foreground" />
                                            </div>
                                          )}
                                        </div>

                                        {/* SOM */}
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-muted-foreground">SOM</span>
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
                                              className="h-7 w-16 text-sm"
                                              autoFocus
                                            />
                                          ) : (
                                            <div
                                              onClick={() => startEditing(product.id, config.id, "som", config.som)}
                                              className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-muted"
                                            >
                                              <span className="text-sm font-medium">{config.som || "-"}</span>
                                              <Pencil className="size-3 text-muted-foreground" />
                                            </div>
                                          )}
                                        </div>

                                        {/* Date début */}
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-muted-foreground">Date début</span>
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button variant="outline" className="h-8 w-full justify-start text-left text-sm font-normal bg-transparent">
                                                <CalendarIcon className="mr-2 size-4" />
                                                {config.startDate ? format(new Date(config.startDate), "dd/MM/yyyy") : "Date"}
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

                                        {/* Date fin */}
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-muted-foreground">Date fin</span>
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Button variant="outline" className="h-8 w-full justify-start text-left text-sm font-normal bg-transparent">
                                                <CalendarIcon className="mr-2 size-4" />
                                                {config.endDate ? format(new Date(config.endDate), "dd/MM/yyyy") : "Date"}
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

                                        {/* Gamme */}
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs text-muted-foreground">Gamme</span>
                                          <Select
                                            value={config.gamme}
                                            onValueChange={(v) => onUpdatePromoConfig(product.id, config.id, { gamme: v as "M" | "D" })}
                                          >
                                            <SelectTrigger className="h-8 w-20">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="M">M</SelectItem>
                                              <SelectItem value="D">D</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Delete button */}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                      onClick={() => onDeletePromoConfig(product.id, config.id)}
                                    >
                                      <X className="size-4" />
                                    </Button>
                                  </div>
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
