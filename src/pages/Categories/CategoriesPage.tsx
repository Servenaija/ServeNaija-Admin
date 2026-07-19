import { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout/Layout';
import Card, { CardBody } from '../../components/UI/Card';
import { Badge } from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import SearchInput from '../../components/UI/SearchInput';
import { useApp } from '../../context/AppContext';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Tag } from 'lucide-react';
import type { Category } from '../../types';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/api';

// ─── Constants ────────────────────────────────────────────────
const ICON_OPTIONS = [
  'Zap', 'Scissors', 'Droplets', 'Sparkles', 'Wrench', 'Shirt',
  'PaintBucket', 'Hammer', 'Shield', 'Camera', 'Truck', 'Home',
  'Laptop', 'Heart', 'ShoppingBag', 'Star',
];

const COLOR_OPTIONS = [
  '#165B43', '#D6A643', '#3b82f6', '#8b5cf6',
  '#ef4444', '#10b981', '#f97316', '#ec4899',
];

const emptyForm = {
  name: '',
  icon: 'Zap',
  color: '#165B43',
  description: '',
};

export default function CategoriesPage() {
  const { categories, setCategories } = useApp();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await listCategories();
      const mapped = (data.categories as any[]).map((cat) => ({
        ...cat,
        id: cat._id || cat.id,
      }));
      setCategories(mapped);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to fetch categories', 'error');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = categories.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    const id = (cat as any)._id || cat.id;
    setEditId(id);
    setForm({
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      description: cat.description,
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Category name is required';
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    const exists = categories.find(
      (c) => c.name.toLowerCase() === form.name.toLowerCase() && c.id !== editId
    );
    if (exists) e.name = 'Category name already exists';
    return e;
  };

  // CREATE / UPDATE
  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        icon: form.icon,
        color: form.color,
      };

      if (editId) {
        const updated = await updateCategory(editId, payload);
        const updatedCategory = (updated.category as any);
        setCategories((prev) =>
          prev.map((c) => (c.id === editId ? { ...c, ...updatedCategory, id: updatedCategory._id || updatedCategory.id || c.id } : c))
        );
        showToast('Category updated successfully', 'success');
      } else {
        const created = await createCategory(payload);
        const newCategory = (created.category as any);
        setCategories((prev) => [{ ...newCategory, id: newCategory._id || newCategory.id }, ...prev]);
        showToast('Category created successfully', 'success');
      }
      setShowModal(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to save category';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // TOGGLE
  const handleToggle = async (cat: Category) => {
    const id = (cat as any)._id || cat.id;
    if (!id) return;

    try {
      const updated = await updateCategory(id, { isActive: !cat.isActive });
      const updatedCategory = (updated.category as any);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updatedCategory, id: updatedCategory._id || updatedCategory.id || c.id } : c))
      );
      showToast(
        `Category ${updatedCategory.isActive ? 'activated' : 'deactivated'} successfully`,
        'success'
      );
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to toggle', 'error');
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await deleteCategory(deleteId);
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
      showToast('Category deleted successfully', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to delete category', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClick = (cat: Category) => {
    const id = (cat as any)._id || cat.id;
    setDeleteId(id);
  };

  return (
    <Layout title="Service Categories">
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 9999,
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '0.875rem',
            fontWeight: 600,
            background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: toast.type === 'success' ? '#065f46' : '#991b1b',
            border: toast.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca',
          }}
        >
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search categories..." className="w-64" />
          <div className="flex gap-2">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
              Active: {categories.filter((c) => c.isActive).length}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
              Inactive: {categories.filter((c) => !c.isActive).length}
            </span>
          </div>
        </div>
        <Button icon={<Plus size={14} />} onClick={openCreate} disabled={loading}>
          Add Category
        </Button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((cat) => (
          <Card key={cat.id}>
            <CardBody>
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: cat.color }}
                >
                  <Tag size={22} />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggle(cat)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title={cat.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {cat.isActive ? (
                      <ToggleRight size={18} className="text-green-500" />
                    ) : (
                      <ToggleLeft size={18} className="text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-blue-600"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(cat)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{cat.name}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{cat.description || '—'}</p>
              <div className="flex items-center justify-between">
                <Badge variant={cat.isActive ? 'success' : 'default'}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-xs text-gray-400">{cat.providerCount} providers</span>
              </div>
            </CardBody>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <Tag size={40} className="mx-auto mb-3 opacity-30" />
            <p>No categories found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? 'Edit Category' : 'Create New Category'}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Plumber"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165B43]/20 ${
                errors.name ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of this service category"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165B43]/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Icon</label>
            <div className="grid grid-cols-8 gap-1.5">
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                  className={`h-8 w-8 rounded-lg text-[10px] font-medium border transition-all ${
                    form.icon === ic
                      ? 'bg-[#165B43] text-white border-[#165B43]'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                  title={ic}
                >
                  {ic.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col}
                  onClick={() => setForm((f) => ({ ...f, color: col }))}
                  style={{ backgroundColor: col }}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    form.color === col ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: form.color }}
            >
              <Tag size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{form.name || 'Category Name'}</p>
              <p className="text-xs text-gray-500">{form.description || 'Description'}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} loading={loading}>
              {editId ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Category?"
        message="This will permanently remove this category."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        variant="danger"
        loading={deleting}
      />
    </Layout>
  );
}