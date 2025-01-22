// src/components/CreateAdmission.jsx
import React, { useState, useEffect } from 'react';
import Axios from '../../../Axios';
import { toast } from 'react-toastify';

const CreateAdmission = ({ selectedAdmission, clearSelectedAdmission }) => {
  const [form, setForm] = useState({
    admissionName: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  useEffect(() => {
    if (selectedAdmission) {
      setForm({
        admissionName: selectedAdmission.admissionName,
        startDate: selectedAdmission.startDate,
        endDate: selectedAdmission.endDate,
        status: selectedAdmission.status
      });
    } else {
      setForm({
        admissionName: '',
        startDate: '',
        endDate: '',
        status: ''
      });
    }
  }, [selectedAdmission]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAdmission) {
        await Axios.patch(`/admission/${selectedAdmission._id}`, form);
        toast.success('Admission updated successfully');
        clearSelectedAdmission();
      } else {
        await Axios.post('/admission', form);
        toast.success('Admission created successfully');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h1 className="text-2xl mb-4">{selectedAdmission ? 'Edit Admission' : 'Create Admission'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">
            Admission Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="admissionName"
            value={form.admissionName}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 text-white rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">
            Start Date 
          </label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 text-white rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">
            End Date 
          </label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 text-white rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">
            Status 
          </label>
          <input
            type="text"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 text-white rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 p-2 rounded">
          {selectedAdmission ? 'Update Admission' : 'Create Admission'}
        </button>
      </form>
    </div>
  );
};

export default CreateAdmission;