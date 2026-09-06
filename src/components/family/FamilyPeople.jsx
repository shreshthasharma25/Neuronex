import React, { useState, useRef } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Plus, Users, Heart, Trash2, Edit3, Upload, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function FamilyPeople() {
  const { patientData, addFamilyMember, updateFamilyMember, deleteFamilyMember } = useApp();
  const familyList = patientData.family || [];
  const preferredName = patientData.profile?.preferredName || 'Maa';

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    relation: 'Daughter',
    phone: '',
    notes: '',
    avatar: '',
    isEmergencyContact: true
  });
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenAdd = () => {
    sounds.playGentleTap();
    setEditingId(null);
    setForm({
      name: '',
      relation: 'Daughter',
      phone: '',
      notes: '',
      avatar: '',
      isEmergencyContact: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (person) => {
    sounds.playGentleTap();
    setEditingId(person.id);
    setForm({
      name: person.name || '',
      relation: person.relation || 'Daughter',
      phone: person.phone || '',
      notes: person.notes || '',
      avatar: person.avatar || person.photo || '',
      isEmergencyContact: person.isEmergencyContact ?? true
    });
    setModalOpen(true);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setForm(prev => ({ ...prev, avatar: loadEvent.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      updateFamilyMember(editingId, {
        name: form.name.trim(),
        relation: form.relation,
        phone: form.phone.trim(),
        notes: form.notes.trim(),
        avatar: form.avatar,
        isEmergencyContact: form.isEmergencyContact
      });
      showToast(`Updated ${form.name} successfully!`);
    } else {
      addFamilyMember({
        name: form.name.trim(),
        relation: form.relation,
        phone: form.phone.trim(),
        notes: form.notes.trim(),
        avatar: form.avatar,
        isEmergencyContact: form.isEmergencyContact
      });
      showToast(`Added ${form.name} to family!`);
    }
    setModalOpen(false);
  };

  const handleDelete = (id, name) => {
    sounds.playGentleTap();
    deleteFamilyMember(id);
    showToast(`Removed ${name} from family.`);
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
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#EAF2FF] border border-[#CFE1FF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] sm:text-xs font-bold text-[#2F6FED] uppercase tracking-wider">
            Personalization Portal
          </span>
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#172B4D] mt-0.5">
            Family & Important People
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            People {preferredName} loves and recognizes. Powers memory games and the voice assistant.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl sm:rounded-2xl bg-[#2F6FED] hover:bg-[#2052b8] text-white text-xs font-extrabold shadow-sm transition-all touch-target w-full sm:w-auto flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* Family Members Grid */}
      {familyList.length === 0 ? (
        <Card variant="white" className="p-6 sm:p-8 text-center border-dashed border-2 border-slate-200">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EAF2FF] text-[#2F6FED] flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3">
            👨‍👩‍👧
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#172B4D]">
            No family members added yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-sm mx-auto">
            Add children, spouse, or relatives here so {preferredName} can view their photos, listen to relationships, and play personalized memory quizzes.
          </p>
          <div className="mt-5">
            <Button onClick={handleOpenAdd} variant="primary" size="md" icon={Plus}>
              Add First Family Member
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {familyList.map((member) => (
            <div
              key={member.id}
              className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {member.avatar || member.photo ? (
                  <img
                    src={member.avatar || member.photo}
                    alt={member.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border-2 border-[#2F6FED]/20 flex-shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#EAF2FF] text-[#2F6FED] font-extrabold text-xl sm:text-2xl flex items-center justify-center flex-shrink-0">
                    {member.name.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm sm:text-base text-[#172B4D] truncate">
                      {member.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#EAF2FF] text-[#2F6FED] text-[10px] sm:text-[11px] font-bold flex-shrink-0">
                      {member.relation}
                    </span>
                  </div>

                  {member.phone && (
                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{member.phone}</span>
                    </p>
                  )}

                  {member.notes && (
                    <p className="text-xs text-slate-600 font-medium mt-1.5 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
                      💭 "{member.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(member)}
                  className="p-2 rounded-xl text-slate-500 hover:text-[#2F6FED] hover:bg-[#EAF2FF] transition-colors text-xs font-bold flex items-center gap-1"
                  title="Edit person"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(member.id, member.name)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-bold flex items-center gap-1"
                  title="Delete person"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Person Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Family Member" : "Add Family Member"}
        subtitle="This information helps personalize the patient's memories and memory quiz."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Priya"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Relationship *
              </label>
              <select
                value={form.relation}
                onChange={(e) => setForm(prev => ({ ...prev, relation: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none bg-white"
              >
                <option value="Daughter">Daughter</option>
                <option value="Son">Son</option>
                <option value="Husband">Husband</option>
                <option value="Wife">Wife</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
                <option value="Grandchild">Grandchild</option>
                <option value="Granddaughter">Granddaughter</option>
                <option value="Grandson">Grandson</option>
                <option value="Close Friend">Close Friend</option>
                <option value="Other Relative">Other Relative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98300 11223"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Photo
            </label>
            <div className="flex items-center gap-3">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt="Preview"
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xl font-bold">
                  📷
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
              Personal Note / Memory Clue (Optional)
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g., Visits every evening around 6 PM. Loves balcony flowers."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isEmergencyContact"
              checked={form.isEmergencyContact}
              onChange={(e) => setForm(prev => ({ ...prev, isEmergencyContact: e.target.checked }))}
              className="w-4 h-4 rounded text-[#2F6FED] focus:ring-[#2F6FED]"
            />
            <label htmlFor="isEmergencyContact" className="text-xs font-bold text-slate-700">
              Include as One-Touch Emergency Contact for Patient
            </label>
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
              {editingId ? "Save Changes" : "Save Family Member"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
