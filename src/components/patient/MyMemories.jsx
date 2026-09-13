import React from 'react';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import { useApp } from '../../context/AppContext';
import { Heart, Users, MapPin, Sparkles, BookOpen, Volume2, Phone } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';
import { TeaLeafSprig, RegionalTextileBorder, BambooFrame, JaapiHat } from '../common/CulturalMotifs';

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
    <div className="p-4 sm:p-6 space-y-7 pb-28">
      {/* Handcrafted Heirloom Scrapbook Album Header */}
      <div className="relative rounded-3xl sm:rounded-4xl bg-gradient-to-br from-[#1E5E3A] via-[#164E30] to-[#0D2F1B] text-white p-5 sm:p-7 shadow-xl overflow-hidden border-2 border-[#D98A1E]/40">
        {/* Subtle background glow */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-[#D98A1E]/15 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#E5C158] text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-white/20 backdrop-blur-xs">
              <TeaLeafSprig className="w-3.5 h-3.5" color="#E5C158" />
              <span>Brahmaputra Valley Keepsake Album</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-white">
              My Memories & Family
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1 max-w-md">
              Treasured moments and familiar faces lovingly gathered for {profile.preferredName || 'you'}. Tap any speaker to listen.
            </p>
          </div>

          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-br from-[#D98A1E] to-[#B37012] text-white flex items-center justify-center text-2xl sm:text-3xl shadow-lg border-2 border-white/30 flex-shrink-0">
            🌸
          </div>
        </div>

        {/* Traditional Woven Gamosa Trim on Album Banner */}
        <div className="mt-4 pt-3 border-t border-white/15">
          <RegionalTextileBorder height={4} />
        </div>
      </div>

      {/* SECTION 1: PEOPLE I KNOW (OUR LOVING KIN) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">👨‍👩‍👧</span>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#162832] font-serif">
                People I Know
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Your loving children, grandchildren, and caregivers
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-[#1E5E3A] bg-[#EBF5EE] px-3 py-1 rounded-full border border-[#C3E2CD] shadow-2xs">
            {family.length} Family Members
          </span>
        </div>

        {family.length === 0 ? (
          <p className="text-sm text-slate-400 italic bg-white p-5 rounded-3xl border border-[#D8E2D9]">
            No family members added yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {family.map(person => (
              <BambooFrame key={person.id} className="h-full">
                <div className="p-4 sm:p-5 flex items-start gap-4">
                  {/* Photo with handcrafted bamboo mount */}
                  {person.avatar ? (
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#D98A1E]/30 shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#EBF5EE] to-[#D8E2D9] border-2 border-[#1E5E3A]/20 flex items-center justify-center text-[#1E5E3A] font-black text-2xl flex-shrink-0 shadow-xs">
                      {person.name ? person.name.charAt(0).toUpperCase() : <Users className="w-8 h-8" />}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-base sm:text-lg font-extrabold text-[#162832] font-serif truncate">
                        {person.name}
                      </h4>
                      <button
                        onClick={() => handleSpeakMemory(`${person.name} is your loving ${person.relation}. ${person.notes || ''}`)}
                        className="w-9 h-9 rounded-xl bg-[#EBF5EE] hover:bg-[#1E5E3A] text-[#1E5E3A] hover:text-white transition-all flex items-center justify-center flex-shrink-0 shadow-2xs border border-[#C3E2CD]"
                        title="Listen to memory"
                        aria-label={`Listen to memory about ${person.name}`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FFF6E5] text-[#B37012] text-xs font-extrabold border border-[#F7D59A]">
                        {person.relation}
                      </span>
                    </div>

                    {person.notes && (
                      <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed line-clamp-3">
                        {person.notes}
                      </p>
                    )}
                  </div>
                </div>
              </BambooFrame>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: IMPORTANT PLACES (SACRED WAYPOINTS) */}
      <section className="space-y-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🏡</span>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#162832] font-serif">
              Important & Familiar Places
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Comforting places in your memory journey
            </p>
          </div>
        </div>

        {places.length === 0 ? (
          <p className="text-sm text-slate-400 italic bg-white p-5 rounded-3xl border border-[#D8E2D9]">
            No places added yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {places.map(place => (
              <div
                key={place.id}
                className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white to-[#F9FBF9] border-2 border-[#C3E2CD] shadow-xs flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FFF6E5] to-[#FBEED7] text-[#D98A1E] flex items-center justify-center text-2xl flex-shrink-0 border border-[#F7D59A] shadow-xs">
                  📍
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-base font-extrabold text-[#162832] font-serif truncate">
                      {place.name}
                    </h4>
                    <button
                      onClick={() => handleSpeakMemory(`${place.name}. ${place.description || ''}. Located at ${place.address}.`)}
                      className="w-8 h-8 rounded-lg bg-[#EBF5EE] hover:bg-[#1E5E3A] text-[#1E5E3A] hover:text-white transition-colors flex items-center justify-center flex-shrink-0"
                      title="Listen"
                      aria-label={`Listen to details about ${place.name}`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-[#1E5E3A] mt-0.5">
                    {place.address}
                  </p>
                  {place.description && (
                    <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                      {place.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: CHERISHED MEMORIES & STORIES (ILLUMINATED JOURNAL LEAVES) */}
      <section className="space-y-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">✨</span>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#162832] font-serif">
              Cherished Memories & Stories
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Stories from festivals, morning walks, and family celebrations
            </p>
          </div>
        </div>

        {memories.length === 0 ? (
          <p className="text-sm text-slate-400 italic bg-white p-5 rounded-3xl border border-[#D8E2D9]">
            No memories added yet.
          </p>
        ) : (
          <div className="space-y-3.5">
            {memories.map(mem => (
              <div
                key={mem.id}
                className="p-5 rounded-3xl bg-gradient-to-r from-[#FFFDF9] via-[#FAF7F2] to-[#FFF9EE] border-2 border-[#F7D59A] shadow-xs flex items-start gap-4 relative overflow-hidden"
              >
                {/* Gold silk side spine */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#D98A1E] to-[#B37012]" />

                <div className="w-11 h-11 rounded-2xl bg-amber-100/90 text-amber-900 flex items-center justify-center text-xl flex-shrink-0 border border-amber-300">
                  📜
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-base sm:text-lg font-extrabold text-[#162832] font-serif">
                      {mem.title}
                    </h4>
                    <button
                      onClick={() => handleSpeakMemory(`${mem.title}. ${mem.description || mem.detail || ''}`)}
                      className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors flex items-center justify-center flex-shrink-0"
                      title="Listen to story"
                      aria-label={`Listen to story: ${mem.title}`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-700 font-medium mt-1.5 leading-relaxed">
                    {mem.description || mem.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: IMPORTANT PERSONAL INFORMATION */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📌</span>
          <h3 className="text-base sm:text-lg font-extrabold text-[#162832] font-serif">
            Important Information & Medical Notes
          </h3>
        </div>

        <div className="p-5 rounded-3xl bg-white border-2 border-[#D8E2D9] shadow-xs space-y-3">
          {importantInfo.map(info => (
            <div key={info.id} className="flex items-start justify-between border-b border-slate-100 pb-2.5 last:border-0 last:pb-0 gap-3">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                {info.label}:
              </span>
              <span className="text-sm font-extrabold text-[#162832] text-right font-serif">
                {info.value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
