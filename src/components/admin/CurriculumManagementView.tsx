import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Image as ImageIcon, FileText, UploadCloud, X, FileDown, Calendar, FileQuestion, GraduationCap } from 'lucide-react';
import { useDialog } from "@/components/ui/DialogProvider";

type CurriculumClass = {
  id: string;
  name: string;
  order: number;
  books: CurriculumBook[];
};

type CurriculumBook = {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  pdfUrl?: string;
  classId: string;
};

type CurriculumSyllabus = {
  id: string;
  title: string;
  pdfUrl: string;
  classId: string;
};

type CurriculumExamYear = {
  id: string;
  year: string;
  classId: string;
  exams: CurriculumExam[];
};

type CurriculumExam = {
  id: string;
  name: string;
  yearId: string;
  resources: CurriculumExamResource[];
};

type CurriculumExamResource = {
  id: string;
  examId: string;
  type: 'ADMIT_CARD' | 'ROUTINE' | 'QUESTION';
  title?: string;
  fileUrl: string;
};

export default function CurriculumManagementView() {
  const { alert, confirm } = useDialog();
  const [classes, setClasses] = useState<CurriculumClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'books' | 'syllabus' | 'exams'>('books');

  // Books State
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', description: '', coverImage: '', pdfUrl: '' });
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Syllabus State
  const [syllabuses, setSyllabuses] = useState<CurriculumSyllabus[]>([]);
  const [showAddSyllabus, setShowAddSyllabus] = useState(false);
  const [newSyllabus, setNewSyllabus] = useState({ title: '', pdfUrl: '' });
  const [isAddingSyllabus, setIsAddingSyllabus] = useState(false);

  // Exams State
  const [examYears, setExamYears] = useState<CurriculumExamYear[]>([]);
  const [activeYearId, setActiveYearId] = useState<string | null>(null);
  const [showAddYear, setShowAddYear] = useState(false);
  const [newYear, setNewYear] = useState('');
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [isAddingExam, setIsAddingExam] = useState(false);

  // Exam Details State
  const [selectedExam, setSelectedExam] = useState<CurriculumExam | null>(null);
  const [activeExamTab, setActiveExamTab] = useState<'ADMIT_CARD' | 'ROUTINE' | 'QUESTION'>('ADMIT_CARD');
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [isUploadingResource, setIsUploadingResource] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (activeClassId) {
      if (activeSubTab === 'syllabus') fetchSyllabuses(activeClassId);
      if (activeSubTab === 'exams') fetchExamYears(activeClassId);
    }
  }, [activeClassId, activeSubTab]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/curriculum/classes');
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
        if (data.length > 0 && !activeClassId) setActiveClassId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyllabuses = async (cId: string) => {
    try {
      const res = await fetch(`/api/curriculum/syllabus?classId=${cId}`);
      if (res.ok) setSyllabuses(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchExamYears = async (cId: string) => {
    try {
      const res = await fetch(`/api/curriculum/exam-years?classId=${cId}`);
      if (res.ok) {
        const data = await res.json();
        setExamYears(data);
        if (data.length > 0 && !activeYearId) setActiveYearId(data[0].id);
        
        // Update selectedExam if it's currently open
        if (selectedExam) {
          const updatedYear = data.find((y: any) => y.id === selectedExam.yearId);
          const updatedExam = updatedYear?.exams.find((e: any) => e.id === selectedExam.id);
          if (updatedExam) setSelectedExam(updatedExam);
        }
      }
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'pdf' | 'resource') => {
    const file = e.target.files?.[0];
    if (!file) return null;

    if (type === 'image') setUploadingImage(true);
    else if (type === 'pdf') setUploadingPdf(true);
    else setIsUploadingResource(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (type === 'image') setNewBook({ ...newBook, coverImage: data.url });
        else if (type === 'pdf') {
          if (showAddSyllabus) setNewSyllabus({ ...newSyllabus, pdfUrl: data.url });
          else setNewBook({ ...newBook, pdfUrl: data.url });
        }
        return data.url;
      } else {
        alert({ title: "ত্রুটি!", message: "ফাইল আপলোড করা যায়নি।", type: "error" });
        return null;
      }
    } catch (e) {
      alert({ title: "ত্রুটি!", message: "ফাইল আপলোড করা যায়নি।", type: "error" });
      return null;
    } finally {
      if (type === 'image') setUploadingImage(false);
      else if (type === 'pdf') setUploadingPdf(false);
      else setIsUploadingResource(false);
    }
  };

  /* ----- Classes Handlers ----- */
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setIsAddingClass(true);
    try {
      const classNames = newClassName.split('\n').map(n => n.trim()).filter(n => n);
      let successCount = 0;
      await Promise.all(classNames.map(async (name, idx) => {
        const res = await fetch('/api/curriculum/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, order: classes.length + idx })
        });
        if (res.ok) successCount++;
      }));
      if (successCount > 0) {
        setShowAddClass(false);
        setNewClassName('');
        fetchClasses();
        alert({ title: "সফল!", message: `${successCount} টি শ্রেণী যোগ করা হয়েছে।`, type: "success" });
      } else alert({ title: "ত্রুটি!", message: "শ্রেণী যোগ করা যায়নি।", type: "error" });
    } catch (e) { alert({ title: "ত্রুটি!", message: "শ্রেণী যোগ করা যায়নি।", type: "error" }); } 
    finally { setIsAddingClass(false); }
  };

  const handleDeleteClass = async (id: string) => {
    if (!await confirm({ title: "সতর্কতা!", message: "আপনি কি নিশ্চিত? এই শ্রেণীর সকল তথ্য মুছে যাবে।", type: "warning" })) return;
    try {
      const res = await fetch(`/api/curriculum/classes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeClassId === id) setActiveClassId(null);
        fetchClasses();
      } else alert({ title: "ত্রুটি!", message: "মুছে ফেলা যায়নি।", type: "error" });
    } catch (e) { alert({ title: "ত্রুটি!", message: "মুছে ফেলা যায়নি।", type: "error" }); }
  };

  /* ----- Books Handlers ----- */
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title.trim() || !activeClassId) return;
    setIsAddingBook(true);
    try {
      const bookTitles = newBook.title.split('\n').map(t => t.trim()).filter(t => t);
      let successCount = 0;
      await Promise.all(bookTitles.map(async (title) => {
        const res = await fetch('/api/curriculum/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newBook, title, classId: activeClassId })
        });
        if (res.ok) successCount++;
      }));
      if (successCount > 0) {
        setShowAddBook(false);
        setNewBook({ title: '', description: '', coverImage: '', pdfUrl: '' });
        fetchClasses();
        alert({ title: "সফল!", message: `${successCount} টি বই যোগ করা হয়েছে।`, type: "success" });
      } else alert({ title: "ত্রুটি!", message: "বই যোগ করা যায়নি।", type: "error" });
    } catch (e) { alert({ title: "ত্রুটি!", message: "বই যোগ করা যায়নি।", type: "error" }); } 
    finally { setIsAddingBook(false); }
  };

  const handleDeleteBook = async (id: string) => {
    if (!await confirm({ title: "সতর্কতা!", message: "বইটি মুছে ফেলতে চান?", type: "warning" })) return;
    try {
      const res = await fetch(`/api/curriculum/books/${id}`, { method: 'DELETE' });
      if (res.ok) fetchClasses();
      else alert({ title: "ত্রুটি!", message: "মুছে ফেলা যায়নি।", type: "error" });
    } catch (e) { alert({ title: "ত্রুটি!", message: "মুছে ফেলা যায়নি।", type: "error" }); }
  };

  /* ----- Syllabus Handlers ----- */
  const handleAddSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSyllabus.title || !newSyllabus.pdfUrl || !activeClassId) return;
    setIsAddingSyllabus(true);
    try {
      const res = await fetch('/api/curriculum/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSyllabus, classId: activeClassId })
      });
      if (res.ok) {
        setShowAddSyllabus(false);
        setNewSyllabus({ title: '', pdfUrl: '' });
        fetchSyllabuses(activeClassId);
        alert({ title: "সফল!", message: "সিলেবাস যোগ করা হয়েছে।", type: "success" });
      } else alert({ title: "ত্রুটি!", message: "সিলেবাস যোগ করা যায়নি।", type: "error" });
    } catch (e) { alert({ title: "ত্রুটি!", message: "সিলেবাস যোগ করা যায়নি।", type: "error" }); } 
    finally { setIsAddingSyllabus(false); }
  };

  const handleDeleteSyllabus = async (id: string) => {
    if (!await confirm({ title: "সতর্কতা!", message: "সিলেবাসটি মুছে ফেলতে চান?", type: "warning" })) return;
    try {
      const res = await fetch(`/api/curriculum/syllabus/${id}`, { method: 'DELETE' });
      if (res.ok && activeClassId) fetchSyllabuses(activeClassId);
      else alert({ title: "ত্রুটি!", message: "মুছে ফেলা যায়নি।", type: "error" });
    } catch (e) { alert({ title: "ত্রুটি!", message: "মুছে ফেলা যায়নি।", type: "error" }); }
  };

  /* ----- Exams Handlers ----- */
  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear.trim() || !activeClassId) return;
    setIsAddingYear(true);
    try {
      const res = await fetch('/api/curriculum/exam-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: newYear, classId: activeClassId })
      });
      if (res.ok) {
        setShowAddYear(false);
        setNewYear('');
        fetchExamYears(activeClassId);
        alert({ title: "সফল!", message: "বছর যোগ করা হয়েছে।", type: "success" });
      } else alert({ title: "ত্রুটি!", message: "বছর যোগ করা যায়নি।", type: "error" });
    } catch (e) { alert({ title: "ত্রুটি!", message: "বছর যোগ করা যায়নি।", type: "error" }); } 
    finally { setIsAddingYear(false); }
  };

  const handleDeleteYear = async (id: string) => {
    if (!await confirm({ title: "সতর্কতা!", message: "এই বছর এবং এর সকল পরীক্ষা মুছে যাবে!", type: "warning" })) return;
    try {
      const res = await fetch(`/api/curriculum/exam-years/${id}`, { method: 'DELETE' });
      if (res.ok && activeClassId) {
        if (activeYearId === id) setActiveYearId(null);
        fetchExamYears(activeClassId);
      }
    } catch (e) { alert({ title: "ত্রুটি!", message: "মুছে ফেলা যায়নি।", type: "error" }); }
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim() || !activeYearId) return;
    setIsAddingExam(true);
    try {
      const res = await fetch('/api/curriculum/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newExamName, yearId: activeYearId })
      });
      if (res.ok) {
        setShowAddExam(false);
        setNewExamName('');
        if (activeClassId) fetchExamYears(activeClassId);
        alert({ title: "সফল!", message: "পরীক্ষা যোগ করা হয়েছে।", type: "success" });
      }
    } catch (e) { alert({ title: "ত্রুটি!", message: "পরীক্ষা যোগ করা যায়নি।", type: "error" }); } 
    finally { setIsAddingExam(false); }
  };

  const handleDeleteExam = async (id: string) => {
    if (!await confirm({ title: "সতর্কতা!", message: "পরীক্ষাটি মুছে ফেলতে চান?", type: "warning" })) return;
    try {
      const res = await fetch(`/api/curriculum/exams/${id}`, { method: 'DELETE' });
      if (res.ok && activeClassId) {
        fetchExamYears(activeClassId);
        if (selectedExam?.id === id) setSelectedExam(null);
      }
    } catch (e) { alert({ title: "ত্রুটি!", message: "মুছে ফেলা যায়নি।", type: "error" }); }
  };

  const handleResourceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedExam) return;
    const fileUrl = await handleFileUpload(e, 'resource');
    if (!fileUrl) return;

    try {
      const res = await fetch('/api/curriculum/exam-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: selectedExam.id, type: activeExamTab, title: newResourceTitle || null, fileUrl })
      });
      if (res.ok && activeClassId) {
        setNewResourceTitle('');
        fetchExamYears(activeClassId);
        alert({ title: "সফল!", message: "ফাইল যোগ করা হয়েছে।", type: "success" });
      }
    } catch (err) {
      alert({ title: "ত্রুটি!", message: "ফাইল যোগ করা যায়নি।", type: "error" });
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!await confirm({ title: "সতর্কতা!", message: "ফাইলটি মুছে ফেলতে চান?", type: "warning" })) return;
    try {
      const res = await fetch(`/api/curriculum/exam-resources/${id}`, { method: 'DELETE' });
      if (res.ok && activeClassId) fetchExamYears(activeClassId);
    } catch (e) { alert({ title: "ত্রুটি!", message: "মুছে ফেলা যায়নি।", type: "error" }); }
  };

  const activeClass = classes.find(c => c.id === activeClassId);
  const activeYear = examYears.find(y => y.id === activeYearId);
  
  // Derived resources for selected exam tab
  const activeTabResources = selectedExam?.resources.filter(r => r.type === activeExamTab) || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[700px] flex flex-col relative">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> সিলেবাস ও কারিকুলাম
          </h2>
          <p className="text-sm text-slate-500 mt-1">মাদরাসার বিভিন্ন শ্রেণীর সিলেবাস, বই এবং পরীক্ষার কারিকুলাম পরিচালনা করুন।</p>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Horizontal Classes Tabs */}
        <div className="w-full border-b border-slate-100 bg-slate-50/50 flex items-center p-4 gap-3 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setShowAddClass(true)}
            className="shrink-0 flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> নতুন শ্রেণী
          </button>

          <div className="w-px h-8 bg-slate-200 mx-2 shrink-0"></div>

          {loading && classes.length === 0 ? (
            <p className="text-slate-400 text-sm whitespace-nowrap px-4">লোড হচ্ছে...</p>
          ) : classes.length === 0 ? (
            <p className="text-slate-400 text-sm whitespace-nowrap px-4">কোনো শ্রেণী নেই</p>
          ) : (
            classes.map(c => (
              <div 
                key={c.id}
                onClick={() => setActiveClassId(c.id)}
                className={`shrink-0 flex items-center gap-3 px-5 py-2.5 rounded-xl cursor-pointer transition-colors group ${
                  activeClassId === c.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white border border-slate-200 hover:border-primary/30 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="font-bold whitespace-nowrap">{c.name}</span>
              </div>
            ))
          )}
        </div>

        {activeClass ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Sub Tabs */}
            <div className="flex items-center justify-between px-8 border-b border-slate-100 bg-white h-[60px]">
              <div className="flex items-center gap-6 h-full">
                <button 
                  onClick={() => setActiveSubTab('books')}
                  className={`h-full font-bold text-sm border-b-2 transition-colors ${activeSubTab === 'books' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  বইসমূহ
                </button>
                <button 
                  onClick={() => setActiveSubTab('syllabus')}
                  className={`h-full font-bold text-sm border-b-2 transition-colors ${activeSubTab === 'syllabus' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  সিলেবাস
                </button>
                <button 
                  onClick={() => setActiveSubTab('exams')}
                  className={`h-full font-bold text-sm border-b-2 transition-colors ${activeSubTab === 'exams' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  পরীক্ষা
                </button>
              </div>
              <div className="flex items-center">
                {activeSubTab === 'books' && (
                  <button onClick={() => setShowAddBook(true)} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> নতুন বই যোগ করুন
                  </button>
                )}
                {activeSubTab === 'syllabus' && (
                  <button onClick={() => setShowAddSyllabus(true)} className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-purple-600 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> সিলেবাস যোগ করুন
                  </button>
                )}
                {activeSubTab === 'exams' && (
                  <button onClick={() => setShowAddYear(true)} className="flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> নতুন বছর যোগ করুন
                  </button>
                )}
              </div>
            </div>

            {/* Sub Tab Content */}
            <div className="flex-1 overflow-y-auto bg-white p-6 md:p-8">
              {/* BOOKS TAB */}
              {activeSubTab === 'books' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-slate-800 border-l-4 border-primary pl-3">{activeClass.name} এর বইসমূহ</h3>
                  </div>

                  {activeClass.books.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="font-bold text-slate-500">এই শ্রেণীতে কোনো বই যোগ করা হয়নি</p>
                      <p className="text-sm text-slate-400 mt-1">"নতুন বই যোগ করুন" বাটনে ক্লিক করে বই যুক্ত করুন</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {activeClass.books.map(book => (
                        <div key={book.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group flex flex-col">
                          <div className="aspect-[3/4] bg-slate-50 relative border-b border-slate-100 flex items-center justify-center p-4">
                            {book.coverImage ? (
                              <img src={book.coverImage} alt={book.title} className="w-full h-full object-contain rounded-lg shadow-sm" />
                            ) : (
                              <BookOpen className="w-12 h-12 text-slate-300" />
                            )}
                            <button onClick={() => handleDeleteBook(book.id)} className="absolute top-2 right-2 bg-white/90 text-red-500 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all backdrop-blur-sm">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <h4 className="font-bold text-slate-800 line-clamp-2 leading-snug">{book.title}</h4>
                            {book.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{book.description}</p>}
                            
                            <div className="mt-auto pt-4">
                              {book.pdfUrl ? (
                                <a href={book.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold text-sm transition-colors">
                                  <FileText className="w-4 h-4" /> PDF পড়ুন
                                </a>
                              ) : (
                                <div className="flex items-center justify-center gap-2 w-full py-2 bg-slate-50 text-slate-400 rounded-lg font-bold text-sm">
                                  <FileText className="w-4 h-4 opacity-50" /> PDF নেই
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SYLLABUS TAB */}
              {activeSubTab === 'syllabus' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-slate-800 border-l-4 border-primary pl-3">{activeClass.name} এর সিলেবাস</h3>
                  </div>

                  {syllabuses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <GraduationCap className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="font-bold text-slate-500">এই শ্রেণীতে কোনো সিলেবাস যোগ করা হয়নি</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {syllabuses.map(s => (
                        <div key={s.id} className="flex items-center p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 mr-4 shrink-0">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h4 className="font-bold text-slate-800 truncate">{s.title}</h4>
                            <a href={s.pdfUrl} target="_blank" rel="noreferrer" className="text-xs text-primary font-bold hover:underline mt-1 inline-block">ডাউনলোড / দেখুন</a>
                          </div>
                          <button onClick={() => handleDeleteSyllabus(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* EXAMS TAB */}
              {activeSubTab === 'exams' && (
                <div className="flex flex-col md:flex-row-reverse gap-8 min-h-[400px]">
                  {/* Years Sidebar */}
                  <div className="w-full md:w-56 shrink-0 flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      {examYears.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm p-4">কোনো বছর নেই</p>
                      ) : (
                        examYears.map(y => (
                          <div 
                            key={y.id}
                            onClick={() => setActiveYearId(y.id)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors group ${activeYearId === y.id ? 'bg-primary text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                          >
                            <span className="font-bold flex items-center gap-2"><Calendar className="w-4 h-4" /> {y.year}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteYear(y.id); }} className={`p-1 rounded-md opacity-0 group-hover:opacity-100 ${activeYearId === y.id ? 'hover:bg-white/20' : 'text-red-500 hover:bg-red-50'}`}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Exams Grid */}
                  <div className="flex-1 bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                    {activeYear ? (
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold text-slate-800">{activeYear.year} সালের পরীক্ষাসমূহ</h3>
                          <button onClick={() => setShowAddExam(true)} className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors shadow-sm">
                            <Plus className="w-4 h-4" /> পরীক্ষা যোগ করুন
                          </button>
                        </div>

                        {activeYear.exams.length === 0 ? (
                           <div className="flex flex-col items-center justify-center p-12 text-center">
                            <FileQuestion className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="font-bold text-slate-500">এই বছরে কোনো পরীক্ষা যোগ করা হয়নি</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeYear.exams.map(exam => (
                              <div key={exam.id} onClick={() => setSelectedExam(exam)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group">
                                <h4 className="font-bold text-lg text-slate-800 pr-8">{exam.name}</h4>
                                <div className="flex items-center gap-4 mt-4 text-xs font-bold text-slate-500">
                                  <div className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-blue-500" /> {exam.resources.filter(r => r.type === 'ADMIT_CARD').length}</div>
                                  <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> {exam.resources.filter(r => r.type === 'ROUTINE').length}</div>
                                  <div className="flex items-center gap-1"><FileQuestion className="w-3.5 h-3.5 text-purple-500" /> {exam.resources.filter(r => r.type === 'QUESTION').length}</div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteExam(exam.id); }} className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Calendar className="w-12 h-12 opacity-20 mb-4" />
                        <p className="font-medium">পরীক্ষা দেখতে বাম পাশ থেকে একটি বছর নির্বাচন করুন</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white">
            <BookOpen className="w-16 h-16 opacity-20 mb-4" />
            <p className="font-medium text-lg">তথ্য দেখতে ওপর থেকে একটি শ্রেণী নির্বাচন করুন</p>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      
      {/* Add Class Modal */}
      {showAddClass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">নতুন শ্রেণী</h3>
              <button onClick={() => setShowAddClass(false)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddClass} className="p-5">
              <div className="mb-5">
                <textarea 
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder={"উদাঃ ১ম শ্রেণী\n২য় শ্রেণী\n৩য় শ্রেণী"} 
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 resize-none font-medium text-sm leading-relaxed"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddClass(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">বাতিল</button>
                <button type="submit" disabled={isAddingClass} className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isAddingClass ? 'অপেক্ষা করুন...' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">নতুন বই যোগ করুন</h3>
              <button onClick={() => setShowAddBook(false)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddBook} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">বইয়ের নাম</label>
                  <textarea 
                    value={newBook.title}
                    onChange={e => setNewBook({...newBook, title: e.target.value})}
                    placeholder={"উদাঃ শিশুদের বাংলা পাঠ\nএসো আরবি শিখি"} 
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 resize-none font-mono"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">একাধিক বই যোগ করতে প্রতিটি বইয়ের নাম নতুন লাইনে লিখুন।</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">বিবরণ (ঐচ্ছিক)</label>
                  <textarea 
                    value={newBook.description}
                    onChange={e => setNewBook({...newBook, description: e.target.value})}
                    placeholder="বই সম্পর্কে কিছু লিখুন..." 
                    rows={2}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Cover Image Upload */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">কভার ছবি</label>
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative overflow-hidden group">
                      {newBook.coverImage ? (
                        <>
                          <img src={newBook.coverImage} className="w-full h-full object-contain p-1 opacity-50 group-hover:opacity-30 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs text-slate-800">পরিবর্তন করুন</div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadingImage ? <span className="animate-spin text-primary">⏳</span> : <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />}
                          <p className="text-[10px] text-slate-500 font-bold">{uploadingImage ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'image')} disabled={uploadingImage} />
                    </label>
                  </div>

                  {/* PDF Upload */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">PDF ফাইল (অ্যাডমিন)</label>
                    <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${newBook.pdfUrl ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploadingPdf ? (
                          <span className="animate-spin text-primary">⏳</span>
                        ) : newBook.pdfUrl ? (
                          <FileDown className="w-6 h-6 text-emerald-500 mb-2" />
                        ) : (
                          <FileText className="w-6 h-6 text-slate-400 mb-2" />
                        )}
                        <p className={`text-[10px] font-bold ${newBook.pdfUrl ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {uploadingPdf ? 'আপলোড হচ্ছে...' : newBook.pdfUrl ? 'PDF যুক্ত করা হয়েছে' : 'PDF আপলোড করুন'}
                        </p>
                      </div>
                      <input type="file" accept="application/pdf" className="hidden" onChange={e => handleFileUpload(e, 'pdf')} disabled={uploadingPdf} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowAddBook(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">বাতিল</button>
                <button type="submit" disabled={isAddingBook} className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isAddingBook ? 'অপেক্ষা করুন...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Syllabus Modal */}
      {showAddSyllabus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">নতুন সিলেবাস</h3>
              <button onClick={() => setShowAddSyllabus(false)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddSyllabus} className="p-5">
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">শিরোনাম</label>
                <input 
                  type="text" 
                  value={newSyllabus.title}
                  onChange={e => setNewSyllabus({...newSyllabus, title: e.target.value})}
                  placeholder="উদাঃ ১ম শ্রেণীর সিলেবাস ২০২৪" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-slate-50"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">PDF ফাইল</label>
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${newSyllabus.pdfUrl ? 'border-purple-200 bg-purple-50 hover:bg-purple-100' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingPdf ? (
                      <span className="animate-spin text-purple-500">⏳</span>
                    ) : newSyllabus.pdfUrl ? (
                      <FileDown className="w-8 h-8 text-purple-500 mb-2" />
                    ) : (
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    )}
                    <p className={`text-sm font-bold mt-2 ${newSyllabus.pdfUrl ? 'text-purple-600' : 'text-slate-500'}`}>
                      {uploadingPdf ? 'আপলোড হচ্ছে...' : newSyllabus.pdfUrl ? 'PDF যুক্ত করা হয়েছে' : 'ফাইল আপলোড করতে ক্লিক করুন'}
                    </p>
                  </div>
                  <input type="file" accept="application/pdf" className="hidden" onChange={e => handleFileUpload(e, 'pdf')} disabled={uploadingPdf} />
                </label>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddSyllabus(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">বাতিল</button>
                <button type="submit" disabled={isAddingSyllabus || !newSyllabus.pdfUrl} className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50">
                  {isAddingSyllabus ? 'অপেক্ষা করুন...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Year Modal */}
      {showAddYear && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">নতুন বছর</h3>
              <button onClick={() => setShowAddYear(false)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddYear} className="p-5">
              <div className="mb-5">
                <label className="block text-sm font-bold text-slate-700 mb-2">বছর</label>
                <input 
                  type="number" 
                  value={newYear}
                  onChange={e => setNewYear(e.target.value)}
                  placeholder="উদাঃ 2024" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/20 bg-slate-50"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddYear(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">বাতিল</button>
                <button type="submit" disabled={isAddingYear} className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors disabled:opacity-50">
                  {isAddingYear ? 'অপেক্ষা করুন...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Exam Modal */}
      {showAddExam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">নতুন পরীক্ষা</h3>
              <button onClick={() => setShowAddExam(false)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddExam} className="p-5">
              <div className="mb-5">
                <label className="block text-sm font-bold text-slate-700 mb-2">পরীক্ষার নাম</label>
                <input 
                  type="text" 
                  value={newExamName}
                  onChange={e => setNewExamName(e.target.value)}
                  placeholder="উদাঃ অর্ধবার্ষিক পরীক্ষা" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddExam(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">বাতিল</button>
                <button type="submit" disabled={isAddingExam} className="flex-1 py-2.5 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50">
                  {isAddingExam ? 'অপেক্ষা করুন...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Detail Modal */}
      {selectedExam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-full max-h-[800px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-2xl font-black text-slate-800">{selectedExam.name}</h2>
                <p className="text-slate-500 text-sm mt-1">{activeClass?.name} - {examYears.find(y => y.id === selectedExam.yearId)?.year} সাল</p>
              </div>
              <button onClick={() => setSelectedExam(null)} className="p-2 hover:bg-slate-200 rounded-xl text-slate-500 bg-white shadow-sm"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex border-b border-slate-100 bg-white overflow-x-auto">
              {[
                { id: 'ADMIT_CARD', label: 'অ্যাডমিট কার্ড', icon: FileText, color: 'blue' },
                { id: 'ROUTINE', label: 'রুটিন', icon: Calendar, color: 'emerald' },
                { id: 'QUESTION', label: 'প্রশ্নপত্র', icon: FileQuestion, color: 'purple' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveExamTab(tab.id as any)}
                  className={`flex items-center gap-2 px-8 py-4 font-bold text-sm border-b-2 transition-all ${activeExamTab === tab.id ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50/50` : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-6 md:p-8 bg-slate-50/50 overflow-y-auto">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
                <h3 className="font-bold text-slate-800 mb-4">নতুন ফাইল যোগ করুন</h3>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-500 mb-2">শিরোনাম (ঐচ্ছিক)</label>
                    <input 
                      type="text" 
                      value={newResourceTitle}
                      onChange={e => setNewResourceTitle(e.target.value)}
                      placeholder="উদাঃ ১ম সাময়িক রুটিন" 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                    />
                  </div>
                  <div className="shrink-0 w-full md:w-auto">
                    <label className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-colors ${isUploadingResource ? 'bg-slate-200 text-slate-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                      {isUploadingResource ? (
                        <><span className="animate-spin">⏳</span> আপলোড হচ্ছে...</>
                      ) : (
                        <><UploadCloud className="w-4 h-4" /> ফাইল আপলোড করুন</>
                      )}
                      <input type="file" accept="application/pdf,image/*" className="hidden" onChange={handleResourceUpload} disabled={isUploadingResource} />
                    </label>
                  </div>
                </div>
              </div>

              {activeTabResources.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="font-bold text-slate-500">কোনো ফাইল যোগ করা হয়নি</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTabResources.map(resource => (
                    <div key={resource.id} className="flex items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 mr-4 shrink-0">
                        {resource.fileUrl.endsWith('.pdf') ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{resource.title || 'শিরোনাম ছাড়া ফাইল'}</h4>
                        <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary font-bold hover:underline mt-1 inline-block">ডাউনলোড / দেখুন</a>
                      </div>
                      <button onClick={() => handleDeleteResource(resource.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
