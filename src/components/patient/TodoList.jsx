import React from 'react';
import { Check, CheckCircle2, Circle, Sparkles, Heart } from 'lucide-react';
import Card from '../common/Card';
import { sounds } from '../../utils/soundPlayer';
import { useApp } from '../../context/AppContext';
import { translateDynamicContent } from '../../i18n';
import { TeaLeafSprig } from '../common/CulturalMotifs';

export default function TodoList({ todos, onToggleTodo, preferredName = 'Maa' }) {
  const { t, language } = useApp();

  if (!todos || todos.length === 0) {
    return (
      <Card variant="white" className="p-6 text-center border border-[#D8E2D9]">
        <div className="w-12 h-12 rounded-2xl bg-[#EBF5EE] text-[#1E5E3A] flex items-center justify-center mx-auto mb-3 text-2xl border border-[#C3E2CD]">
          📝
        </div>
        <h4 className="text-base font-extrabold text-[#162832]">
          {t('home.noTodos')}
        </h4>
        <p className="text-sm text-slate-500 font-medium mt-1">
          {t('emergency.askCaregiver')}
        </p>
      </Card>
    );
  }

  const completedCount = todos.filter(t => t.completed).length;
  const allCompleted = completedCount === todos.length && todos.length > 0;

  const handleToggle = (id) => {
    sounds.playGentleTap();
    onToggleTodo(id);
  };

  return (
    <Card variant="white" className="p-5 border border-[#D8E2D9]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <h3 className="text-xl font-extrabold text-[#162832]">
            {t('home.todoTitle')}
          </h3>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#EBF5EE] text-[#1E5E3A] text-xs font-bold border border-[#C3E2CD]">
          {completedCount} / {todos.length} {t('common.done')}
        </span>
      </div>

      {/* Progress Bar in Assam Tea Green */}
      <div className="w-full bg-[#E8EFEA] h-2.5 rounded-full overflow-hidden mb-4">
        <div 
          className="bg-[#1E5E3A] h-full rounded-full transition-all duration-300"
          style={{ width: `${(completedCount / todos.length) * 100}%` }}
        />
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {todos.map(todo => {
          return (
            <div
              key={todo.id}
              onClick={() => handleToggle(todo.id)}
              className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer touch-target ${
                todo.completed
                  ? 'bg-[#EBF5EE]/60 border-[#C3E2CD] text-slate-500'
                  : 'bg-white border-[#D8E2D9] hover:border-[#1E5E3A]/50 hover:bg-[#F5FAF6]'
              }`}
            >
              {/* Checkbox */}
              <button
                type="button"
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  todo.completed
                    ? 'bg-[#1E5E3A] text-white shadow-xs'
                    : 'border-2 border-slate-300 text-transparent hover:border-[#1E5E3A]'
                }`}
                aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
              >
                <Check className="w-5 h-5 stroke-[3]" />
              </button>

              <div className="flex-1">
                <span className={`text-base font-bold block ${todo.completed ? 'line-through text-slate-400' : 'text-[#162832]'}`}>
                  {translateDynamicContent(todo.title, language, todo.title)}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  {todo.time && (
                    <span className="text-xs text-slate-500 font-medium">
                      ⏰ {todo.time}
                    </span>
                  )}
                  {todo.recurrence && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF5EE] text-[#1E5E3A] border border-[#C3E2CD]">
                      {translateDynamicContent(todo.recurrence, language, todo.recurrence)}
                    </span>
                  )}
                </div>
              </div>

              {todo.completed && (
                <span className="text-xs font-bold text-[#1E5E3A] bg-[#EBF5EE] px-2 py-0.5 rounded-md border border-[#C3E2CD]">
                  ✓ {t('common.done')}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {allCompleted && (
        <div className="mt-4 p-3.5 bg-[#EBF5EE] border border-[#C3E2CD] rounded-2xl flex items-center gap-2 text-sm text-[#1E5E3A] font-bold justify-center">
          <TeaLeafSprig className="w-4 h-4 text-[#1E5E3A]" />
          <span>🎉 {t('games.wellDone')} {t('games.exerciseComplete')}</span>
        </div>
      )}
    </Card>
  );
}
