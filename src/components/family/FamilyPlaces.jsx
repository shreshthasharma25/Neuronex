import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Plus, MapPin, Trash2, Edit3, Home, Trees, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function FamilyPlaces() {
  const { patientData, addPlace, updatePlace, deletePlace } = useApp();
  const placesList = patientData.places || [];
  const preferredName = patientData.profile?.preferredName || 'Maa';

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    relation: '',
    description: ''
  });
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenAdd = () => {
    sounds.playGentleTap();
    setEditingId(null);
    setForm({ name: '', address: '', relation: '', description: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (place) => {
    sounds.playGentleTap();
    setEditingId(place.id);
    setForm({
      name: place.name || '',
      address: place.address || '',
      relation: place.relation || '',
      description: place.description || ''
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      updatePlace(editingId, {
        name: form.name.trim(),
        address: form.address.trim(),
        relation: form.relation.trim(),
        description: form.description.trim()
      });
      showToast(`Updated "${form.name}"!`);
    } else {
      addPlace({
        name: form.name.trim(),
        address: form.address.trim(),
        relation: form.relation.trim(),
        description: form.description.trim()
      });
      showToast(`Added place "${form.name}"!`);
    }
    setModalOpen(false);
  };

  const handleDelete = (id, name) => {
    sounds.playGentleTap();
    deletePlace(id);
    showToast(`Removed "${name}".`);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#E8F5E9] border border-[#C8E6C9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Familiar Geographies
          </span>
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#172B4D] mt-0.5">
            Important Places & Landmarks
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Familiar locations {preferredName} visits: Daughter's house, favorite temple, or park.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl sm:rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-sm transition-all touch-target w-full sm:w-auto flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Place</span>
        </button>
      </div>

      {placesList.length === 0 ? (
        <Card variant="white" className="p-6 sm:p-8 text-center border-dashed border-2 border-slate-200">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3">
            📍
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#172B4D]">
            No important places added yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-sm mx-auto">
            Add familiar locations such as daughter's home, the local park, or favorite temple to assist {preferredName}'s spatial awareness.
          </p>
          <div className="mt-5">
            <Button onClick={handleOpenAdd} variant="primary" size="md" icon={Plus}>
              Add First Place
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {placesList.map((place) => (
            <div
              key={place.id}
              className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-2">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl flex-shrink-0">
                    🏛️
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-[#172B4D]">
                      {place.name}
                    </h4>
                    {place.relation && (
                      <span className="text-xs text-emerald-700 font-bold block mt-0.5">
                        {place.relation}
                      </span>
                    )}
                  </div>
                </div>

                {place.address && (
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{place.address}</span>
                  </p>
                )}

                {place.description && (
                  <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {place.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(place)}
                  className="p-2 rounded-xl text-slate-500 hover:text-[#2F6FED] hover:bg-[#EAF2FF] transition-colors text-xs font-bold flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(place.id, place.name)}
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

      {/* Add / Edit Place Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Important Place" : "Add Important Place"}
        subtitle="Places with emotional or routine significance for the patient."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Place Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Daughter's House or Kalighat Temple"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Address / Locality (Optional)
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
              placeholder="e.g., Southern Avenue, Kolkata"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Relationship to Patient (Optional)
            </label>
            <input
              type="text"
              value={form.relation}
              onChange={(e) => setForm(prev => ({ ...prev, relation: e.target.value }))}
              placeholder="e.g., Priya's home (visits for Sunday lunch)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Familiar Memory Clue / Description (Optional)
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., The apartment near the lake with the green balcony."
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
              {editingId ? "Save Changes" : "Save Place"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
