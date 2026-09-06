import React, { useState, useRef } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Plus, Heart, Trash2, Edit3, Upload, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function FamilyMemories() {
  const { patientData, addMemory, updateMemory, deleteMemory } = useApp();
  const memoriesList = patientData.memories || [];
  const preferredName = patientData.profile?.preferredName || 'Maa';

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'Family trip',
    date: '',
    description: '',
    photo: ''
  });
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const categories = [
    'Family trip',
    'Wedding memory',
    'Childhood memory',
    'Festival memory',
    'Important life event',
    'Favorite passion',
    'Other keepsake'
  ];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenAdd = () => {
    sounds.playGentleTap();
    setEditingId(null);
    setForm({
      title: '',
      category: 'Family trip',
      date: '',
      description: '',
      photo: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (memory) => {
    sounds.playGentleTap();
    setEditingId(memory.id);
    setForm({
      title: memory.title || '',
      category: memory.category || 'Family trip',
      date: memory.date || '',
      description: memory.description || memory.detail || '',
      photo: memory.photo || ''
    });
    setModalOpen(true);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setForm(prev => ({ ...prev, photo: loadEvent.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editingId) {
      updateMemory(editingId, {
        title: form.title.trim(),
        category: form.category,
        date: form.date.trim(),
        description: form.description.trim(),
        detail: form.description.trim(),
        photo: form.photo
      });
      showToast(`Updated "${form.title}" memory!`);
    } else {
      addMemory({
        title: form.title.trim(),
        category: form.category,
        date: form.date.trim(),
        description: form.description.trim(),
        detail: form.description.trim(),
        photo: form.photo
      });
      showToast(`Added memory "${form.title}"!`);
    }
    setModalOpen(false);
  };

  const handleDelete = (id, title) => {
    sounds.playGentleTap();
    deleteMemory(id);
    showToast(`Removed "${title}" memory.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#FFF8E1] border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] sm:text-xs font-bold text-amber-800 uppercase tracking-wider">
            Memory Album & Keepsakes
          </span>
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#172B4D] mt-0.5">
            Personal & Family Memories
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Cherished life stories, wedding photos, and trips to bring comfort and emotional anchoring to {preferredName}.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl sm:rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-sm transition-all touch-target w-full sm:w-auto flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Memory</span>
        </button>
      </div>

      {/* Memories Grid */}
      {memoriesList.length === 0 ? (
        <Card variant="white" className="p-6 sm:p-8 text-center border-dashed border-2 border-slate-200">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFF8E1] text-amber-600 flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3">
            📖
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#172B4D]">
            No memories added yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-sm mx-auto">
            Add wedding memories, childhood roots, favorite festivals, or family vacations. {preferredName} can read and listen to these stories in the "My Memories" portal.
          </p>
          <div className="mt-5">
            <Button onClick={handleOpenAdd} variant="primary" size="md" icon={Plus}>
              Add First Memory
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {memoriesList.map((mem) => (
            <div
              key={mem.id}
              className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {mem.photo && (
                  <img
                    src={mem.photo}
                    alt={mem.title}
                    className="w-full h-36 sm:h-40 rounded-xl sm:rounded-2xl object-cover mb-3 border border-slate-100"
                  />
                )}
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <h4 className="font-extrabold text-sm sm:text-base text-[#172B4D]">
                    {mem.title}
                  </h4>
                  {mem.category && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFF8E1] text-[#B45309] text-[10px] font-extrabold whitespace-nowrap">
                      {mem.category}
                    </span>
                  )}
                </div>

                {mem.date && (
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{mem.date}</span>
                  </span>
                )}

                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {mem.description || mem.detail}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(mem)}
                  className="p-2 rounded-xl text-slate-500 hover:text-[#2F6FED] hover:bg-[#EAF2FF] transition-colors text-xs font-bold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(mem.id, mem.title)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Memory Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Memory Keepsake" : "Add Memory Keepsake"}
        subtitle="Shared with the patient's personal memory album."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Memory Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Family Trip to Darjeeling"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none bg-white"
              >
                {categories.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Date / Year (Optional)
              </label>
              <input
                type="text"
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                placeholder="e.g., Spring 2012 or 1982"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              {form.photo ? (
                <img
                  src={form.photo}
                  alt="Preview"
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xl font-bold">
                  🖼️
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo File</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Memory Description / Story *
            </label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Watching the sunrise over Kanchenjunga with Priya and having warm momos."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" size="md">
              {editingId ? "Save Changes" : "Save Memory"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
