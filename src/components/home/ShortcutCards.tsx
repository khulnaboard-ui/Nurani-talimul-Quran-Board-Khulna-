import { MapPin, ShoppingBag, Building, Award, Users, UserCircle, BookOpen, Calendar } from "lucide-react";
import Link from "next/link";

const shortcuts = [
  { id: 1, title: "স্থায়ী কার্যালয়", subtitle: "স্থায়ী কার্যালয়ের তালিকা", icon: <MapPin className="w-8 h-8" />, link: "#" },
  { id: 2, title: "বিক্রয় কেন্দ্র", subtitle: "বই বিক্রয় কেন্দ্রের তালিকা", icon: <ShoppingBag className="w-8 h-8" />, link: "#" },
  { id: 3, title: "প্রশিক্ষণ কেন্দ্র", subtitle: "মুয়াল্লিম প্রশিক্ষণ কেন্দ্রের তালিকা", icon: <Building className="w-8 h-8" />, link: "#" },
  { id: 4, title: "বাৎসরিক প্রশিক্ষণ কেন্দ্র", subtitle: "বাৎসরিক প্রশিক্ষণ কেন্দ্রের তালিকা", icon: <Award className="w-8 h-8" />, link: "#" },
  { id: 5, title: "প্রশিক্ষক ও পরিদর্শক", subtitle: "প্রশিক্ষক ও পরিদর্শক তালিকা", icon: <Users className="w-8 h-8" />, link: "#" },
  { id: 6, title: "অফিস কর্মকর্তা", subtitle: "অফিস কর্মকর্তাদের তালিকা", icon: <UserCircle className="w-8 h-8" />, link: "#" },
  { id: 7, title: "বই ও স্টেশনারি", subtitle: "অনলাইন অর্ডার করুন", icon: <BookOpen className="w-8 h-8" />, link: "/store" },
  { id: 8, title: "বাৎসরিক ক্যালেন্ডার", subtitle: "২০২৬ সালের ক্যালেন্ডার", icon: <Calendar className="w-8 h-8" />, link: "#" },
];

export default function ShortcutCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 h-full">
      {shortcuts.map((card) => (
        <Link 
          key={card.id} 
          href={card.link}
          className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group block"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 flex-shrink-0 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all">
              {card.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{card.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-1">{card.subtitle}</p>
            </div>
          </div>
          <div className="flex justify-end mt-auto pt-2">
            <div 
              className="inline-flex justify-center items-center px-4 py-2 bg-slate-100 group-hover:bg-primary/10 text-slate-700 group-hover:text-primary text-sm font-semibold rounded-lg transition-colors"
            >
              তালিকা দেখুন
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
