import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Axios from '../../../Axios';

const CreateOrUpdatePreviousExam = ({ selectedExam, clearSelectedExam }) => {
    const [form, setForm] = useState({
        admission: '',
        className: '',
        fileUrl: ''
    });
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAdmissions = async () => {
            try {
                const response = await Axios.get('/admission');
                setAdmissions(response.data);
            } catch (err) {
                console.error('Error fetching admissions:', err);
            }
        };

        fetchAdmissions();
    }, []);

    useEffect(() => {
        if (selectedExam) {
            setForm({
                admission: selectedExam.admission,
                className: selectedExam.className,
                fileUrl: selectedExam.fileUrl
            });
        } else {
            setForm({
                admission: '',
                className: '',
                fileUrl: ''
            });
        }
    }, [selectedExam]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (selectedExam) {
                await Axios.patch(`/previous-exam/${selectedExam._id}`, form);
                toast.success('Previous Exam updated successfully');
                clearSelectedExam();
            } else {
                await Axios.post('/previous-exam', form);
                toast.success('Previous Exam created successfully');
            }
            window.location.reload(); // Reload the window after successful create or update
        } catch (err) {
            toast.error('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 text-white">
            <h1 className="text-2xl mb-4">{selectedExam ? 'Edit Previous Exam' : 'Create Previous Exam'}</h1>
            {loading ? (
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.964 7.964 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Admission ID</label>
                        <select
                            name="admission"
                            value={form.admission}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-800 text-white rounded"
                        >
                            <option value="">Select Admission</option>
                            {admissions.map((admission) => (
                                <option key={admission._id} value={admission._id} className='bg-gray-800 text-white'>
                                    {admission.admissionName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Class Name</label>
                        <input
                            type="text"
                            name="className"
                            value={form.className}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-800 text-white rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">File URL</label>
                        <input
                            type="text"
                            name="fileUrl"
                            value={form.fileUrl}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-800 text-white rounded"
                        />
                    </div>
                    <button type="submit" className="bg-blue-500 p-2 rounded">
                        {selectedExam ? 'Update Previous Exam' : 'Create Previous Exam'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default CreateOrUpdatePreviousExam;