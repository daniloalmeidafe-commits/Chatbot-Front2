"use client";

import { BrandMark } from "@/components/BrandMark";
import { useAuthStore } from "@/store/authStore";
import clsx from "clsx";
import {
  Copy,
  FolderKanban,
  ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  RotateCcw,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const userRole = useAuthStore((state) => state.user?.role?.name);
  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/projects",
      label: "Projetos",
      icon: FolderKanban,
    },
    {
      href: "/copy",
      label: "Copys",
      icon: Copy,
    },
    {
      href: "/reuse",
      label: "Reutilização de Copys",
      icon: RotateCcw,
    },
    {
      href: "/templates",
      label: "Templates",
      icon: LayoutTemplate,
    },
    {
      href: "/gallery",
      label: "Galeria",
      icon: ImageIcon,
    },
    ...(userRole === "ADMIN"
      ? [
          {
            href: "/users",
            label: "Usuários",
            icon: Users,
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 sticky top-0 h-screen hidden md:flex flex-col justify-between bg-gray-900 border-r border-gray-800 p-4">
      <div>
        <div className="px-3 mb-8">
          <BrandMark titleClassName="text-xl" />
        </div>
        <nav className="space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname.startsWith(href) &&
              (href !== "/dashboard" || pathname === "/dashboard");

            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-500/10 text-blue-300"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white",
                )}
              >
                <Icon size={20} className={clsx(isActive && "text-blue-400")} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
