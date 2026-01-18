"use client";
import {
  Edit,
  Trash2,
  Eye,
  PlusCircle,
  Search,
  Filter,
  TrendingUp,
  Package,
  Loader2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteConfirmationModal from '@/components/delete-confirmation-modal';
import axiosInstance from '@/libs/axiosInterceptor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type ProductImage = {
  fileId?: string;
  file_url?: string;
};

type ProductApi = {
  id: string;
  productTitle?: string | null;
  shortDescription?: string | null;
  tags?: string[];
  warranty?: string | null;
  brand?: string | null;
  slug?: string | null;
  videoUrl?: string | null;
  category?: string | null;
  subCategory?: string | null;
  regularPrice?: number | string | { $numberLong?: string } | null;
  salePrice?: number | string | { $numberLong?: string } | null;
  stock?: number | string | { $numberLong?: string } | null;
  cashOnDelivery?: boolean;
  sizes?: string[];
  colors?: string[];
  custom_specifications?: Array<{ name: string; value: string }>;
  images?: ProductImage[];
  primaryImage?: string | null;
  discountCodes?: string[];
  rating?: number | string | null;
  totalReviews?: number | string | { $numberLong?: string } | null;
  status?: string | null;
  createdAt?: string | { $date?: string } | Date | null;
  updatedAt?: string | { $date?: string } | Date | null;
  publishedAt?: string | { $date?: string } | Date | null;
  deletedAt?: string | { $date?: string } | Date | null;
};

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  category: string;
  subCategory: string;
  brand: string | null;
  tags: string[];
  regularPrice: number | null;
  salePrice: number | null;
  stock: number;
  status: string;
  rating: number;
  sales: number;
  primaryImage: string | null;
  createdAt: string | null;
  deletedAt: string | null;
};

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-600',
  pending: 'bg-amber-50 text-amber-600',
  draft: 'bg-slate-50 text-slate-600',
  'low stock': 'bg-amber-50 text-amber-600',
  'out of stock': 'bg-red-50 text-red-600',
};

const statusDotStyles: Record<string, string> = {
  active: 'bg-emerald-500',
  pending: 'bg-amber-500',
  draft: 'bg-slate-400',
  'low stock': 'bg-amber-500',
  'out of stock': 'bg-red-500',
};

const stockStyles = (stock: number | null | undefined): string => {
  const value = typeof stock === 'number' && !Number.isNaN(stock) ? stock : 0;
  if (value === 0) return 'text-red-600 font-semibold';
  if (value < 50) return 'text-amber-600 font-semibold';
  return 'text-slate-900 font-semibold';
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const formatCurrency = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return '—';
  }
  return currencyFormatter.format(value);
};

const formatNumber = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return value.toLocaleString();
};

const formatStatusLabel = (status: string | null | undefined): string => {
  if (!status) return 'Unknown';
  return status
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

type NumericLike = number | string | { $numberLong?: string } | null | undefined;
type DateLike = string | { $date?: string } | Date | null | undefined;

const parseNumericLike = (value: NumericLike): number => {
  if (typeof value === 'number') {
    return Number.isNaN(value) ? 0 : value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (value && typeof value === 'object' && '$numberLong' in value) {
    const raw = (value as { $numberLong?: string }).$numberLong;
    const parsed = raw ? Number(raw) : NaN;
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

const parseDateLike = (value: DateLike): string | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toISOString();
  }

  if (typeof value === 'object' && '$date' in value) {
    return parseDateLike((value as { $date?: string }).$date ?? null);
  }

  return null;
};

const mapProductFromApi = (product: ProductApi): ProductRow => {
  const saleValue = parseNumericLike(product.salePrice);
  const regularValue = parseNumericLike(product.regularPrice);
  const stockValue = Math.max(0, Math.trunc(parseNumericLike(product.stock)));
  const ratingValue = parseNumericLike(product.rating);
  const salesValue = parseNumericLike(product.totalReviews);
  const derivedPrimaryImage =
    typeof product.primaryImage === 'string' && product.primaryImage.trim().length > 0
      ? product.primaryImage
      : Array.isArray(product.images)
      ? product.images.find((image) => typeof image?.file_url === 'string')?.file_url ?? null
      : null;

  return {
    id: product.id,
    name: product.productTitle ?? 'Untitled product',
    sku: product.slug ?? product.id,
    category: product.category ?? 'Uncategorised',
    subCategory: product.subCategory ?? 'General',
    brand: product.brand ?? null,
    tags: Array.isArray(product.tags) ? product.tags : [],
    regularPrice: regularValue > 0 ? regularValue : null,
    salePrice: saleValue > 0 ? saleValue : null,
    stock: stockValue,
    status: product.status ?? 'draft',
    rating: ratingValue,
    sales: salesValue,
    primaryImage: derivedPrimaryImage,
    createdAt: parseDateLike(product.createdAt),
    deletedAt: parseDateLike(product.deletedAt),
  };
};

const Page = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductRow | null>(null);

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    isError,
    refetch: fetchProducts,
  } = useQuery({
    queryKey: ['seller-products'],
    queryFn: async () => {
      const response = await axiosInstance.get('/products/api/products');
      const items = Array.isArray(response.data?.products)
        ? (response.data.products as ProductApi[])
        : [];
      return items.map(mapProductFromApi);
    },
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      await Promise.all(
        productIds.map((id) =>
          axiosInstance.delete(`/products/api/products/${id}`)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    },
  });

  useEffect(() => {
    if (!products.length) {
      setSelectedProducts([]);
      return;
    }

    setSelectedProducts((prev) =>
      prev.filter((id) => products.some((product) => product.id === id))
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const haystack = [
        product.name,
        product.sku,
        product.category,
        product.subCategory,
        product.brand ?? '',
        ...product.tags,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [products, searchQuery]);

  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const handleDeleteClick = (product: ProductRow) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    const idsToRemove =
      selectedProducts.length > 1
        ? [...selectedProducts]
        : [productToDelete.id];

    try {
      await deleteMutation.mutateAsync(idsToRemove);
      setSelectedProducts((prev) => prev.filter((id) => !idsToRemove.includes(id)));
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product(s):', error);
      alert('Failed to delete product(s). Please try again.');
    }
  };

  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) return;

    const productsToDelete = products.filter((p) =>
      selectedProducts.includes(p.id)
    );

    if (!productsToDelete.length) {
      return;
    }

    // For multiple deletes, you might want to show a different message
    setProductToDelete({
      ...productsToDelete[0],
      name: `${selectedProducts.length} selected product${selectedProducts.length > 1 ? 's' : ''}`,
    });
    setDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    if (deleteMutation.isPending) return; // Prevent closing while deleting
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/30 p-6 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            All Products
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your product listings, inventory, and pricing all in one place.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary inline-flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" /> New product
        </motion.button>
      </motion.header>

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:gap-3"
      >
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-500" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-primary w-full pl-11"
          />
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Filter className="h-4 w-4" /> Filter
        </motion.button>
      </motion.div>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 flex flex-col card overflow-hidden"
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-soft">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Products
              </h2>
              <p className="text-sm text-slate-500">{filteredProducts.length} total items</p>
            </div>
          </div>
          <AnimatePresence>
            {selectedProducts.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3"
              >
                <span className="text-sm font-medium text-slate-600">
                  {selectedProducts.length} selected
                </span>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteSelected}
                  className="rounded-xl border border-red-200 bg-red-50/50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                  Delete selected
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50/90 sticky top-0 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedProducts.length === filteredProducts.length &&
                      filteredProducts.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 transition"
                  />
                </th>
                <th scope="col" className="px-6 py-3">
                  Product Name
                </th>
                <th scope="col" className="px-6 py-3">
                  SKU
                </th>
                <th scope="col" className="px-6 py-3">
                  Category
                </th>
                <th scope="col" className="px-6 py-3">
                  Price
                </th>
                <th scope="col" className="px-6 py-3">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Rating
                </th>
                <th scope="col" className="px-6 py-3">
                  Sales
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/60">
              {isLoadingProducts ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-slate-500 font-medium">Unable to load products right now. Please try again soon.</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchProducts()}
                        className="btn-primary px-4 py-2 text-sm"
                      >
                        Retry
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => {
                  const normalizedStatus = product.status?.toLowerCase() ?? 'unknown';
                  const badgeClass =
                    statusStyles[normalizedStatus] ?? 'bg-slate-100 text-slate-600';
                  const dotClass = statusDotStyles[normalizedStatus] ?? 'bg-slate-400';

                  return (
                    <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + (index * 0.03) }}
                    className={`group transition ${
                      selectedProducts.includes(product.id)
                        ? 'bg-brand-50/50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 transition focus:ring-brand-500"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 group-hover:text-brand-600 transition-colors">
                      <div className="flex flex-col">
                        <span>{product.name}</span>
                        {product.brand ? (
                          <span className="text-xs text-slate-500">Brand: {product.brand}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <code className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-700 group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
                        {product.sku}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium">
                          {product.category}
                        </span>
                        <span className="text-xs text-slate-400">{product.subCategory}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div className="flex flex-col">
                        <span>{formatCurrency(product.salePrice ?? product.regularPrice)}</span>
                        {product.salePrice &&
                          product.regularPrice &&
                          product.salePrice < product.regularPrice && (
                            <span className="text-xs text-slate-500 line-through">
                              {formatCurrency(product.regularPrice)}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${stockStyles(product.stock)}`}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          product.stock === 0
                            ? 'bg-red-500 animate-pulse'
                            : product.stock < 50
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-emerald-500'
                        }`} />
                        {product.stock} units
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                        {formatStatusLabel(product.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">
                          {Number.isFinite(product.rating)
                            ? product.rating.toFixed(1)
                            : '0.0'}
                        </span>
                        <span className="text-amber-500">★</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="font-medium">{formatNumber(product.sales)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200"
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteClick(product)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                    </motion.tr>
                  );
                })
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                        <Package className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">
                        No products found. Try adjusting your search criteria.
                      </p>
                    </div>
                  </td>
                </motion.tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600 bg-slate-50/30">
          <span className="font-medium">Showing {filteredProducts.length} of {products.length} products</span>
          <div className="flex gap-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-ghost"
            >
              Previous
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              1
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-ghost"
            >
              Next
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDeleteConfirm}
        title={selectedProducts.length > 1 ? 'Delete Multiple Products' : 'Delete Product'}
        description={
          selectedProducts.length > 1
            ? `Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`
            : 'Are you sure you want to delete this product? This action cannot be undone and all associated data will be permanently removed.'
        }
        itemName={productToDelete?.name}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default Page;
