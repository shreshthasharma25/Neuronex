import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Pill, Plus, Clock, Edit3, Trash2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function CaregiverMedicines() {
  const { patientData, addMedicine, updateMedicine, toggleMedicine, deleteMedicine } = useApp();
  const medicines = patientData.medicines || [];
  const preferredName = patientData.profile?.preferredName || 'Maa';

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    dosage: '1 Tablet',
    time: '8:00 AM',
    frequency: 'Daily',
    instructions: 'Take after meal with warm water',
    active: true
  });
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenAdd = () => {
    sounds.playGentleTap();
    setEditingId(null);
    setForm({
      name: '',
      dosage: '1 Tablet',
      time: '8:00 AM',
      frequency: 'Daily',
      instructions: 'Take after meal with warm water',
      active: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    sounds.playGentleTap();
    setEditingId(med.id);
    setForm({
      name: med.name || '',
      dosage: med.dosage || '1 Tablet',
      time: med.time || '8:00 AM',
      frequency: med.frequency || 'Daily',
      instructions: med.instructions || med.notes || '',
      active: med.active !== false
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      updateMedicine(editingId, {
        name: form.name.trim(),
        dosage: form.dosage,
        time: form.time,
        frequency: form.frequency,
        instructions: form.instructions,
        notes: form.instructions,
        active: form.active
      });
      showToast(`Updated "${form.name}"`);
    } else {
      addMedicine({
        name: form.name.trim(),
        dosage: form.dosage,
        time: form.time,
        frequency: form.frequency,
        instructions: form.instructions,
        notes: form.instructions,
        active: form.active
      });
      showToast(`Added medicine "${form.name}"`);
    }
    setModalOpen(false);
  };

  const handleDelete = (id, name) => {
    sounds.playGentleTap();
    deleteMedicine(id);
    showToast(`Deleted ${name}`);
  };

  const handleToggleTaken = (id) => {
    toggleMedicine(id);
  };

  return (
    <div className="space-y-6">
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
            Medication Schedule & Adherence
          </span>
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#172B4D] mt-0.5">
            Prescriptions & Medicines
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Configure dosages, alert times, and monitor {preferredName}'s daily medicine confirmation.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl sm:rounded-2xl bg-[#2F6FED] hover:bg-[#2052b8] text-white text-xs font-extrabold shadow-sm transition-all touch-target w-full sm:w-auto flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {medicines.length === 0 ? (
        <Card variant="white" className="p-6 sm:p-8 text-center border-dashed border-2 border-slate-200">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3">
            💊
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#172B4D]">
            No medicines added yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-sm mx-auto">
            Add morning, afternoon, or night medicines here. They automatically appear on {preferredName}'s home screen and trigger audible alerts.
          </p>
          <div className="mt-5">
            <Button onClick={handleOpenAdd} variant="primary" size="md" icon={Plus}>
              Add First Medicine
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {medicines.map((med) => {
            const isTaken = med.taken;
            return (
              <div
                key={med.id}
                className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${
                  isTaken
                    ? 'bg-[#E8F5E9] border-[#C8E6C9]'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 ${
                    isTaken ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-100 text-amber-700'
                  }`}>
                    💊
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-extrabold text-[#172B4D]">
                        {med.name}
                      </h4>
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] sm:text-xs font-bold">
                        {med.dosage || '1 dose'}
                      </span>
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#2F6FED] text-[10px] sm:text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{med.time}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                      {med.instructions || med.notes || 'Take as prescribed'}
                      {med.frequency && ` • ${med.frequency}`}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        isTaken
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isTaken ? '✓ Taken by Patient' : '⏳ Pending Confirmation'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleToggleTaken(med.id)}
                    className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold transition-all border text-center ${
                      isTaken
                        ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isTaken ? 'Mark Pending' : 'Mark Taken'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(med)}
                      className="p-2 rounded-xl text-slate-500 hover:text-[#2F6FED] hover:bg-[#EAF2FF] transition-colors touch-target flex items-center justify-center"
                      title="Edit medicine"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(med.id, med.name)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors touch-target flex items-center justify-center"
                      title="Delete medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Medicine" : "Add Medicine"}
        subtitle="Schedules an audible reminder for the patient."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Medicine Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Morning Medicine"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Dosage
              </label>
              <input
                type="text"
                value={form.dosage}
                onChange={(e) => setForm(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="e.g., 1 Tablet"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Scheduled Time *
              </label>
              <input
                type="text"
                required
                value={form.time}
                onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                placeholder="e.g., 8:00 AM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Frequency
            </label>
            <select
              value={form.frequency}
              onChange={(e) => setForm(prev => ({ ...prev, frequency: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none bg-white"
            >
              <option value="Daily">Daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Mon-Fri">Mon-Fri</option>
              <option value="Weekly">Weekly</option>
              <option value="As needed">As needed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Instructions for Patient
            </label>
            <textarea
              rows={2}
              value={form.instructions}
              onChange={(e) => setForm(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="e.g., Take with warm water after breakfast."
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
              {editingId ? "Save Changes" : "Save Medicine"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
