"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { X, ChevronDown, ChevronRight, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
                          disabled={product.promoConfigs.length === 0}
                        >
                          {product.promoConfigs.length > 0 ? (
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
                          <Badge variant={product.promoConfigs.length > 0 ? "default" : "secondary"}>
                            {product.promoConfigs.length}
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
                    {isExpanded && product.promoConfigs.length > 0 && (
                      <tr>
                        <td colSpan={9} className="bg-muted/20 p-0">
                          <div className="p-4">
                            <div className="space-y-2">
                              {product.promoConfigs.map((config, index) => (
                                <div
                                  key={config.id}
                                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
                                >
                                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                                      {config.label && (
                                        <Badge variant="outline" className="text-xs">
                                          {config.label}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">Prix:</span>
                                      <span className="font-medium">
                                        {config.currentPrice ? `${config.currentPrice.toFixed(2)} €` : "-"}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">Réduction:</span>
                                      {config.promotionType && config.promotionValue ? (
                                        <Badge variant="secondary">
                                          {config.promotionType === "percentage"
                                            ? `${config.promotionValue}%`
                                            : config.promotionType === "absolute"
                                              ? `${config.promotionValue}€`
                                              : "Gratuit"}
                                        </Badge>
                                      ) : (
                                        <span className="text-sm">-</span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">Qté min:</span>
                                      <span className="text-sm">{config.minQuantity || "-"}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">Période:</span>
                                      <span className="text-sm">
                                        {config.startDate && config.endDate
                                          ? `${config.startDate} → ${config.endDate}`
                                          : "-"}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">Gamme:</span>
                                      <Badge variant="outline" className="text-xs">
                                        {config.gamme}
                                      </Badge>
                                    </div>
                                  </div>

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => onDeletePromoConfig(product.id, config.id)}
                                  >
                                    <X className="size-4" />
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
