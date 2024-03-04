import React from 'react';
import EmployShortSelect from './short-select';
import { IUser } from '@/database/user.model';
import CandidateListItem from '../../candidate/candidate-list-item';

interface ISavedCandidateArea {
  candidates: IUser[];
  loggedInUser?: IUser;
}

const SavedCandidateArea = async ({
  candidates,
  loggedInUser
}: ISavedCandidateArea) => {
  return (
    <div className="candidates-profile position-relative">
      <div className="d-flex align-items-center justify-content-between mb-40 lg-mb-30">
        <h2 className="main-title m0">Saved Candidate</h2>
        <div className="short-filter d-flex align-items-center">
          <div className="text-dark fw-500 me-2">Short by:</div>
          <EmployShortSelect />
        </div>
      </div>

      <div className="accordion-box list-style show">
        {candidates.map((item: IUser) => (
          <CandidateListItem
            loggedInUser={loggedInUser}
            key={item._id}
            item={item}
          />
        ))}
      </div>

      <div className="dash-pagination d-flex justify-content-end mt-30">
        <ul className="style-none d-flex align-items-center">
          <li>
            <a href="#" className="active">
              1
            </a>
          </li>
          <li>
            <a href="#">2</a>
          </li>
          <li>
            <a href="#">3</a>
          </li>
          <li>..</li>
          <li>
            <a href="#">7</a>
          </li>
          <li>
            <a href="#">
              <i className="bi bi-chevron-right"></i>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SavedCandidateArea;
