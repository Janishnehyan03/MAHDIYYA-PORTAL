// src/components/CreateOrUpdatePreviousExam.jsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Axios from '../../../Axios';

const CreateOrUpdatePreviousExam = ({ selectedExam, clearSelectedExam, onSuccess }) => {
    const [form, setForm] = useState({
        admission: '',
        className: '',
        fileUrl: ''
    });
    const [admissions, setAdmissions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch admissions once on component mount
    useEffect(() => {
        const fetchAdmissions = async () => {
            try {
                const response = await Axios.get('/admission');
                setAdmissions(response.data);
            } catch (err) {
                console.error('Error fetching admissions:', err);
                toast.error('Could not load admissions.');
            }
        };
        fetchAdmissions();
    }, []);

    // Effect to populate form when an exam is selected for editing
    useEffect(() => {
        if (selectedExam) {
            setForm({
                admission: selectedExam.admission._id || selectedExam.admission, // Handle populated vs. non-populated ID
                className: selectedExam.className,
                fileUrl: selectedExam.fileUrl
            });
        } else {
            // Reset form when selection is cleared
            setForm({ admission: '', className: '', fileUrl: '' });
        }
    }, [selectedExam]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.admission || !form.className || !form.fileUrl) {
            toast.warn("Please fill out all fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (selectedExam) {
                await Axios.patch(`/previous-exam/${selectedExam._id}`, form);
                toast.success('Previous Exam updated successfully');
            } else {
                await Axios.post('/previous-exam', form);
                toast.success('Previous Exam created successfully');
            }
            clearSelectedExam(); // Clear the form and selection
            onSuccess(); // Trigger data refresh in the parent component
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An unexpected error occurred.';
            toast.error(errorMessage);
            console.error('Submission Error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
                {selectedExam ? 'Edit Previous Exam' : 'Create New Previous Exam'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="admission" className="block text-sm font-medium text-gray-700">Admission</label>
                    <select
                        id="admission"
                        name="admission"
                        value={form.admission}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="">Select Admission</option>
                        {admissions.map((admission) => (
                            <option key={admission._id} value={admission._id}>
                                {admission.admissionName}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="className" className="block text-sm font-medium text-gray-700">Class Name</label>
                    <input
                        type="text"
                        id="className"
                        name="className"
                        value={form.className}
                        onChange={handleChange}
                        placeholder="e.g., Class 10"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700">Question Paper URL</label>
                    <input
                        type="text"
                        id="fileUrl"
                        name="fileUrl"
                        value={form.fileUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/paper.pdf"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div className="flex items-center space-x-4 pt-2">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : (selectedExam ? 'Update Exam' : 'Create Exam')}
                    </button>
                    {selectedExam && (
                        <button
                            type="button"
                            onClick={clearSelectedExam}
                            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CreateOrUpdatePreviousExam;