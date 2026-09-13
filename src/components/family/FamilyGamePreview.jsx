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
      <div className="p-5 rounded-3xl bg-[#FFF6E5] border border-[#F3E2C4] flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#D98A1E] uppercase tracking-wider">
            Cognitive Content Configuration
          </span>
          <h2 className="text-2xl font-extrabold text-[#162832] mt-0.5">
            Personalized Memory Game Preview
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            How your added family relationships dynamically power {preferredName}'s cognitive exercises.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white text-[#D98A1E] border border-[#F3E2C4] flex items-center justify-center text-2xl shadow-sm">
          🧠
        </div>
      </div>

      {familyList.length === 0 ? (
        <Card variant="white" className="p-8 text-center border-dashed border-2 border-[#D8E2D9]">
          <div className="w-16 h-16 rounded-full bg-[#FFF6E5] text-[#D98A1E] border border-[#F3E2C4] flex items-center justify-center text-3xl mx-auto mb-3">
            🔒
          </div>
          <h3 className="text-lg font-extrabold text-[#162832]">
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
          <div className="p-4 rounded-2xl bg-[#EBF5EE] border border-[#D8E2D9] flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#1E5E3A] flex-shrink-0" />
            <p className="text-xs text-[#1E5E3A] font-semibold">
              ✓ Active: {familyList.length} family member{familyList.length > 1 ? 's' : ''} connected! {preferredName}'s memory games will generate questions using these real relations.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-[#162832] uppercase tracking-wider">
              Sample Live Questions for Patient:
            </h3>

            {familyList.map((person, idx) => (
              <Card key={person.id || idx} variant="white" className="p-5 border border-[#D8E2D9]">
                <div className="flex items-center gap-3 mb-3">
                  {person.avatar || person.photo ? (
                    <img
                      src={person.avatar || person.photo}
                      alt={person.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#D8E2D9]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#EBF5EE] text-[#1E5E3A] border border-[#D8E2D9] font-extrabold text-xl flex items-center justify-center">
                      {person.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] font-bold text-[#1E5E3A] uppercase">
                      Memory Card #{idx + 1}
                    </span>
                    <h4 className="text-base font-extrabold text-[#162832]">
                      "Who is {person.name}?"
                    </h4>
                  </div>
                </div>

                <div className="bg-[#F8FAF8] p-3 rounded-xl border border-[#E5EDE5] flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Expected Correct Answer:</span>
                  <span className="font-extrabold text-[#1E5E3A] bg-[#EBF5EE] border border-[#D8E2D9] px-2.5 py-1 rounded-full">
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
