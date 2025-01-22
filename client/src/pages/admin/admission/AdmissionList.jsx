// src/components/AdmissionList.jsx
import React, { useEffect, useState } from 'react';
import Axios from '../../../Axios';

const AdmissionList = ({ onSelectAdmission }) => {
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAdmissions = async () => {
            try {
                const response = await Axios.get('/admission');
                setAdmissions(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchAdmissions();
    }, []);

    if (loading) {
        return <div className="text-white">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 text-white">
            <h1 className="text-3xl mb-6 font-bold">Admissions</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {admissions.map(admission => (
                    <div
                        key={admission._id}
                        className="p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 cursor-pointer"
                        onClick={() => onSelectAdmission(admission)}
                    >
                        <h2 className="text-2xl font-semibold mb-2">{admission.admissionName}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdmissionList;