import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Clock, Plus, Edit3, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function CaregiverRoutine() {
  const { patientData, addRoutineStep, updateRoutineStep, deleteRoutineStep } = useApp();
  const routine = patientData.routine || [];
  const preferredName = patientData.profile?.preferredName || 'Maa';

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    time: '7:00 AM',
    action: ''
  });
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenAdd = () => {
    sounds.playGentleTap();
    setEditingId(null);
    setForm({ time: '7:00 AM', action: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    sounds.playGentleTap();
    setEditingId(item.id);
    setForm({ time: item.time || '7:00 AM', action: item.action || '' });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.action.trim()) return;

    if (editingId) {
      updateRoutineStep(editingId, {
        time: form.time.trim(),
        action: form.action.trim()
      });
      showToast(`Updated routine step!`);
    } else {
      addRoutineStep({
        time: form.time.trim(),
        action: form.action.trim()
      });
      showToast(`Added routine step!`);
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    sounds.playGentleTap();
    deleteRoutineStep(id);
    showToast(`Removed routine step.`);
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
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#EAF2FF] border border-[#CFE1FF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] sm:text-xs font-bold text-[#2F6FED] uppercase tracking-wider">
            Daily Structure & Circadian Rhythm
          </span>
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#172B4D] mt-0.5">
            Daily Care Routine
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Structured chronological schedule for {preferredName} (waking, meals, exercise, walks, and bedtime).
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl sm:rounded-2xl bg-[#2F6FED] hover:bg-[#2052b8] text-white text-xs font-extrabold shadow-sm transition-all touch-target w-full sm:w-auto flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Step</span>
        </button>
      </div>

      {routine.length === 0 ? (
        <Card variant="white" className="p-6 sm:p-8 text-center border-dashed border-2 border-slate-200">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-50 text-[#2F6FED] flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3">
            ⏰
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#172B4D]">
            No daily routine steps configured yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-sm mx-auto">
            Create structured morning, afternoon, and evening milestones to help anchor {preferredName}'s daily sense of time.
          </p>
          <div className="mt-5">
            <Button onClick={handleOpenAdd} variant="primary" size="md" icon={Plus}>
              Add Routine Milestone
            </Button>
          </div>
        </Card>
      ) : (
        <div className="relative pl-5 sm:pl-6 space-y-3 sm:space-y-4 before:absolute before:left-2.5 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {routine.map((item, idx) => (
            <div
              key={item.id || idx}
              className="relative p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-2.5 sm:gap-3"
            >
              {/* Milestone Dot */}
              <div className="absolute -left-5 sm:-left-6 top-4 sm:top-5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#2F6FED] border-2 border-white shadow-xs" />

              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#EAF2FF] text-[#2F6FED] font-extrabold text-[11px] sm:text-xs flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.time}</span>
                </div>
                <h4 className="text-xs sm:text-base font-extrabold text-[#172B4D] truncate">
                  {item.action}
                </h4>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-[#2F6FED] hover:bg-[#EAF2FF] transition-colors touch-target flex items-center justify-center"
                  title="Edit step"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors touch-target flex items-center justify-center"
                  title="Delete step"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Routine Milestone" : "Add Routine Milestone"}
        subtitle="Part of the patient's daily routine sequence."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Time *
            </label>
            <input
              type="text"
              required
              value={form.time}
              onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
              placeholder="e.g., 7:00 AM"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Care Milestone / Activity *
            </label>
            <input
              type="text"
              required
              value={form.action}
              onChange={(e) => setForm(prev => ({ ...prev, action: e.target.value }))}
              placeholder="e.g., Wake up & warm ginger tea"
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
              {editingId ? "Save Changes" : "Save Milestone"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
