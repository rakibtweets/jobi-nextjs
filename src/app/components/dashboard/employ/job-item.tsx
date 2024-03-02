import React from 'react';
import JobActionDropdown from './JobActionDropdown';

interface IEmployJobItemProps {
  title: string;
  info: string;
  date: string;
  application: string;
  status: string;
  jobId?: string | undefined;
}

const EmployJobItem = ({
  title,
  info,
  date,
  application,
  status,
  jobId
}: IEmployJobItemProps) => {
  return (
    <tr className={status}>
      <td>
        <div className="job-name fw-500">{title}</div>
        <div className="info1">{info}</div>
      </td>
      <td>{date}</td>
      <td>{application} Applications</td>
      <td>
        <div className="job-status text-capitalize">{status}</div>
      </td>
      <td>
        <div className="action-dots float-end">
          <button
            className="action-btn dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span></span>
          </button>
          {/* action dropdown start */}
          <JobActionDropdown jobId={jobId} />
          {/* action dropdown end */}
        </div>
      </td>
    </tr>
  );
};

export default EmployJobItem;
