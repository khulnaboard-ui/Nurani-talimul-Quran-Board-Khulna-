import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, Trash2, Image as ImageIcon, FileText, UploadCloud, X, FileDown, Calendar, FileQuestion, GraduationCap, Edit2, MoreVertical } from 'lucide-react';
import { useDialog } from "@/components/ui/DialogProvider";

type CurriculumClass = {
  id: string;
  name: string;
  order: number;
  books: CurriculumBook[];
  examYears?: { id: string; year: string }[];
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

  // Classes State
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [activeClassMenu, setActiveClassMenu] = useState<string | null>(null);
  const [editClassData, setEditClassData] = useState<{id: string, name: string} | null>(null);
  const [isEditingClass, setIsEditingClass] = useState(false);

  // Books State
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

  // Global Years State
  const [globalYears, setGlobalYears] = useState<{year: string}[]>([]);

  // Exams State
  const [examYears, setExamYears] = useState<CurriculumExamYear[]>([]);
  const [activeYearString, setActiveYearString] = useState<string | null>(null);
  const [showAddYear, setShowAddYear] = useState(false);
  const [newYear, setNewYear] = useState('');
  const [copyFromPrevious, setCopyFromPrevious] = useState(false);
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [activeYearMenu, setActiveYearMenu] = useState<string | null>(null);
  const [editYearData, setEditYearData] = useState<{oldYearString: string, year: string} | null>(null);
  const [isEditingYear, setIsEditingYear] = useState(false);
  
  const [showAddExam, setShowAddExam] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [isAddingExam, setIsAddingExam] = useState(false);

  // Exam Details State
  const [selectedExam, setSelectedExam] = useState<CurriculumExam | null>(null);
  const [activeExamTab, setActiveExamTab] = useState<'ADMIT_CARD' | 'ROUTINE' | 'QUESTION'>('ADMIT_CARD');
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceTitle, setNewResourceTitle] = useState(''); // using this for Rate
  const [isUploadingResource, setIsUploadingResource] = useState(false);
  
  // View Toggle State
  const [examViewStyle, setExamViewStyle] = useState<'grid' | 'table'>('table');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('curriculum_exam_view_style');
      if (saved === 'grid' || saved === 'table') {
        setExamViewStyle(saved);
      } else if (window.innerWidth < 768) {
        setExamViewStyle('grid');
      }
    }
  }, []);

  const handleViewStyleChange = (style: 'grid' | 'table') => {
    setExamViewStyle(style);
    if (typeof window !== 'undefined') {
      localStorage.setItem('curriculum_exam_view_style', style);
    }
  };

  useEffect(() => {
    fetchGlobalYears();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (activeClassId) {
      fetchExamYears(activeClassId);
      if (activeSubTab === 'syllabus') fetchSyllabuses(activeClassId);
    }
  }, [activeClassId, activeSubTab]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (
        target.closest('.year-menu-trigger') || target.closest('.year-menu-dropdown') ||
        target.closest('.class-menu-trigger') || target.closest('.class-menu-dropdown')
      ) {
        return;
      }
      setActiveYearMenu(null);
      setActiveClassMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeClass = classes.find(c => c.id === activeClassId && c.name !== '_YEAR_ANCHOR_');
  const activeYear = examYears.find(y => y.year === activeYearString) || (examYears.length > 0 ? examYears[0] : undefined);
  const activeYearIdForExams = activeYear?.id;

  const parseResourceTitle = (title: string | null) => {
    if (!title) return { name: '', rate: '' };
    if (title.includes('||')) {
      const [name, rate] = title.split('||');
      return { name, rate };
    }
    if (!isNaN(Number(title)) && title.trim() !== '') return { name: '', rate: title };
    return { name: title, rate: '' };
  };

  const getRateText = (exam: CurriculumExam, type: string) => {
    const resource = exam.resources.find(r => r.type === type);
    if (!resource) return '-';
    const { rate } = parseResourceTitle(resource.title);
    return rate ? `৳ ${rate}` : 'ফ্রি';
  };

  useEffect(() => {
    if (activeYearString && classes.length > 0) {
      const validForYear = classes.filter(c => c.name !== '_YEAR_ANCHOR_' && c.examYears?.some(ey => ey.year === activeYearString));
      if (validForYear.length > 0) {
        if (!activeClassId || !validForYear.some(c => c.id === activeClassId)) {
          setActiveClassId(validForYear[0].id);
        }
      } else {
        setActiveClassId(null);
      }
    }
  }, [activeYearString, classes]);

  const fetchGlobalYears = async () => {
    try {
      const res = await fetch('/api/curriculum/exam-years');
      if (res.ok) {
        const data = await res.json();
        setGlobalYears(data);
        if (data.length > 0 && !activeYearString) {
          setActiveYearString(data[0].year);
        }
      }
    } catch (e) { console.error(e); }
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/curriculum/classes');
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
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
          body: JSON.stringify({ name, order: classes.length + idx, year: activeYearString })
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

  const handleEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClassData || !editClassData.name.trim()) return;
    setIsEditingClass(true);
    try {
      const res = await fetch(`/api/curriculum/classes/${editClassData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editClassData.name })
      });
      if (res.ok) {
        setEditClassData(null);
        fetchClasses();
        alert({ title: "সফল!", message: "শ্রেণী আপডেট করা হয়েছে।", type: "success" });
      } else {
        alert({ title: "ত্রুটি!", message: "শ্রেণী আপডেট করা যায়নি।", type: "error" });
      }
    } catch (e) { alert({ title: "ত্রুটি!", message: "শ্রেণী আপডেট করা যায়নি।", type: "error" }); } 
    finally { setIsEditingClass(false); }
  };

  // Keep this if they ever want to fully delete a class globally, but use a new handler for year-specific deletion
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

  const handleDeleteClassFromYear = async (classId: string, examYearId: string) => {
    if (!await confirm({ title: "সতর্কতা!", message: "এই বছর থেকে শ্রেণীটি মুছে ফেলতে চান?", type: "warning" })) return;
    try {
      const res = await fetch(`/api/curriculum/exam-years/${examYearId}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeClassId === classId) setActiveClassId(null);
        fetchClasses(); // Refresh to update examYears associations
        if (activeClassId) fetchExamYears(activeClassId);
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
    if (!newYear.trim()) return;
    setIsAddingYear(true);
    try {
      const res = await fetch('/api/curriculum/exam-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: newYear, copyFromPrevious })
      });
      if (res.ok) {
        setShowAddYear(false);
        setNewYear('');
        setCopyFromPrevious(false);
        fetchGlobalYears();
        fetchClasses(); // Refresh class-year associations
        if (activeClassId) fetchExamYears(activeClassId);
        alert({ title: "সফল!", message: "বছর যোগ করা হয়েছে।", type: "success" });
      } else alert({ title: "ত্রুটি!", message: "বছর যোগ করা যায়নি।", type: "error" });
    } catch (e) { alert({ title: "ত্রুটি!", message: "বছর যোগ করা যায়নি।", type: "error" }); } 
    finally { setIsAddingYear(false); }
  };

  const handleEditYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editYearData || !editYearData.year.trim()) return;
    setIsEditingYear(true);
    try {
      const res = await fetch(`/api/curriculum/exam-years/global/${editYearData.oldYearString}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: editYearData.year })
      });
      if (res.ok) {
        // Update activeYearString if we just edited the currently selected year
        if (activeYearString === editYearData.oldYearString) {
          setActiveYearString(editYearData.year);
        }
        setEditYearData(null);
        fetchGlobalYears();
        if (activeClassId) fetchExamYears(activeClassId);
        alert({ title: "সফল!", message: "বছর আপডেট করা হয়েছে।", type: "success" });
      } else {
        alert({ title: "ত্রুটি!", message: "বছর আপডেট করা যায়নি।", type: "error" });
      }
    } catch (e) { alert({ title: "ত্রুটি!", message: "বছর আপডেট করা যায়নি।", type: "error" }); } 
    finally { setIsEditingYear(false); }
  };

  const handleDeleteYear = async (yearString: string) => {
    if (!await confirm({ title: "সতর্কতা!", message: "এই বছর এবং এর সকল পরীক্ষা মুছে যাবে!", type: "warning" })) return;
    try {
      const res = await fetch(`/api/curriculum/exam-years/global/${yearString}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeYearString === yearString) setActiveYearString(null);
        fetchGlobalYears();
        if (activeClassId) fetchExamYears(activeClassId);
      } else {
        alert({ title: "ত্রুটি!", message: "মুছে ফেলা যায়নি।", type: "error" });
      }
    } catch (e) { alert({ title: "ত্রুটি!", message: "মুছে ফেলা যায়নি।", type: "error" }); }
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim() || !activeYearIdForExams) return;
    setIsAddingExam(true);
    try {
      const res = await fetch('/api/curriculum/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newExamName, yearId: activeYearIdForExams })
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
      const combinedTitle = (newResourceName.trim() || newResourceTitle.trim()) 
        ? `${newResourceName.trim()}||${newResourceTitle.trim()}` 
        : null;

      const res = await fetch('/api/curriculum/exam-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: selectedExam.id, type: activeExamTab, title: combinedTitle, fileUrl })
      });
      if (res.ok && activeClassId) {
        setNewResourceName('');
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

  // Derived resources for selected exam tab
  const activeTabResources = selectedExam?.resources.filter(r => r.type === activeExamTab) || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[700px] flex flex-col relative">

      
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Horizontal Years Tabs (Now above Classes) */}
        <div className="w-full border-b border-slate-100 bg-white flex flex-wrap items-center p-4 gap-3 shrink-0">
          {globalYears.length === 0 ? (
            <p className="text-slate-400 text-sm whitespace-nowrap px-2">কোনো বছর নেই</p>
          ) : (
            globalYears.map(y => {
              return (
                <div 
                  key={y.year}
                  onClick={() => setActiveYearString(y.year)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-colors group relative ${
                    activeYearString === y.year ? 'bg-primary text-white shadow-md' : 'bg-slate-50 border border-slate-200 hover:border-primary/30 text-slate-700'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="font-bold whitespace-nowrap">{y.year}</span>
                  
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setActiveYearMenu(activeYearMenu === y.year ? null : y.year); 
                    }} 
                    className={`year-menu-trigger p-1 rounded-md transition-opacity ${activeYearString === y.year ? 'opacity-100 hover:bg-white/20 text-white/90' : 'opacity-0 text-slate-500 pointer-events-none'}`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {activeYearMenu === y.year && (
                    <div className="year-menu-dropdown absolute top-full right-0 mt-2 w-32 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveYearMenu(null); setEditYearData({ oldYearString: y.year, year: y.year }); }} 
                        className="w-full px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> এডিট
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveYearMenu(null); handleDeleteYear(y.year); }} 
                        className="w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> ডিলিট
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}

          <div className="w-px h-6 bg-slate-200 mx-1 shrink-0"></div>

          <button 
            onClick={() => setShowAddYear(true)}
            className="shrink-0 flex items-center gap-2 bg-slate-50 border border-dashed border-slate-300 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Plus className="w-4 h-4" /> নতুন বছর
          </button>
        </div>

        {globalYears.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center max-w-md">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">প্রথমে একটি বছর যোগ করুন</h3>
              <p className="text-slate-500 mb-6 font-medium">নতুন শ্রেণী, বই, সিলেবাস এবং পরীক্ষা যোগ করার জন্য প্রথমে একটি শিক্ষাবর্ষ (বছর) তৈরি করুন।</p>
              <button 
                onClick={() => setShowAddYear(true)}
                className="flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" /> নতুন বছর যোগ করুন
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Horizontal Classes Tabs */}
            <div className="w-full border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center p-4 gap-3 shrink-0">
          {loading && classes.length === 0 ? (
            <p className="text-slate-400 text-sm whitespace-nowrap px-4">লোড হচ্ছে...</p>
          ) : classes.filter(c => c.name !== '_YEAR_ANCHOR_' && c.examYears?.some(ey => ey.year === activeYearString)).length === 0 ? (
            <p className="text-slate-400 text-sm whitespace-nowrap px-4">এই বছরে কোনো শ্রেণী নেই</p>
          ) : (
            classes.filter(c => c.name !== '_YEAR_ANCHOR_' && c.examYears?.some(ey => ey.year === activeYearString)).map(c => {
              const examYearId = c.examYears?.find(ey => ey.year === activeYearString)?.id;
              return (
              <div 
                key={c.id}
                onClick={() => setActiveClassId(c.id)}
                className={`shrink-0 flex items-center gap-3 px-5 py-2.5 rounded-xl cursor-pointer transition-colors group relative ${
                  activeClassId === c.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white border border-slate-200 hover:border-primary/30 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="font-bold whitespace-nowrap">{c.name}</span>
                
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setActiveClassMenu(activeClassMenu === c.id ? null : c.id); 
                  }} 
                  className={`class-menu-trigger p-1 rounded-md transition-opacity ${activeClassId === c.id ? 'opacity-100 hover:bg-white/20 text-white/90' : 'opacity-0 text-slate-500 pointer-events-none'}`}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {activeClassMenu === c.id && (
                  <div className="class-menu-dropdown absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveClassMenu(null); setEditClassData({ id: c.id, name: c.name }); }} 
                      className="w-full px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> নাম পরিবর্তন
                    </button>
                    {examYearId && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveClassMenu(null); handleDeleteClassFromYear(c.id, examYearId); }} 
                        className="w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                        title="শুধুমাত্র বর্তমান শিক্ষাবর্ষ থেকে শ্রেণীটি মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> এই বছর থেকে মুছুন
                      </button>
                    )}
                  </div>
                )}
              </div>
            )})
          )}

          <div className="w-px h-8 bg-slate-200 mx-2 shrink-0"></div>

          <button 
            onClick={() => setShowAddClass(true)}
            className="shrink-0 flex items-center gap-2 bg-white border border-dashed border-slate-300 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Plus className="w-4 h-4" /> নতুন শ্রেণী
          </button>
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
              </div>
            </div>

            {/* Sub Tab Content */}
            <div className="flex-1 overflow-y-auto bg-white p-6 pt-4 md:px-8 md:pb-8 md:pt-5">
              {/* BOOKS TAB */}
              {activeSubTab === 'books' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl md:text-2xl font-black text-slate-800 border-l-4 border-primary pl-3">{activeClass.name} এর বইসমূহ</h3>
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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl md:text-2xl font-black text-slate-800 border-l-4 border-primary pl-3">{activeClass.name} এর সিলেবাস</h3>
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
                <div className="flex flex-col gap-8 min-h-[400px]">
                  {/* Exams Grid */}
                  <div className="flex-1 bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                    {activeYear ? (
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold text-slate-800">{activeYear.year} সালের পরীক্ষাসমূহ</h3>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                              <button 
                                onClick={() => handleViewStyleChange('grid')}
                                className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${examViewStyle === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                কার্ড
                              </button>
                              <button 
                                onClick={() => handleViewStyleChange('table')}
                                className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${examViewStyle === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                                তালিকা
                              </button>
                            </div>
                            <button onClick={() => setShowAddExam(true)} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                              <Plus className="w-4 h-4" /> নতুন পরীক্ষা যোগ করুন
                            </button>
                          </div>
                        </div>

                        {activeYear.exams.length === 0 ? (
                           <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                              <FileQuestion className="w-10 h-10 text-indigo-300" />
                            </div>
                            <p className="font-bold text-slate-600 text-lg mb-2">কোনো পরীক্ষা যোগ করা হয়নি</p>
                            <p className="text-slate-400 text-sm">ওপরের বাটন থেকে নতুন পরীক্ষা যোগ করুন</p>
                          </div>
                        ) : examViewStyle === 'table' ? (
                          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                                  <th className="py-4 px-6 font-bold">পরীক্ষার নাম</th>
                                  <th className="py-4 px-6 font-bold">অ্যাডমিট কার্ড</th>
                                  <th className="py-4 px-6 font-bold">রুটিন</th>
                                  <th className="py-4 px-6 font-bold">প্রশ্নপত্র</th>
                                  <th className="py-4 px-6 font-bold text-right">অ্যাকশন</th>
                                </tr>
                              </thead>
                              <tbody>
                                {activeYear.exams.map((exam, index) => (
                                  <tr key={exam.id} onClick={() => setSelectedExam(exam)} className={`cursor-pointer hover:bg-slate-50 transition-colors ${index !== activeYear.exams.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                    <td className="py-4 px-6 font-bold text-slate-800">{exam.name}</td>
                                    <td className="py-4 px-6">
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold">
                                        <FileText className="w-3.5 h-3.5" /> {getRateText(exam, 'ADMIT_CARD')}
                                      </span>
                                    </td>
                                    <td className="py-4 px-6">
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold">
                                        <Calendar className="w-3.5 h-3.5" /> {getRateText(exam, 'ROUTINE')}
                                      </span>
                                    </td>
                                    <td className="py-4 px-6">
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 text-xs font-bold">
                                        <FileQuestion className="w-3.5 h-3.5" /> {getRateText(exam, 'QUESTION')}
                                      </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                      <button onClick={(e) => { e.stopPropagation(); handleDeleteExam(exam.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {activeYear.exams.map(exam => (
                              <div key={exam.id} onClick={() => setSelectedExam(exam)} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative group overflow-hidden">
                                {/* Decorative Gradient Blob */}
                                <div className="absolute -right-6 -top-6 w-28 h-28 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border border-indigo-100/50 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                      <FileQuestion className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <h4 className="font-black text-lg text-slate-800 tracking-tight leading-tight">{exam.name}</h4>
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteExam(exam.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-3 relative z-10">
                                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/50 transition-colors duration-300">
                                    <div className="flex items-center gap-1.5 mb-1.5 text-slate-500"><FileText className="w-3.5 h-3.5 text-blue-500" /> <span className="text-[10px] font-black uppercase tracking-wider">অ্যাডমিট</span></div>
                                    <span className="font-black text-slate-700 text-sm">{getRateText(exam, 'ADMIT_CARD')}</span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-emerald-100 group-hover:bg-emerald-50/50 transition-colors duration-300">
                                    <div className="flex items-center gap-1.5 mb-1.5 text-slate-500"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-[10px] font-black uppercase tracking-wider">রুটিন</span></div>
                                    <span className="font-black text-slate-700 text-sm">{getRateText(exam, 'ROUTINE')}</span>
                                  </div>
                                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-purple-100 group-hover:bg-purple-50/50 transition-colors duration-300">
                                    <div className="flex items-center gap-1.5 mb-1.5 text-slate-500"><FileQuestion className="w-3.5 h-3.5 text-purple-500" /> <span className="text-[10px] font-black uppercase tracking-wider">প্রশ্নপত্র</span></div>
                                    <span className="font-black text-slate-700 text-sm">{getRateText(exam, 'QUESTION')}</span>
                                  </div>
                                </div>
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
          </>
        )}
      </div>

      {/* --- MODALS --- */}
      
      {/* Edit Class Modal */}
      {editClassData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">শ্রেণীর নাম পরিবর্তন</h3>
              <button onClick={() => setEditClassData(null)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditClass} className="p-5">
              <div className="mb-5">
                <input 
                  type="text"
                  value={editClassData.name}
                  onChange={e => setEditClassData({...editClassData, name: e.target.value})}
                  placeholder="উদাঃ ১ম শ্রেণী" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50 font-medium text-sm"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">এই পরিবর্তনটি সকল শিক্ষাবর্ষের জন্য প্রযোজ্য হবে।</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditClassData(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">বাতিল</button>
                <button type="submit" disabled={isEditingClass} className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isEditingClass ? 'অপেক্ষা করুন...' : 'আপডেট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
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

      {/* Edit Year Modal */}
      {editYearData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h2 className="font-bold text-slate-800 text-lg">বছর এডিট করুন</h2>
              <button onClick={() => setEditYearData(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleEditYear} className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">বছর <span className="text-red-500">*</span></label>
                  <input type="text" value={editYearData.year} onChange={e => setEditYearData({...editYearData, year: e.target.value})} placeholder="যেমন: 2024" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-slate-800" />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setEditYearData(null)} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">বাতিল</button>
                <button type="submit" disabled={isEditingYear} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isEditingYear ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}
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
                    <label className="block text-xs font-bold text-slate-500 mb-2">ফাইলের নাম (ঐচ্ছিক)</label>
                    <input 
                      type="text" 
                      value={newResourceName}
                      onChange={e => setNewResourceName(e.target.value)}
                      placeholder="উদাঃ ১ম সাময়িক রুটিন" 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
                    />
                  </div>
                  <div className="w-full md:w-[150px] shrink-0">
                    <label className="block text-xs font-bold text-slate-500 mb-2">ফ্রি/মূল্য (৳)</label>
                    <input 
                      type="number" 
                      value={newResourceTitle}
                      onChange={e => setNewResourceTitle(e.target.value)}
                      placeholder="উদাঃ ৫০" 
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
                      <div className="flex-1 overflow-hidden flex flex-col justify-center">
                        <h4 className="font-bold text-slate-800 text-sm truncate flex items-center">
                          {(() => {
                            const parsed = parseResourceTitle(resource.title);
                            return (
                              <>
                                <span>{parsed.name || 'শিরোনাম ছাড়া ফাইল'}</span>
                                {parsed.rate ? (
                                  <span className="ml-2 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-xs">মূল্য: ৳ {parsed.rate}</span>
                                ) : (
                                  <span className="ml-2 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md text-xs">ফ্রি</span>
                                )}
                              </>
                            );
                          })()}
                        </h4>
                        <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary font-bold hover:underline mt-1.5 inline-block">ডাউনলোড / দেখুন</a>
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
