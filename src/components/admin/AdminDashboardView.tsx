import React, { useState, useEffect } from 'react';
import { 
  Shield, Plus, Edit, Trash2, ArrowLeft, Package, 
  DollarSign, ShoppingCart, Download, Check, AlertCircle, X 
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { Artwork, Category } from '../../types/index.ts';

interface AdminDashboardViewProps {
  onBackToCatalog: () => void;
  categories: Category[];
  onRefreshCategories: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onBackToCatalog,
  categories,
  onRefreshCategories,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'categories'>('inventory');
  const [stats, setStats] = useState<any>({
    totalArtworks: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalDownloads: 0,
  });
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Artwork Modal Form State
  const [isArtModalOpen, setIsArtModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    artistName: '',
    artistBio: '',
    categoryId: '1',
    thumbnailUrl: '',
    fileFormats: 'BLEND, OBJ, PNG, 4K PBR',
    resolution: '8192x8192 px',
    fileSizeMb: '250',
    downloadUrl: 'https://cdn.artvault.io/vault/files/artvault-custom-asset.zip',
    basePricePersonal: '29.00',
    priceCommercial: '79.00',
    isFeatured: false,
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [catSuccess, setCatSuccess] = useState('');

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, artsRes, ordersRes] = await Promise.all([
        api.getAdminStats(),
        api.getArtworks({ limit: 50 }),
        api.getAdminOrders(),
      ]);
      setStats(statsRes.stats || {});
      setArtworks(artsRes.items || []);
      setOrders(ordersRes.orders || []);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const openCreateModal = () => {
    setEditingArtwork(null);
    setFormData({
      title: '',
      description: '',
      artistName: 'ArtVault Resident Artist',
      artistBio: 'Digital concept designer and 3D asset developer.',
      categoryId: categories[0]?.id.toString() || '1',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      fileFormats: 'BLEND, FBX, GLTF, 4K PBR Maps',
      resolution: '4096x4096 px PBR Maps',
      fileSizeMb: '180.0',
      downloadUrl: 'https://cdn.artvault.io/vault/files/artvault-custom-asset.zip',
      basePricePersonal: '29.00',
      priceCommercial: '79.00',
      isFeatured: false,
    });
    setFormError('');
    setFormSuccess('');
    setIsArtModalOpen(true);
  };

  const openEditModal = (art: Artwork) => {
    setEditingArtwork(art);
    setFormData({
      title: art.title,
      description: art.description,
      artistName: art.artistName,
      artistBio: art.artistBio || '',
      categoryId: art.categoryId.toString(),
      thumbnailUrl: art.thumbnailUrl,
      fileFormats: art.fileFormats,
      resolution: art.resolution,
      fileSizeMb: art.fileSizeMb.toString(),
      downloadUrl: art.downloadUrl,
      basePricePersonal: art.basePricePersonal.toString(),
      priceCommercial: art.priceCommercial.toString(),
      isFeatured: art.isFeatured,
    });
    setFormError('');
    setFormSuccess('');
    setIsArtModalOpen(true);
  };

  const handleSaveArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.thumbnailUrl) {
      setFormError('Please fill out title, description, and thumbnail URL.');
      return;
    }

    setIsSaving(true);
    setFormError('');
    try {
      if (editingArtwork) {
        await api.updateArtwork(editingArtwork.id, {
          title: formData.title,
          description: formData.description,
          artistName: formData.artistName,
          artistBio: formData.artistBio,
          categoryId: Number(formData.categoryId),
          thumbnailUrl: formData.thumbnailUrl,
          fileFormats: formData.fileFormats,
          resolution: formData.resolution,
          fileSizeMb: Number(formData.fileSizeMb),
          downloadUrl: formData.downloadUrl,
          basePricePersonal: Number(formData.basePricePersonal),
          priceCommercial: Number(formData.priceCommercial),
          isFeatured: formData.isFeatured,
        });
        setFormSuccess('Artwork updated successfully!');
      } else {
        await api.createArtwork({
          title: formData.title,
          description: formData.description,
          artistName: formData.artistName,
          artistBio: formData.artistBio,
          categoryId: Number(formData.categoryId),
          thumbnailUrl: formData.thumbnailUrl,
          previewImages: [formData.thumbnailUrl],
          fileFormats: formData.fileFormats,
          resolution: formData.resolution,
          fileSizeMb: Number(formData.fileSizeMb),
          downloadUrl: formData.downloadUrl,
          basePricePersonal: Number(formData.basePricePersonal),
          priceCommercial: Number(formData.priceCommercial),
          isFeatured: formData.isFeatured,
        });
        setFormSuccess('Artwork published to catalogue!');
      }

      await loadAdminData();
      setTimeout(() => {
        setIsArtModalOpen(false);
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArtwork = async (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}" from the marketplace catalogue?`)) {
      try {
        await api.deleteArtwork(id);
        await loadAdminData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete artwork');
      }
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;
    try {
      await api.createCategory({
        name: newCatName,
        slug: newCatSlug,
        description: newCatDesc,
        iconName: 'Box',
      });
      setCatSuccess('Category created!');
      setNewCatName('');
      setNewCatSlug('');
      setNewCatDesc('');
      onRefreshCategories();
      await loadAdminData();
      setTimeout(() => setCatSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to create category');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <button
            onClick={onBackToCatalog}
            className="text-xs text-neutral-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Catalogue</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-amber-400" />
            <span>Admin Curation Console</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Manage inventory CRUD, review platform orders, and maintain digital rights taxonomy.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-[0_0_15px_rgba(245,158,11,0.25)] whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Artwork</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#121218] border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase">Catalogue Artworks</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-display font-bold text-white tabular-nums">
            {stats.totalArtworks}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121218] border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase">Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-display font-bold text-white tabular-nums">
            ${stats.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121218] border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase">Orders Completed</span>
            <ShoppingCart className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-display font-bold text-white tabular-nums">
            {stats.totalOrders}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121218] border border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono uppercase">Total Downloads</span>
            <Download className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-display font-bold text-white tabular-nums">
            {stats.totalDownloads}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 text-xs">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors ${
            activeTab === 'inventory'
              ? 'bg-amber-500/15 text-amber-300 font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Artworks Inventory ({artworks.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors ${
            activeTab === 'orders'
              ? 'bg-amber-500/15 text-amber-300 font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Platform Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors ${
            activeTab === 'categories'
              ? 'bg-amber-500/15 text-amber-300 font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Categories ({categories.length})
        </button>
      </div>

      {/* Tab 1: Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="bg-[#111117] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-[#161622] text-neutral-400 uppercase font-mono text-[10px] border-b border-white/[0.08]">
                <tr>
                  <th className="p-3.5">Asset</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Artist</th>
                  <th className="p-3.5">Personal / Comm.</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {artworks.map((art) => (
                  <tr key={art.id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={art.thumbnailUrl}
                          alt={art.title}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-900 border border-white/[0.08]"
                        />
                        <div>
                          <p className="font-semibold text-white max-w-xs truncate">{art.title}</p>
                          <p className="text-[11px] text-neutral-500 font-mono truncate">{art.fileFormats}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-neutral-400 font-mono text-[11px]">{art.categoryName}</td>
                    <td className="p-3.5">{art.artistName}</td>
                    <td className="p-3.5 font-mono text-white tabular-nums">
                      ${art.basePricePersonal.toFixed(2)} / ${art.priceCommercial.toFixed(2)}
                    </td>
                    <td className="p-3.5 font-mono text-amber-400">
                      ★ {art.averageRating > 0 ? art.averageRating.toFixed(1) : '—'} ({art.reviewCount})
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(art)}
                        className="p-1.5 text-neutral-400 hover:text-amber-400 rounded hover:bg-white/[0.05] transition-colors"
                        title="Edit Artwork"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteArtwork(art.id, art.title)}
                        className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-white/[0.05] transition-colors"
                        title="Delete Artwork"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Ledger */}
      {activeTab === 'orders' && (
        <div className="bg-[#111117] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-[#161622] text-neutral-400 uppercase font-mono text-[10px] border-b border-white/[0.08]">
                <tr>
                  <th className="p-3.5">Order Number</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5 font-mono text-amber-400 font-semibold">{ord.order_number}</td>
                    <td className="p-3.5">
                      <p className="font-medium text-white">{ord.billing_name}</p>
                      <p className="text-[11px] text-neutral-500">{ord.billing_email}</p>
                    </td>
                    <td className="p-3.5 font-mono">{ord.items?.length || 1} asset(s)</td>
                    <td className="p-3.5 font-mono font-bold text-white tabular-nums">${ord.total_amount.toFixed(2)}</td>
                    <td className="p-3.5">
                      <span className="text-[10px] uppercase font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-400 font-mono text-[11px]">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Category Management */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111117] border border-white/[0.08] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Create New Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-400">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  placeholder="e.g. Generative AI Models"
                  className="w-full bg-[#161622] border border-white/[0.1] rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400">URL Slug</label>
                <input
                  type="text"
                  required
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="generative-ai"
                  className="w-full bg-[#161622] border border-white/[0.1] rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400">Description</label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Asset specifications and usage..."
                  className="w-full bg-[#161622] border border-white/[0.1] rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {catSuccess && (
                <div className="text-emerald-400 text-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{catSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
              >
                Add Category
              </button>
            </form>
          </div>

          <div className="bg-[#111117] border border-white/[0.08] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Active Categories ({categories.length})</h3>
            <div className="space-y-2 text-xs">
              {categories.map((c) => (
                <div key={c.id} className="p-3 rounded-lg bg-[#151520] border border-white/[0.04] flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-neutral-500 font-mono text-[11px]">{c.slug}</p>
                  </div>
                  <span className="font-mono text-amber-400 text-xs">{c.artworkCount || 0} items</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Artwork Create / Edit Modal */}
      {isArtModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#0E0E15] border border-white/[0.12] rounded-2xl shadow-2xl p-6 text-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <h3 className="text-base font-display font-bold text-white">
                {editingArtwork ? `Edit Artwork: ${editingArtwork.title}` : 'Publish New Digital Art Asset'}
              </h3>
              <button
                onClick={() => setIsArtModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArtwork} className="pt-4 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-neutral-400">Artwork Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Celestial Monolith"
                    className="w-full bg-[#161622] border border-white/[0.1] rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-[#161622] border border-white/[0.1] rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Asset description, polygon density, software requirements..."
                  className="w-full bg-[#161622] border border-white/[0.1] rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-neutral-400">Artist Name</label>
                  <input
                    type="text"
                    required
                    value={formData.artistName}
                    onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                    className="w-full bg-[#161622] border border-white/[0.1] rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400">Thumbnail Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    className="w-full bg-[#161622] border border-white/[0.1] rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400">File Formats</label>
                  <input
                    type="text"
                    value={formData.fileFormats}
                    onChange={(e) => setFormData({ ...formData, fileFormats: e.target.value })}
                    className="w-full bg-[#161622] border border-white/[0.1] rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-400">Resolution</label>
                  <input
                    type="text"
                    value={formData.resolution}
                    onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                    className="w-full bg-[#161622] border border-white/[0.1] rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-400">File Size (MB)</label>
                  <input
                    type="number"
                    value={formData.fileSizeMb}
                    onChange={(e) => setFormData({ ...formData, fileSizeMb: e.target.value })}
                    className="w-full bg-[#161622] border border-white/[0.1] rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-neutral-400">Personal License Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.basePricePersonal}
                    onChange={(e) => setFormData({ ...formData, basePricePersonal: e.target.value })}
                    className="w-full bg-[#161622] border border-white/[0.1] rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-400">Commercial License Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.priceCommercial}
                    onChange={(e) => setFormData({ ...formData, priceCommercial: e.target.value })}
                    className="w-full bg-[#161622] border border-white/[0.1] rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsArtModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingArtwork ? 'Update Artwork' : 'Publish Asset'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
