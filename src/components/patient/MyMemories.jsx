import React from 'react';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import { useApp } from '../../context/AppContext';
import { Heart, Users, MapPin, Sparkles, BookOpen, Volume2, Phone } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function MyMemories() {
  const { patientData } = useApp();
  const { family, places, memories, importantInfo, profile } = patientData;

  const hasAnyMemories = (family && family.length > 0) || 
                         (places && places.length > 0) || 
                         (memories && memories.length > 0) || 
                         (importantInfo && importantInfo.length > 0);

  const handleSpeakMemory = (text) => {
    sounds.speak(text);
  };

  if (!hasAnyMemories) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Heart}
          title="No memories have been added yet"
          description="Ask your family member to personalize your memories, family photos, and familiar places."
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-28">
      {/* Top Banner */}
      <div className="bg-[#EAF2FF] p-4 sm:p-5 rounded-3xl border border-[#CFE1FF] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-bold text-[#2F6FED] uppercase tracking-wider">
            Personal Keepsake
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] mt-0.5">
            My Memories & Family
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Personalized with love by your family for {profile.preferredName || 'you'}
          </p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white text-[#2F6FED] flex items-center justify-center text-xl sm:text-2xl shadow-sm flex-shrink-0">
          ❤️
        </div>
      </div>


      {/* SECTION 1: PEOPLE I KNOW */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">👨‍👩‍👧</span>
          <h3 className="text-lg font-extrabold text-[#172B4D]">
            People I Know
          </h3>
          <span className="text-xs font-bold text-[#2F6FED] bg-[#EAF2FF] px-2 py-0.5 rounded-full ml-auto">
            {family.length} Family Members
          </span>
        </div>

        {family.length === 0 ? (
          <p className="text-sm text-slate-400 italic bg-white p-4 rounded-2xl border border-slate-100">
            No family members added yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {family.map(person => (
              <div
                key={person.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5"
              >
                {person.avatar ? (
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#EAF2FF] flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#EAF2FF] border-2 border-[#2F6FED]/20 flex items-center justify-center text-[#2F6FED] font-black text-xl flex-shrink-0">
                    {person.name ? person.name.charAt(0).toUpperCase() : <Users className="w-7 h-7" />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-extrabold text-[#172B4D] truncate">
                      {person.name}
                    </h4>
                    <button
                      onClick={() => handleSpeakMemory(`${person.name} is your loving ${person.relation}. ${person.notes || ''}`)}
                      className="text-slate-400 hover:text-[#2F6FED] p-1.5"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#2F6FED] text-xs font-extrabold">
                    {person.relation}
                  </span>
                  {person.notes && (
                    <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">
                      {person.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: IMPORTANT PLACES */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🏠</span>
          <h3 className="text-lg font-extrabold text-[#172B4D]">
            Important Places
          </h3>
        </div>

        {places.length === 0 ? (
          <p className="text-sm text-slate-400 italic bg-white p-4 rounded-2xl border border-slate-100">
            No places added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {places.map(place => (
              <div
                key={place.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3.5"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] text-[#2F6FED] flex items-center justify-center text-xl flex-shrink-0">
                  📍
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-extrabold text-[#172B4D]">
                      {place.name}
                    </h4>
                    <button
                      onClick={() => handleSpeakMemory(`${place.name}. ${place.description || ''}. Located at ${place.address}.`)}
                      className="text-slate-400 hover:text-[#2F6FED] p-1"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-[#2F6FED]">
                    {place.address}
                  </p>
                  {place.description && (
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {place.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: IMPORTANT MEMORIES */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">❤️</span>
          <h3 className="text-lg font-extrabold text-[#172B4D]">
            Cherished Memories & Stories
          </h3>
        </div>

        {memories.length === 0 ? (
          <p className="text-sm text-slate-400 italic bg-white p-4 rounded-2xl border border-slate-100">
            No memories added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {memories.map(mem => (
              <div
                key={mem.id}
                className="p-4 rounded-2xl bg-[#FFF8E1] border border-[#FDE68A] shadow-sm flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center text-lg flex-shrink-0">
                  ✨
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-extrabold text-[#172B4D]">
                      {mem.title}
                    </h4>
                    <button
                      onClick={() => handleSpeakMemory(`${mem.title}. ${mem.detail}`)}
                      className="text-amber-700 hover:text-amber-900 p-1"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-700 font-medium mt-0.5">
                    {mem.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: IMPORTANT INFORMATION */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">📌</span>
          <h3 className="text-lg font-extrabold text-[#172B4D]">
            Important Information
          </h3>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
          {importantInfo.map(info => (
            <div key={info.id} className="flex items-start justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
              <span className="text-xs font-bold text-slate-500 uppercase">
                {info.label}:
              </span>
              <span className="text-sm font-bold text-[#172B4D] text-right">
                {info.value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
