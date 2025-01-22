// src/components/AdmissionManagement.jsx
import React, { useState } from 'react';
import CreateAdmission from './CreateAdmission';
import AdmissionList from './AdmissionList';

const AdmissionManagement = () => {
  const [selectedAdmission, setSelectedAdmission] = useState(null);

  const handleSelectAdmission = (admission) => {
    setSelectedAdmission(admission);
  };

  const clearSelectedAdmission = () => {
    setSelectedAdmission(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl mb-6">Admission Management</h1>
        <CreateAdmission
          selectedAdmission={selectedAdmission}
          clearSelectedAdmission={clearSelectedAdmission}
        />
        <AdmissionList onSelectAdmission={handleSelectAdmission} />
      </div>
    </div>
  );
};

export default AdmissionManagement;