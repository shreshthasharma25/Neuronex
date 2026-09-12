import React, { useState, useRef } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2, Heart, Users, MapPin, Pill, Clock, Shield, Sparkles, CheckCircle2, Upload, Stethoscope, User, Edit3, CheckSquare, Calendar, Check, Brain } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function PersonalizeHub() {
  const {
    patientData,
    addFamilyMember,
    deleteFamilyMember,
    addPlace,
    deletePlace,
    addMemory,
    deleteMemory,
    addMedicine,
    deleteMedicine,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    updateHomeLocation,
    updateDoctor,
    setDifficultyLevel
  } = useApp();

  const [activeModal, setActiveModal] = useState(null); // 'person' | 'memory' | 'place' | 'medicine' | 'doctor' | 'todo' | 'edit-todo'
  const [successToast, setSuccessToast] = useState(null);

  // Form states
  const [personForm, setPersonForm] = useState({ name: '', relation: 'Daughter', notes: '', phone: '', avatar: '' });
  const [memoryForm, setMemoryForm] = useState({ title: '', detail: '' });
  const [placeForm, setPlaceForm] = useState({ name: '', address: '', description: '' });
  const [medicineForm, setMedicineForm] = useState({ name: '', time: '8:00 AM', notes: '', tag: 'Morning' });
  const [doctorForm, setDoctorForm] = useState({ name: '', phone: '' });
  const [todoForm, setTodoForm] = useState({ title: '', time: '6:00 PM', recurrence: 'Daily' });
  const [editingTodoId, setEditingTodoId] = useState(null);

  const [homeAddress, setHomeAddress] = useState(patientData.homeLocation.address || '');
  const [homeCity, setHomeCity] = useState(patientData.homeLocation.city || '');
  const [safeZone, setSafeZone] = useState(patientData.homeLocation.safeZoneRadius || 500);

  const personFileRef = useRef(null);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handlePersonPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setPersonForm(prev => ({ ...prev, avatar: loadEvent.target?.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveHome = (e) => {
    e.preventDefault();
    updateHomeLocation({
      address: homeAddress,
      city: homeCity,
      safeZoneRadius: Number(safeZone)
    });
    sounds.playSuccess();
    showToast("Home location & safe-zone updated! Now active in Patient My Home.");
  };

  const handleAddPerson = (e) => {
    e.preventDefault();
    if (!personForm.name.trim()) return;
    addFamilyMember({
      name: personForm.name.trim(),
      relation: personForm.relation,
      phone: personForm.phone || '',
      notes: personForm.notes || '',
      avatar: personForm.avatar || '',
      isEmergencyContact: true
    });
    setPersonForm({ name: '', relation: 'Daughter', notes: '', phone: '', avatar: '' });
    setActiveModal(null);
    showToast("Family member added! Now available in patient memories, emergency, and quiz!");
  };

  const handleAddDoctor = (e) => {
    e.preventDefault();
    if (!doctorForm.name.trim()) return;
    updateDoctor({
      name: doctorForm.name.trim(),
      phone: doctorForm.phone.trim()
    });
    setDoctorForm({ name: '', phone: '' });
    setActiveModal(null);
    showToast("Doctor contact configured! Now active in Patient Emergency.");
  };

  const handleAddMemory = (e) => {
    e.preventDefault();
    if (!memoryForm.title.trim()) return;
    addMemory({
      title: memoryForm.title.trim(),
      detail: memoryForm.detail.trim()
    });
    setMemoryForm({ title: '', detail: '' });
    setActiveModal(null);
    showToast("Memory saved to patient keepsake!");
  };

  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!medicineForm.name.trim()) return;
    addMedicine({
      name: medicineForm.name.trim(),
      time: medicineForm.time,
      notes: medicineForm.notes.trim(),
      tag: medicineForm.tag
    });
    setMedicineForm({ name: '', time: '8:00 AM', notes: '', tag: 'Morning' });
    setActiveModal(null);
    showToast("Medicine scheduled! Active reminder alert created for patient.");
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!todoForm.title.trim()) return;
    addTodo({
      title: todoForm.title.trim(),
      time: todoForm.time ? todoForm.time.trim() : '',
      recurrence: todoForm.recurrence || 'Daily',
      completed: false
    });
    setTodoForm({ title: '', time: '6:00 PM', recurrence: 'Daily' });
    setActiveModal(null);
    showToast("Task saved! Automatically synced with Patient Today's To-Do.");
  };

  const handleOpenEditTodo = (todo) => {
    setTodoForm({
      title: todo.title,
      time: todo.time || '',
      recurrence: todo.recurrence || 'Daily'
    });
    setEditingTodoId(todo.id);
    setActiveModal('edit-todo');
  };

  const handleEditTodo = (e) => {
    e.preventDefault();
    if (!todoForm.title.trim() || !editingTodoId) return;
    updateTodo(editingTodoId, {
      title: todoForm.title.trim(),
      time: todoForm.time ? todoForm.time.trim() : '',
      recurrence: todoForm.recurrence || 'Daily'
    });
    setTodoForm({ title: '', time: '6:00 PM', recurrence: 'Daily' });
    setEditingTodoId(null);
    setActiveModal(null);
    showToast("Task updated successfully! Synced with patient view.");
  };

  const doctorContact = patientData.importantInfo?.find(i => i.label.toLowerCase().includes('doctor'));

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-[#EAF2FF] border border-[#CFE1FF] flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#2F6FED] uppercase tracking-wider">
            Caregiver Controls
          </span>
          <h2 className="text-2xl font-extrabold text-[#172B4D] mt-0.5">
            Personalize Patient Companion
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            Everything you enter here immediately updates {patientData?.profile?.preferredName || patientData?.profile?.fullName || 'the patient'}'s experience.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white text-[#2F6FED] flex items-center justify-center text-2xl shadow-sm">
          ✏️
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] text-sm font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* SECTION A: PEOPLE I KNOW */}
      <Card variant="white" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">👨‍👩‍👧</span>
            <div>
              <h3 className="text-lg font-extrabold text-[#172B4D]">
                Family & People I Know
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Powers the Family Memory quiz, My Memories keepsake, and Emergency contact
              </p>
            </div>
          </div>

          <Button
            onClick={() => setActiveModal('person')}
            size="sm"
            variant="secondary"
            icon={Plus}
          >
            Add Person
          </Button>
        </div>

        {patientData.family.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-3 text-center">
            No family members added yet. Tap "Add Person" to personalize family memories.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patientData.family.map(person => (
              <div
                key={person.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {person.avatar ? (
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-[#EAF2FF] text-[#2F6FED] flex items-center justify-center text-lg font-bold">
                      {person.name[0]}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-extrabold text-[#172B4D]">
                      {person.name}
                    </h4>
                    <span className="text-xs font-bold text-[#2F6FED]">
                      {person.relation} {person.phone ? `• ${person.phone}` : ''}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteFamilyMember(person.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* SECTION B: FAMILY DOCTOR CONTACT */}
      <Card variant="white" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">👨‍⚕️</span>
            <div>
              <h3 className="text-lg font-extrabold text-[#172B4D]">
                Family Doctor Contact
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Configures the "Call Doctor" button in the Patient Emergency section
              </p>
            </div>
          </div>

          <Button
            onClick={() => setActiveModal('doctor')}
            size="sm"
            variant="secondary"
            icon={doctorContact ? Stethoscope : Plus}
          >
            {doctorContact ? "Edit Doctor" : "Add Doctor"}
          </Button>
        </div>

        {doctorContact ? (
          <div className="p-3.5 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center text-xl">
                👨‍⚕️
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#172B4D]">
                  {doctorContact.value}
                </h4>
                <span className="text-xs text-[#2E7D32] font-bold">
                  ✓ Available in patient emergency help
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic py-3 text-center">
            No family doctor configured yet. Tap "Add Doctor" above.
          </p>
        )}
      </Card>

      {/* SECTION C: HOME LOCATION & SAFE ZONE */}
      <Card variant="white" className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🏠</span>
          <div>
            <h3 className="text-lg font-extrabold text-[#172B4D]">
              Home Address & Safe-Zone Perimeter
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Controls patient "Guide Me Home" navigation and geofence alerts
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveHome} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium text-[#172B4D]"
                placeholder="e.g. 14 Lake Road, Kolkata"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                City
              </label>
              <input
                type="text"
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium text-[#172B4D]"
                placeholder="e.g. Kolkata"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-600">
                Safe-Zone Geofence Perimeter:
              </label>
              <span className="text-xs font-extrabold text-[#2F6FED] bg-[#EAF2FF] px-2 py-0.5 rounded-full">
                {safeZone} meters
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={safeZone}
              onChange={(e) => setSafeZone(e.target.value)}
              className="w-full accent-[#2F6FED] cursor-pointer"
            />
          </div>

          <Button type="submit" size="md" variant="primary">
            Save Home & Safe Zone
          </Button>
        </form>
      </Card>

      {/* SECTION D: MEDICINES & SCHEDULE */}
      <Card variant="white" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💊</span>
            <div>
              <h3 className="text-lg font-extrabold text-[#172B4D]">
                Scheduled Medicines
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pops up proactively on the patient screen with voice prompts
              </p>
            </div>
          </div>

          <Button
            onClick={() => setActiveModal('medicine')}
            size="sm"
            variant="secondary"
            icon={Plus}
          >
            Add Medicine
          </Button>
        </div>

        {patientData.medicines.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-3 text-center">
            No medicines scheduled. Tap "Add Medicine" above.
          </p>
        ) : (
          <div className="space-y-2.5">
            {patientData.medicines.map(med => (
              <div
                key={med.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg">
                    💊
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#172B4D]">
                      {med.name}
                    </h4>
                    <span className="text-xs font-semibold text-slate-500">
                      ⏰ {med.time} • {med.notes || 'As prescribed'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    med.taken ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {med.taken ? 'Taken' : 'Pending'}
                  </span>
                  <button
                    onClick={() => deleteMedicine(med.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* SECTION E: MEMORIES & STORIES */}
      <Card variant="white" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <div>
              <h3 className="text-lg font-extrabold text-[#172B4D]">
                Important Memories & Facts
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Keepsake cards read aloud to reassure patient
              </p>
            </div>
          </div>

          <Button
            onClick={() => setActiveModal('memory')}
            size="sm"
            variant="secondary"
            icon={Plus}
          >
            Add Memory
          </Button>
        </div>

        {patientData.memories.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-3 text-center">
            No memories added yet. Tap "Add Memory" above.
          </p>
        ) : (
          <div className="space-y-2.5">
            {patientData.memories.map(mem => (
              <div
                key={mem.id}
                className="p-3 rounded-2xl bg-[#FFF8E1] border border-[#FDE68A] flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-extrabold text-[#172B4D]">
                    {mem.title}
                  </h4>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">
                    {mem.detail}
                  </p>
                </div>

                <button
                  onClick={() => deleteMemory(mem.id)}
                  className="p-1.5 text-amber-800 hover:text-rose-600 rounded-lg ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* SECTION F: TO-DO LIST & DAILY TASKS */}
      <Card variant="white" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <div>
              <h3 className="text-lg font-extrabold text-[#172B4D]">
                To-Do List & Daily Tasks
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Schedules reminders, walks, hydration, and tasks for the patient's daily checklist
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              setTodoForm({ title: '', time: '6:00 PM', recurrence: 'Daily' });
              setActiveModal('todo');
            }}
            size="sm"
            variant="secondary"
            icon={Plus}
          >
            Add Task
          </Button>
        </div>

        {patientData.todos.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-3 text-center">
            No tasks added yet. Tap "Add Task" to schedule walks, hydration, or daily routines.
          </p>
        ) : (
          <div className="space-y-2.5">
            {patientData.todos.map(todo => (
              <div
                key={todo.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      todo.completed
                        ? 'bg-[#2E7D32] text-white'
                        : 'border-2 border-slate-300 hover:border-[#2F6FED] bg-white text-transparent'
                    }`}
                    title={todo.completed ? "Mark active" : "Mark completed"}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div>
                    <h4 className={`text-sm font-extrabold ${todo.completed ? 'line-through text-slate-400' : 'text-[#172B4D]'}`}>
                      {todo.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      {todo.time && (
                        <span className="text-xs font-semibold text-[#2F6FED]">
                          ⏰ {todo.time}
                        </span>
                      )}
                      {todo.recurrence && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF2FF] text-[#2F6FED]">
                          Repeat: {todo.recurrence}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        todo.completed ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {todo.completed ? 'Completed' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditTodo(todo)}
                    className="p-2 text-slate-400 hover:text-[#2F6FED] rounded-lg hover:bg-white transition-colors"
                    title="Edit Task"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      deleteTodo(todo.id);
                      showToast("Task removed from patient to-do list.");
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* SECTION G: COGNITIVE GAME DIFFICULTY CONTROLS */}
      <Card variant="white" className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🧠</span>
          <div>
            <h3 className="text-lg font-extrabold text-[#172B4D]">
              Game Difficulty & Cognitive Pacing
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Caregiver-controlled difficulty. Controls complexity across all 7 games for {patientData?.profile?.preferredName || 'the patient'}.
            </p>
          </div>
        </div>

        <div className="bg-[#FAFBFD] border border-slate-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Current Active Level:
            </span>
            <span className="px-3 py-1 rounded-full bg-[#EAF2FF] text-[#2F6FED] font-extrabold text-xs">
              Level {patientData.cognitiveStats?.currentLevel || 1} • {
                (patientData.cognitiveStats?.currentLevel || 1) === 1 ? 'Easy' : (patientData.cognitiveStats?.currentLevel || 1) === 2 ? 'Medium' : 'Hard'
              }
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { level: 1, name: 'Level 1 (Easy)', desc: '2 pairs, 3 basket items (10s), calm pace', color: 'bg-emerald-50 border-emerald-300 text-emerald-900' },
              { level: 2, name: 'Level 2 (Medium)', desc: '3 pairs, 4 basket items (8s), standard recall', color: 'bg-blue-50 border-blue-300 text-blue-900' },
              { level: 3, name: 'Level 3 (Hard)', desc: '4 pairs, 5 basket items (6s), higher stimulation', color: 'bg-amber-50 border-amber-300 text-amber-900' }
            ].map(lvl => {
              const isSelected = (patientData.cognitiveStats?.currentLevel || 1) === lvl.level;
              return (
                <button
                  key={lvl.level}
                  type="button"
                  onClick={() => {
                    setDifficultyLevel(lvl.level);
                    showToast(`Game difficulty set to Level ${lvl.level}! Patient exercises updated.`);
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#2F6FED] shadow-md ring-2 ring-[#2F6FED]/20'
                      : 'bg-white/60 border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm text-[#172B4D]">
                      {lvl.name}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#2F6FED] text-white flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {lvl.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-slate-500 italic">
          💡 The patient cannot change their own level. If the patient appears frustrated, ease to Level 1. If they consistently score 100%, increase to Level 2 or 3.
        </p>
      </Card>

      {/* MODAL: ADD FAMILY MEMBER (WITH PHOTO UPLOAD) */}
      <Modal
        isOpen={activeModal === 'person'}
        onClose={() => setActiveModal(null)}
        title="Add Family Member"
        subtitle="This will power Patient Memories & Family Quiz"
      >
        <form onSubmit={handleAddPerson} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Name *</label>
            <input
              type="text"
              required
              value={personForm.name}
              onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
              placeholder="e.g. Priya"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Relationship to Patient *</label>
            <select
              value={personForm.relation}
              onChange={(e) => setPersonForm({ ...personForm, relation: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
            >
              <option value="Daughter">Daughter</option>
              <option value="Son">Son</option>
              <option value="Husband">Husband</option>
              <option value="Wife">Wife</option>
              <option value="Sister">Sister</option>
              <option value="Brother">Brother</option>
              <option value="Grandchild">Grandchild</option>
              <option value="Friend">Friend</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Photo (Optional)</label>
            <div className="flex items-center gap-3">
              {personForm.avatar ? (
                <img
                  src={personForm.avatar}
                  alt="Preview"
                  className="w-12 h-12 rounded-xl object-cover border-2 border-[#2F6FED]"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <User className="w-6 h-6" />
                </div>
              )}
              <input
                type="file"
                ref={personFileRef}
                accept="image/*"
                onChange={handlePersonPhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => personFileRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-[#EAF2FF] text-[#2F6FED] text-xs font-bold border border-[#CFE1FF]"
              >
                <Upload className="w-3.5 h-3.5 inline mr-1" />
                Upload Member Photo
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number</label>
            <input
              type="tel"
              value={personForm.phone}
              onChange={(e) => setPersonForm({ ...personForm, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
              placeholder="e.g. +91 98300 11223"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Affectionate Note</label>
            <input
              type="text"
              value={personForm.notes}
              onChange={(e) => setPersonForm({ ...personForm, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
              placeholder="e.g. Visits every evening after work"
            />
          </div>

          <Button type="submit" size="lg" fullWidth variant="primary">
            Save Family Member
          </Button>
        </form>
      </Modal>

      {/* MODAL: ADD DOCTOR */}
      <Modal
        isOpen={activeModal === 'doctor'}
        onClose={() => setActiveModal(null)}
        title="Configure Family Doctor"
        subtitle="Will connect patient directly in emergency situations"
      >
        <form onSubmit={handleAddDoctor} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Doctor Name *</label>
            <input
              type="text"
              required
              value={doctorForm.name}
              onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
              placeholder="e.g. Dr. Debashish Bose"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              value={doctorForm.phone}
              onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
              placeholder="e.g. +91 98301 23456"
            />
          </div>

          <Button type="submit" size="lg" fullWidth variant="primary">
            Save Doctor Contact
          </Button>
        </form>
      </Modal>

      {/* MODAL: ADD MEDICINE */}
      <Modal
        isOpen={activeModal === 'medicine'}
        onClose={() => setActiveModal(null)}
        title="Schedule Medicine"
        subtitle="Will trigger smart proactive reminder for patient"
      >
        <form onSubmit={handleAddMedicine} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Medicine Name & Dose *</label>
            <input
              type="text"
              required
              value={medicineForm.name}
              onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
              placeholder="e.g. Morning Blood Pressure (5mg)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Time</label>
              <input
                type="text"
                value={medicineForm.time}
                onChange={(e) => setMedicineForm({ ...medicineForm, time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
                placeholder="e.g. 8:00 AM"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tag</label>
              <select
                value={medicineForm.tag}
                onChange={(e) => setMedicineForm({ ...medicineForm, tag: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Instructions for Patient</label>
            <input
              type="text"
              value={medicineForm.notes}
              onChange={(e) => setMedicineForm({ ...medicineForm, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
              placeholder="e.g. Take with warm water after breakfast"
            />
          </div>

          <Button type="submit" size="lg" fullWidth variant="primary">
            Schedule Medicine
          </Button>
        </form>
      </Modal>

      {/* MODAL: ADD MEMORY */}
      <Modal
        isOpen={activeModal === 'memory'}
        onClose={() => setActiveModal(null)}
        title="Add Cherished Memory"
        subtitle="Facts, dates, or stories for emotional grounding"
      >
        <form onSubmit={handleAddMemory} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Memory Title *</label>
            <input
              type="text"
              required
              value={memoryForm.title}
              onChange={(e) => setMemoryForm({ ...memoryForm, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
              placeholder="e.g. Hometown Roots or Wedding Anniversary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Details *</label>
            <textarea
              rows={3}
              required
              value={memoryForm.detail}
              onChange={(e) => setMemoryForm({ ...memoryForm, detail: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
              placeholder="e.g. Born and grew up in Ballygunge, loves gardening."
            />
          </div>

          <Button type="submit" size="lg" fullWidth variant="primary">
            Save Memory
          </Button>
        </form>
      </Modal>

      {/* MODAL: ADD TO-DO TASK */}
      <Modal
        isOpen={activeModal === 'todo'}
        onClose={() => setActiveModal(null)}
        title="Add Daily To-Do Task"
        subtitle="This task will appear immediately in the Patient To-Do checklist"
      >
        <form onSubmit={handleAddTodo} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Task Description *</label>
            <input
              type="text"
              required
              value={todoForm.title}
              onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
              placeholder="e.g. Go for 20 minute evening walk"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Time (Optional)</label>
              <input
                type="text"
                value={todoForm.time}
                onChange={(e) => setTodoForm({ ...todoForm, time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
                placeholder="e.g. 6:00 PM"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Recurrence</label>
              <select
                value={todoForm.recurrence}
                onChange={(e) => setTodoForm({ ...todoForm, recurrence: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
              >
                <option value="Daily">Daily</option>
                <option value="Once">Once</option>
                <option value="Weekly">Weekly</option>
                <option value="Weekdays">Weekdays</option>
              </select>
            </div>
          </div>

          <Button type="submit" size="lg" fullWidth variant="primary">
            Save Task
          </Button>
        </form>
      </Modal>

      {/* MODAL: EDIT TO-DO TASK */}
      <Modal
        isOpen={activeModal === 'edit-todo'}
        onClose={() => {
          setActiveModal(null);
          setEditingTodoId(null);
        }}
        title="Edit To-Do Task"
        subtitle="Update task details or scheduled time"
      >
        <form onSubmit={handleEditTodo} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Task Description *</label>
            <input
              type="text"
              required
              value={todoForm.title}
              onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
              placeholder="e.g. Go for 20 minute evening walk"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Time (Optional)</label>
              <input
                type="text"
                value={todoForm.time}
                onChange={(e) => setTodoForm({ ...todoForm, time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
                placeholder="e.g. 6:00 PM"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Recurrence</label>
              <select
                value={todoForm.recurrence}
                onChange={(e) => setTodoForm({ ...todoForm, recurrence: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F6FED] focus:outline-none text-sm font-medium"
              >
                <option value="Daily">Daily</option>
                <option value="Once">Once</option>
                <option value="Weekly">Weekly</option>
                <option value="Weekdays">Weekdays</option>
              </select>
            </div>
          </div>

          <Button type="submit" size="lg" fullWidth variant="primary">
            Update Task
          </Button>
        </form>
      </Modal>
    </div>
  );
}
