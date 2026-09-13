import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "../../services/supabaseClient";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      alert("Unable to logout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="
        fixed
        top-20
        right-4
        z-[100]
        flex
        items-center
        gap-2
        px-4
        py-2
        rounded-lg
        bg-red-500
        text-white
        font-semibold
        text-sm
        shadow-lg
        hover:bg-red-600
        disabled:opacity-50
        transition
      "
    >
      <LogOut size={16} />

      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}