"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  BookOpen,
  Plus,
  Search,
  X,
  Calendar,
  User,
  Package,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface PromoBook {
  id: string
  name: string
  description?: string
  createdAt: string
  owner: string
  productCount: number
  tags: string[]
  products: PromoBookProduct[]
  filters: PromoBookFilters
  sorts: PromoBookSort[]
}

export interface PromoBookProduct {
  productId: string
  currentPrice: number | null
  promotionType: "absolute" | "percentage" | "free" | null
  promotionValue: number | null
  minQuantity: number | null
  startDate: string | null
  endDate: string | null
  gamme: "M" | "D"
}

export interface PromoBookFilters {
  categoryTypes: string[]
  supplierTypes: string[]
  gammeTypes: ("M" | "D")[]
  stockRange: [number, number]
  initialPriceRange: [number, number]
  currentPriceRange: [number, number]
  reductionTypes: ("absolute" | "percentage" | "free")[]
}

export interface PromoBookSort {
  field: string
  direction: "asc" | "desc"
  priority: number
}

interface PromoBookPanelProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  activePromoBook: PromoBook | null
  onActivatePromoBook: (promoBook: PromoBook) => void
  onClosePromoBook: () => void
  onCreatePromoBook: (name: string, description: string) => void
  modifiedProductsCount: number
  promoBooks: PromoBook[]
  onDeletePromoBook: (id: string) => void
}

// Mock data for demonstration
const MOCK_PROMOBOOKS: PromoBook[] = [
  {
    id: "pb1",
    name: "Promo Outillage Été 2024",
    description: "Réductions sur l'outillage électrique Bosch et Makita",
    createdAt: "2024-01-15",
    owner: "Jean Dupont",
    productCount: 5,
    tags: ["Outillage électrique", "Bosch", "Makita"],
    products: [
      {
        productId: "P001",
        currentPrice: 129.99,
        promotionType: "absolute",
        promotionValue: 20,
        minQuantity: null,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        gamme: "M",
      },
      {
        productId: "P002",
        currentPrice: 269.99,
        promotionType: "absolute",
        promotionValue: 30,
        minQuantity: null,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        gamme: "D",
      },
      {
        productId: "P003",
        currentPrice: 161.99,
        promotionType: "percentage",
        promotionValue: 15,
        minQuantity: null,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        gamme: "M",
      },
      {
        productId: "P004",
        currentPrice: 67.99,
        promotionType: "percentage",
        promotionValue: 15,
        minQuantity: null,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        gamme: "M",
      },
      {
        productId: "P006",
        currentPrice: 76.49,
        promotionType: "percentage",
        promotionValue: 15,
        minQuantity: null,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        gamme: "M",
      },
    ],
    filters: {
      categoryTypes: ["Outillage électrique"],
      supplierTypes: ["Bosch", "Makita"],
      gammeTypes: [],
      stockRange: [0, 1000],
      initialPriceRange: [0, 500],
      currentPriceRange: [0, 500],
      reductionTypes: [],
    },
    sorts: [
      {
        field: "supplier",
        direction: "asc",
        priority: 1,
      },
      {
        field: "initialPrice",
        direction: "desc",
        priority: 2,
      },
    ],
  },
  {
    id: "pb2",
    name: "Black Friday Peinture",
    description: "Offres spéciales sur toute la gamme peinture",
    createdAt: "2024-01-10",
    owner: "Marie Martin",
    productCount: 4,
    tags: ["Peinture"],
    products: [
      {
        productId: "P009",
        currentPrice: 32.19,
        promotionType: "percentage",
        promotionValue: 30,
        minQuantity: 2,
        startDate: "2024-11-25",
        endDate: "2024-11-29",
        gamme: "D",
      },
      {
        productId: "P010",
        currentPrice: 9.09,
        promotionType: "percentage",
        promotionValue: 30,
        minQuantity: 5,
        startDate: "2024-11-25",
        endDate: "2024-11-29",
        gamme: "D",
      },
      {
        productId: "P011",
        currentPrice: 17.49,
        promotionType: "percentage",
        promotionValue: 30,
        minQuantity: 3,
        startDate: "2024-11-25",
        endDate: "2024-11-29",
        gamme: "D",
      },
      {
        productId: "P012",
        currentPrice: 6.29,
        promotionType: "percentage",
        promotionValue: 30,
        minQuantity: 10,
        startDate: "2024-11-25",
        endDate: "2024-11-29",
        gamme: "D",
      },
    ],
    filters: {
      categoryTypes: ["Peinture"],
      supplierTypes: [],
      gammeTypes: ["D"],
      stockRange: [0, 1000],
      initialPriceRange: [0, 500],
      currentPriceRange: [0, 500],
      reductionTypes: ["percentage"],
    },
    sorts: [
      {
        field: "stock",
        direction: "desc",
        priority: 1,
      },
    ],
  },
]

export function PromoBookPanel({
  isOpen,
  onOpenChange,
  activePromoBook,
  onActivatePromoBook,
  onClosePromoBook,
  onCreatePromoBook,
  modifiedProductsCount,
  promoBooks,
  onDeletePromoBook,
}: PromoBookPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newPromoBookName, setNewPromoBookName] = useState("")
  const [newPromoBookDescription, setNewPromoBookDescription] = useState("")

  const allPromoBooks = [...MOCK_PROMOBOOKS, ...promoBooks]

  const filteredPromoBooks = allPromoBooks.filter(
    (pb) =>
      pb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pb.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = () => {
    if (newPromoBookName.trim()) {
      onCreatePromoBook(newPromoBookName, newPromoBookDescription)
      setNewPromoBookName("")
      setNewPromoBookDescription("")
      setShowCreateDialog(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:max-w-[400px] p-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary" />
              <SheetTitle>PromoBooks</SheetTitle>
            </div>
          </SheetHeader>

          {/* Active PromoBook Banner */}
          {activePromoBook && (
            <div className="mx-4 mt-4 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">Actif</Badge>
                  <span className="font-medium text-sm">{activePromoBook.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClosePromoBook}
                  className="h-7 px-2 text-xs"
                >
                  <X className="size-3 mr-1" />
                  Fermer
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <p>{modifiedProductsCount} produit(s) modifié(s)</p>
                <p>Les modifications sont sauvegardées automatiquement</p>
              </div>
            </div>
          )}

          {/* Search and Create */}
          <div className="px-4 py-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un PromoBook..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="h-9">
              <Plus className="size-4 mr-1" />
              Nouveau
            </Button>
          </div>

          {/* PromoBook List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
            {filteredPromoBooks.map((promoBook) => (
              <div
                key={promoBook.id}
                className={`rounded-lg border p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                  activePromoBook?.id === promoBook.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => onActivatePromoBook(promoBook)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{promoBook.name}</h3>
                    {promoBook.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {promoBook.description}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="size-7 shrink-0">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onActivatePromoBook(promoBook)}>
                        Ouvrir
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeletePromoBook(promoBook.id)}
                        className="text-destructive"
                      >
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>{formatDate(promoBook.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="size-3" />
                    <span>{promoBook.owner}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Package className="size-3" />
                  <span>{promoBook.productCount} produit(s)</span>
                </div>

                {promoBook.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {promoBook.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs px-2 py-0 h-5"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {filteredPromoBooks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun PromoBook trouvé</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Create PromoBook Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un PromoBook</DialogTitle>
            <DialogDescription>
              Sauvegardez vos filtres et modifications actuels.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="promobook-name">Nom</Label>
              <Input
                id="promobook-name"
                placeholder="Ex: Promo Été 2024"
                value={newPromoBookName}
                onChange={(e) => setNewPromoBookName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promobook-description">
                Description (optionnel)
              </Label>
              <Input
                id="promobook-description"
                placeholder="Ex: Réductions sur l'outillage"
                value={newPromoBookDescription}
                onChange={(e) => setNewPromoBookDescription(e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="text-muted-foreground mb-2">Ce PromoBook contiendra :</p>
              <div className="flex items-center gap-2 text-foreground">
                <Package className="size-4 text-primary" />
                <span className="font-medium">{modifiedProductsCount} produit(s) modifié(s)</span>
              </div>
              <div className="flex items-center gap-2 text-foreground mt-1">
                <User className="size-4 text-primary" />
                <span>Propriétaire: Utilisateur actuel</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newPromoBookName.trim()}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Header Button Component
interface PromoBookButtonProps {
  onClick: () => void
  activePromoBook: PromoBook | null
  promoBookCount: number
}

export function PromoBookButton({
  onClick,
  activePromoBook,
  promoBookCount,
}: PromoBookButtonProps) {
  if (activePromoBook) {
    return (
      <Button
        onClick={onClick}
        variant="default"
        className="bg-primary hover:bg-primary/90"
      >
        <BookOpen className="mr-2 size-4" />
        {activePromoBook.name}
      </Button>
    )
  }

  return (
    <Button onClick={onClick} variant="outline">
      <BookOpen className="mr-2 size-4" />
      PromoBooks
      {promoBookCount > 0 && (
        <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
          {promoBookCount}
        </Badge>
      )}
    </Button>
  )
}

// Active PromoBook Banner Component
interface ActivePromoBookBannerProps {
  promoBook: PromoBook
  onClose: () => void
}

export function ActivePromoBookBanner({
  promoBook,
  onClose,
}: ActivePromoBookBannerProps) {
  return (
    <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 mx-6 mt-4">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center">
          <BookOpen className="size-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-primary">
            PromoBook actif : {promoBook.name}
          </p>
          <p className="text-xs text-muted-foreground">
            Toutes les modifications sont sauvegardées automatiquement
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="h-8 bg-transparent">
        Auto-save
      </Button>
    </div>
  )
}
