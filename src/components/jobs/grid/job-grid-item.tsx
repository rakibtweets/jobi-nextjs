'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
// import { IJobType } from '@/types/job-data-type';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { add_to_wishlist } from '@/redux/features/wishlist';
import { IJobData } from '@/database/job.model';

const JobGridItem = ({
  item,
  style_2 = true
}: {
  item: IJobData;
  style_2?: boolean;
}) => {
  const { id, duration, location, maxSalary, salary_duration, title } =
    item || {};
  const { wishlist } = useAppSelector((state) => state.wishlist);
  const isActive = wishlist.some((p) => p.id === id);
  const dispatch = useAppDispatch();
  // handle add wishlist
  const handleAddWishlist = (item: IJobData) => {
    dispatch(add_to_wishlist(item));
  };
  return (
    <div
      className={`job-list-two ${style_2 ? 'style-two' : ''} position-relative`}
    >
      <Link href={`/job-details-v1/${id}`} className="logo">
        <Image
          src={
            //@ts-ignore
            (item?.createdBy?.picture as string) ||
            '/assets/images/logo/media_22.png'
          }
          alt="logo"
          height={60}
          width={60}
          style={{ height: 'auto', width: 'auto' }}
          className="lazy-img m-auto"
        />
      </Link>
      <a
        onClick={() => handleAddWishlist(item)}
        className={`save-btn text-center rounded-circle tran3s cursor-pointer ${isActive ? 'active' : ''}`}
        title={`${isActive ? 'Remove Job' : 'Save Job'}`}
      >
        <i className="bi bi-bookmark-dash"></i>
      </a>
      <div>
        <Link
          href={`/job-details-v1/${id}`}
          className={`job-duration text-decoration-none fw-500 ${duration === 'Part time' ? 'part-time' : ''}`}
        >
          {duration}
        </Link>
      </div>
      <div>
        <Link
          href={`/job-details-v1/${id}`}
          className="title text-decoration-none fw-500 tran3s"
        >
          {title}
        </Link>
      </div>
      <div className="job-salary">
        <span className="fw-500 text-dark">${maxSalary}</span> /{' '}
        {salary_duration}
      </div>
      <div className="d-flex align-items-center justify-content-between mt-auto">
        <div className="job-location">
          <Link className="text-decoration-none" href={`/job-details-v1/${id}`}>
            {location}
          </Link>
        </div>
        <Link
          href={`/job-details-v1/${id}`}
          className="apply-btn text-decoration-none text-center tran3s"
        >
          APPLY
        </Link>
      </div>
    </div>
  );
};

export default JobGridItem;
