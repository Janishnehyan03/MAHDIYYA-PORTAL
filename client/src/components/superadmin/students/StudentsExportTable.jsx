import React from "react";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

function StudentsExportTable({ sortedStudents, formatDate, tableRef }) {
  if (!sortedStudents.length) return null;

  return (
    <>
      <table id="students-table-export" ref={tableRef} className="hidden">
        <thead>
          <tr>
            <th>REG. NO</th>
            <th>NAME</th>
            <th>FATHER</th>
            <th>HOUSE</th>
            <th>PLACE</th>
            <th>PO</th>
            <th>PINCODE</th>
            <th>DISTRICT</th>
            <th>STATE</th>
            <th>PHONE</th>
            <th>DOB</th>
            <th>CLASS</th>
            <th>STUDY CENTRE</th>
            <th>CENTRE CODE</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((student) => (
            <tr key={student._id}>
              <td>{student.registerNo}</td>
              <td>{student.studentName}</td>
              <td>{student.fatherName}</td>
              <td>{student.houseName}</td>
              <td>{student.place}</td>
              <td>{student.postOffice}</td>
              <td>{student.pinCode}</td>
              <td>{student.district}</td>
              <td>{student.state}</td>
              <td>{student.phone}</td>
              <td>
                {formatDate(
                  student.dobDate,
                  student.dobMonth,
                  student.dobYear
                )}
              </td>
              <td>{student.class?.className}</td>
              <td>{student?.branch?.studyCentreName}</td>
              <td>{student?.branch?.studyCentreCode}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Hidden Excel Export Button for Modal and Toolbar */}
      <ReactHTMLTableToExcel
        id="export-table-hidden"
        className="hidden"
        table="students-table-export"
        filename="students_export"
        sheet="students"
        buttonText="Export to Excel"
      />
    </>
  );
}

export default StudentsExportTable;