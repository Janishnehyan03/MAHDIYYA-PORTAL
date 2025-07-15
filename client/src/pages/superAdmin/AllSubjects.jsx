import { faAdd, faEdit, faTrash, faSearch, faSort, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState, useMemo } from "react";
import Axios from "../../Axios";
import { toast } from "react-toastify"; // Assuming you use react-toastify for notifications

// --- Reusable UI Components ---

const TableSkeleton = () => (
    <div className="animate-pulse p-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-4 border-b border-slate-100">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            </div>
        ))}
    </div>
);

const EmptyState = ({ onClearFilters }) => (
    <div className="text-center py-16 px-6">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-slate-900">No subjects found</h3>
        <p className="mt-1 text-sm text-slate-500">No subjects match your current search or filter criteria.</p>
        <div className="mt-6">
            <button type="button" onClick={onClearFilters} className="text-sm font-semibold text-blue-600 hover:text-blue-500">
                Clear all filters
            </button>
        </div>
    </div>
);

// --- Subject Modal for Create/Edit ---
const SubjectModal = ({ isOpen, onClose, onSave, subjectToEdit, classes }) => {
    const initialState = { subjectName: "", subjectCode: "", class: "", totalMarks: 100 };
    const [formData, setFormData] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (subjectToEdit) {
            setFormData({
                subjectName: subjectToEdit.subjectName,
                subjectCode: subjectToEdit.subjectCode,
                class: subjectToEdit.class?._id || "",
                totalMarks: subjectToEdit.totalMarks,
            });
        } else {
            setFormData(initialState);
        }
    }, [subjectToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (subjectToEdit) {
                await Axios.patch(`/subject/${subjectToEdit._id}`, formData);
                toast.success("Subject updated successfully!");
            } else {
                await Axios.post("/subject", formData);
                toast.success("Subject created successfully!");
            }
            onSave(); // Refresh the list
            onClose(); // Close the modal
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-800 mb-4">{subjectToEdit ? "Edit Subject" : "Create New Subject"}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Form fields here */}
                    <input type="text" name="subjectName" value={formData.subjectName} onChange={handleChange} placeholder="Subject Name" required className="w-full p-2 border border-slate-300 rounded-md" />
                    <input type="text" name="subjectCode" value={formData.subjectCode} onChange={handleChange} placeholder="Subject Code (e.g., ENG101)" required className="w-full p-2 border border-slate-300 rounded-md" />
                    <select name="class" value={formData.class} onChange={handleChange} required className="w-full p-2 border border-slate-300 rounded-md">
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                    </select>
                    <input type="number" name="totalMarks" value={formData.totalMarks} onChange={handleChange} placeholder="Total Marks" required className="w-full p-2 border border-slate-300 rounded-md" />
                    
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-400">
                            {isSubmitting ? "Saving..." : "Save Subject"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Component ---
function AllSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for Modals and actions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  // State for interactive features
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: 'subjectName', direction: 'ascending' });

  const getSubjects = async () => {
    try {
      const { data } = await Axios.get("/subject");
      setSubjects(data);
    } catch (error) { console.error(error.response); }
  };

  const getClasses = async () => {
      try {
          const { data } = await Axios.get("/class");
          setClasses(data);
      } catch (error) { console.error(error.response); }
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([getSubjects(), getClasses()]).finally(() => setLoading(false));
  }, []);

  const handleOpenModal = (subject = null) => {
      setSubjectToEdit(subject);
      setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
      setIsModalOpen(false);
      setSubjectToEdit(null);
  };
  
  const handleDelete = async () => {
      if (!subjectToDelete) return;
      try {
          await Axios.delete(`/subject/${subjectToDelete._id}`);
          toast.success("Subject deleted successfully!");
          setSubjects(subjects.filter(s => s._id !== subjectToDelete._id)); // Optimistic UI update
      } catch (error) {
          toast.error("Failed to delete subject.");
      } finally {
          setSubjectToDelete(null); // Close confirmation dialog
      }
  };
  
  const processedSubjects = useMemo(() => {
    return subjects
      .filter(s => classFilter === 'all' || s.class?._id === classFilter)
      .filter(s => 
        s.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
          const aVal = a[sortConfig.key] || '';
          const bVal = b[sortConfig.key] || '';
          if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
      });
  }, [subjects, classFilter, searchTerm, sortConfig]);

  const requestSort = (key) => {
      let direction = 'ascending';
      if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
      }
      setSortConfig({ key, direction });
  };
  const getSortIcon = (key) => (sortConfig.key === key ? (sortConfig.direction === 'ascending' ? faSortUp : faSortDown) : faSort);
  const clearFilters = () => { setSearchTerm(""); setClassFilter("all"); };

  return (
    <>
      <SubjectModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={getSubjects} subjectToEdit={subjectToEdit} classes={classes} />
      {/* Delete Confirmation Dialog */}
      {subjectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold">Confirm Deletion</h2>
                <p className="my-4 text-slate-600">Are you sure you want to delete the subject "{subjectToDelete.subjectName}"? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setSubjectToDelete(null)} className="px-4 py-2 bg-slate-200 rounded-md">Cancel</button>
                    <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">Delete</button>
                </div>
            </div>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Manage Subjects</h1>
              <p className="mt-1 text-sm text-slate-500">Add, edit, and organize subjects for all classes.</p>
            </div>
            <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold text-sm shadow-sm hover:bg-blue-700">
              <FontAwesomeIcon icon={faAdd} /> Add Subject
            </button>
          </div>
          
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-200 bg-slate-50/75">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search by name or code..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"/>
            </div>
            <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="w-full border border-slate-300 rounded-lg">
                <option value="all">Filter by Class (All)</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            {loading ? <TableSkeleton /> : processedSubjects.length > 0 ? (
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                          {['subjectName', 'subjectCode', 'class.className', 'totalMarks'].map(key => (
                              <th key={key} className="p-4 font-semibold text-slate-600 cursor-pointer" onClick={() => requestSort(key)}>
                                  {key.split('.').pop().replace(/([A-Z])/g, ' $1').toUpperCase()} <FontAwesomeIcon icon={getSortIcon(key)} className="ml-1 opacity-60" />
                              </th>
                          ))}
                          <th className="p-4 font-semibold text-slate-600 text-center">ACTIONS</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {processedSubjects.map((subject) => (
                          <tr key={subject._id} className="hover:bg-slate-50">
                              <td className="p-4 text-slate-800 font-medium">{subject.subjectName}</td>
                              <td className="p-4 text-slate-600">{subject.subjectCode}</td>
                              <td className="p-4 text-slate-600">{subject.class?.className || 'N/A'}</td>
                              <td className="p-4 text-slate-600">{subject.totalMarks}</td>
                              <td className="p-4 text-center space-x-2">
                                  <button onClick={() => handleOpenModal(subject)} className="text-slate-500 hover:text-blue-600 p-2"><FontAwesomeIcon icon={faEdit} /></button>
                                  <button onClick={() => setSubjectToDelete(subject)} className="text-slate-500 hover:text-red-600 p-2"><FontAwesomeIcon icon={faTrash} /></button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
                </table>
            ) : <EmptyState onClearFilters={clearFilters} /> }
          </div>
        </div>
      </div>
    </>
  );
}

export default AllSubjects;