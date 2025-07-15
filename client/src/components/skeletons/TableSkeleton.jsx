import React from "react";

const SkeletonRow = ({ cols }) => (
  <tr className="bg-white border-b border-slate-200">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
      </td>
    ))}
  </tr>
);

const TableSkeleton = ({ rows = 10, cols = 5 }) => {
  return (
    <table className="w-full text-sm text-left">
      <thead className="bg-slate-100">
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} scope="col" className="px-6 py-3">
              <div className="h-4 bg-slate-300 rounded animate-pulse w-3/4"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  );
};

export default TableSkeleton;
