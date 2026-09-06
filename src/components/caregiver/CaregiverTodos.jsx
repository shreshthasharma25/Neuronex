import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { CheckSquare, Plus, Clock, Edit3, Trash2, Calendar, CheckCircle2, Bell, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function CaregiverTodos() {
  const { patientData, addTodo, updateTodo, toggleTodo, deleteTodo, addReminder } = useApp();
  const todos = patientData.todos || [];
  const preferredName = patientData.profile?.preferredName || 'Maa';

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    time: '6:00 PM',
    date: 'Today',
    recurrence: 'Daily',
    category: 'care' // 'care' | 'appointment' | 'meal' | 'exercise' | 'general'
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
      title: '',
      time: '6:00 PM',
      date: 'Today',
      recurrence: 'Daily',
      category: 'care'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (todo) => {
    sounds.playGentleTap();
    setEditingId(todo.id);
    setForm({
      title: todo.title || '',
      time: todo.time || '6:00 PM',
      date: todo.date || 'Today',
      recurrence: todo.recurrence || 'Daily',
      category: todo.category || 'care'
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editingId) {
      updateTodo(editingId, {
        title: form.title.trim(),
        time: form.time,
        date: form.date,
        recurrence: form.recurrence,
        category: form.category
      });
      showToast(`Updated "${form.title}"`);
    } else {
      addTodo({
        title: form.title.trim(),
        time: form.time,
        date: form.date,
        recurrence: form.recurrence,
        category: form.category,
        active: true,
        completed: false
      });
      showToast(`Added to-do "${form.title}"`);
    }
    setModalOpen(false);
  };

  const handleDelete = (id, title) => {
    sounds.playGentleTap();
    deleteTodo(id);
    showToast(`Removed task "${title}".`);
  };

  const handleToggle = (id) => {
    toggleTodo(id);
  };

  const completedCount = todos.filter(t => t.completed).length;

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
            Patient Routine & Tasks
          </span>
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#172B4D] mt-0.5">
            To-Do List & Care Reminders
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Daily tasks, doctor appointments, and walks. Synchronized live with {preferredName}'s checklist.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl sm:rounded-2xl bg-[#2F6FED] hover:bg-[#2052b8] text-white text-xs font-extrabold shadow-sm transition-all touch-target w-full sm:w-auto flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Progress Summary Card */}
      <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Today's Task Completion
          </span>
          <span className="text-base sm:text-xl font-extrabold text-[#172B4D]">
            {completedCount} of {todos.length} completed
          </span>
        </div>
        <span className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold flex-shrink-0 ${
          completedCount === todos.length && todos.length > 0
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-amber-100 text-amber-800'
        }`}>
          {completedCount === todos.length && todos.length > 0 ? '✓ All Done' : 'In Progress'}
        </span>
      </div>

      {todos.length === 0 ? (
        <Card variant="white" className="p-6 sm:p-8 text-center border-dashed border-2 border-slate-200">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-50 text-[#2F6FED] flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3">
            📋
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#172B4D]">
            No tasks added yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-sm mx-auto">
            Add morning breakfast, evening walk, drinking water, or doctor appointments. {preferredName} can view and tap to check off tasks on their screen.
          </p>
          <div className="mt-5">
            <Button onClick={handleOpenAdd} variant="primary" size="md" icon={Plus}>
              Add First Task
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {todos.map((todo) => {
            const isDone = todo.completed;
            return (
              <div
                key={todo.id}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-2.5 sm:gap-3 ${
                  isDone
                    ? 'bg-[#E8F5E9] border-[#C8E6C9]'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(todo.id)}
                    className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-[#2F6FED]'
                    }`}
                    title={isDone ? "Mark incomplete" : "Mark completed"}
                  >
                    {isDone && <span className="text-sm font-bold">✓</span>}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-base font-extrabold truncate ${
                        isDone ? 'line-through text-slate-500' : 'text-[#172B4D]'
                      }`}>
                        {todo.title}
                      </h4>
                      {todo.isMed && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Medicine
                        </span>
                      )}
                      {todo.isExercise && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                          Exercise
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold mt-1">
                      {todo.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{todo.time}</span>
                        </span>
                      )}
                      {todo.recurrence && (
                        <span>• {todo.recurrence}</span>
                      )}
                      <span className={`font-bold ${isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {isDone ? '• Completed' : '• Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(todo)}
                    className="p-2 rounded-xl text-slate-500 hover:text-[#2F6FED] hover:bg-[#EAF2FF] transition-colors"
                    title="Edit task"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(todo.id, todo.title)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
        title={editingId ? "Edit Task" : "Add Task or Reminder"}
        subtitle="Appears automatically in the patient's daily checklist."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172B4D] mb-1">
              Task / Reminder Name *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Evening walk in the garden"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Time (Optional)
              </label>
              <input
                type="text"
                value={form.time}
                onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                placeholder="e.g., 6:00 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">
                Recurrence
              </label>
              <select
                value={form.recurrence}
                onChange={(e) => setForm(prev => ({ ...prev, recurrence: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#2F6FED] focus:outline-none bg-white"
              >
                <option value="Daily">Daily</option>
                <option value="Once">Once</option>
                <option value="Mon-Fri">Mon-Fri</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
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
              {editingId ? "Save Changes" : "Save Task"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
