"use client";

import Link from "next/link";
import { MessageCircle, Users, BookOpen } from "lucide-react";

const listLayanan = [
  {
    title: "Konsultasi Online Dengan Ahli",
    link: "konsultasi",
    icon: MessageCircle,
  },
  {
    title: "Forum Komunitas",
    link: "forum",
    icon: Users,
  },
  {
    title: "Akses Artikel Terkini",
    link: "artikel",
    icon: BookOpen,
  },
];

export default function Layanan() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mt-8 mb-6">
        Layanan kami
      </h1>

      <div className="w-full max-w-2xl bg-white/50 rounded-xl shadow-lg p-6">
        <div className="flex flex-col gap-4">
          {listLayanan.map((item) => (
            <Link
              key={item.link}
              href={`/${item.link}`}
              className="block w-full"
            >
              <div className="w-full bg-white rounded-lg p-4 shadow transition-all duration-200 hover:shadow-md hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700 font-medium">
                    {item.title}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
