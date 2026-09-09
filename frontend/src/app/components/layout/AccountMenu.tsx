"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import Avatar from "@/src/app/components/ui/Avatar";
import { useAuth } from "@/src/context/AuthContext";

// Shared by the Admin and Vendor back-office headers — neither had any way
// to see who was logged in or log out at all (AdminLayout had no user info
// whatsoever; VendorHeader showed a name but no interaction). Both are
// gated by useRequireRole before they ever render, so `user` is always
// populated here in practice.
function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-gray-50"
      >
        <Avatar alt={fullName} size="sm" />
        <span className="hidden text-sm font-medium text-gray-900 sm:block">{fullName}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-danger-500 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default AccountMenu;
