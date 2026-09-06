import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { Brain, Sparkles, Heart, Users, CheckCircle2, Lock, Plus } from 'lucide-react';
import { sounds } from '../../utils/soundPlayer';

export default function FamilyGamePreview({ onGoToFamily }) {
  const { patientData } = useApp();
  const familyList = patientData.family || [];
  const preferredName = patientData.profile?.preferredName || 'Maa';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-[#FFF8E1] border border-[#FDE68A] flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Cognitive Content Configuration
          </span>
          <h2 className="text-2xl font-extrabold text-[#172B4D] mt-0.5">
            Personalized Memory Game Preview
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            How your added family relationships dynamically power {preferredName}'s cognitive exercises.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white text-amber-600 flex items-center justify-center text-2xl shadow-sm">
          🧠
        </div>
      </div>

      {familyList.length === 0 ? (
        <Card variant="white" className="p-8 text-center border-dashed border-2 border-slate-200">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto mb-3">
            🔒
          </div>
          <h3 className="text-lg font-extrabold text-[#172B4D]">
            Your family member hasn't added this information yet.
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1 max-w-md mx-auto leading-relaxed">
            The Family Memory quiz requires at least one family relationship (such as Daughter, Son, or Spouse) so {preferredName} can practice recognizing loved ones.
          </p>
          <div className="mt-5">
            <Button
              onClick={onGoToFamily}
              variant="primary"
              size="md"
              icon={Plus}
            >
              Add Family Member Now
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-800 font-semibold">
              ✓ Active: {familyList.length} family member{familyList.length > 1 ? 's' : ''} connected! {preferredName}'s memory games will generate questions using these real relations.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-[#172B4D] uppercase tracking-wider">
              Sample Live Questions for Patient:
            </h3>

            {familyList.map((person, idx) => (
              <Card key={person.id || idx} variant="white" className="p-5 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  {person.avatar || person.photo ? (
                    <img
                      src={person.avatar || person.photo}
                      alt={person.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] text-[#2F6FED] font-extrabold text-xl flex items-center justify-center">
                      {person.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] font-bold text-[#2F6FED] uppercase">
                      Memory Card #{idx + 1}
                    </span>
                    <h4 className="text-base font-extrabold text-[#172B4D]">
                      "Who is {person.name}?"
                    </h4>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Expected Correct Answer:</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    {person.relation}
                  </span>
                </div>

                {person.notes && (
                  <p className="text-xs text-slate-500 font-medium mt-2 italic">
                    Hint provided if needed: "{person.notes}"
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
