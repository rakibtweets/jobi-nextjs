'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import CandidateProfileSlider from './candidate-profile-slider';
import Skills from './skills';
import WorkExperience from './work-experience';
import CandidateBio from './bio';
import { IResumeType } from '@/database/resume.model';
import Resume from '@/app/components/resume/Resume';
import ResumeModal from '../resume/ResumeModal';
import dynamic from 'next/dynamic';
import { Button, Card } from 'react-bootstrap';
import ModalVideo from 'react-modal-video';

interface ICandidateDetailsAreaProps {
  candidateDetials: IResumeType;
}

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <p>Loading...</p>
  }
);

const CandidateDetailsArea = ({
  candidateDetials
}: ICandidateDetailsAreaProps) => {
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false);
  const { overview, user, education, experience, skills, videos, portfolio } =
    candidateDetials;
  const [videoId, setVideoId] = useState<string | undefined>(
    videos?.[0]?.videoId ?? ''
  );

  const handleVideoClick = (videoId: string, thumbnail: string) => {
    setVideoId(videoId);
  };

  return (
    <>
      <section className="candidates-profile pt-100 lg-pt-70 pb-150 lg-pb-80">
        <div className="container">
          <div className="row">
            <div className="col-xxl-9 col-lg-8">
              <div className="candidates-profile-details me-xxl-5 pe-xxl-4">
                <div className="inner-card border-style mb-65 lg-mb-40">
                  <h3 className="title">Overview</h3>
                  <p>{candidateDetials?.overview}</p>
                </div>
                {/* Video thumbnail start */}
                {/* <h3 className="title">Intro</h3> */}
                {/* <div
                  className="video-post d-flex align-items-center justify-content-center mt-25 lg-mt-20 mb-50 lg-mb-20"
                  style={{ backgroundImage: `url(${videoThumanail})` }}
                >
                  <button
                    onClick={() => setIsVideoOpen(true)}
                    className="fancybox rounded-circle video-icon tran3s text-center cursor-pointer"
                  >
                    <i className="bi bi-play"></i>
                  </button>
                </div> */}
                <h3 className="title">Videos </h3>
                <div className="mb-4 p-4">
                  <div className="container">
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 gap-3 ">
                      {candidateDetials?.videos?.map((video, index) => {
                        return (
                          <Card className="col p-1" key={index}>
                            <Card.Img
                              variant="top"
                              className="p-2"
                              src={`https://img.youtube.com/vi/${video?.videoId}/0.jpg`}
                            />
                            <Card.Body>
                              <Card.Title className="fw-bold">
                                {video?.title}
                              </Card.Title>
                              <Button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleVideoClick(
                                    video.videoId ?? '',
                                    video.videoId ?? ''
                                  );
                                  setIsVideoOpen(true);
                                }}
                                className="px-3"
                                variant="primary"
                              >
                                Watch
                              </Button>
                            </Card.Body>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {/* Video thumbnail end */}
                <div className="inner-card border-style mb-75 lg-mb-50">
                  <h3 className="title">Education</h3>
                  {candidateDetials?.education?.length > 0 &&
                    candidateDetials?.education?.map((item, index) => {
                      return (
                        <div
                          key={item.title + index}
                          className="time-line-data position-relative pt-15"
                        >
                          <div className="info position-relative">
                            <div className="numb fw-500 rounded-circle d-flex align-items-center justify-content-center">
                              1
                            </div>
                            <div className="text_1 fw-500">{item.academy}</div>
                            <h4>{item.title}</h4>
                            <p>{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="inner-card border-style mb-75 lg-mb-50">
                  <h3 className="title">Skills</h3>
                  {/* skill area */}

                  <Skills skills={candidateDetials?.skills} />

                  {/* skill area */}
                </div>
                <div className="inner-card border-style mb-60 lg-mb-50">
                  <h3 className="title">Work Experience</h3>
                  {/* WorkExperience */}
                  {candidateDetials.experience?.length > 0 &&
                    candidateDetials.experience?.map((item, index) => (
                      <WorkExperience
                        key={item.title + index}
                        experience={item}
                      />
                    ))}

                  {/* WorkExperience */}
                </div>
                <h3 className="title">Portfolio</h3>
                {/* Candidate Profile Slider */}
                <CandidateProfileSlider portfolios={portfolio} />
                {/* Candidate Profile Slider */}
              </div>
            </div>
            <div className="col-xxl-3 col-lg-4">
              <div className="cadidate-profile-sidebar ms-xl-5 ms-xxl-0 md-mt-60">
                <div className="cadidate-bio bg-wrapper bg-color mb-60 md-mb-40">
                  <div className="pt-25">
                    <div className="cadidate-avatar m-auto">
                      <Image
                        //@ts-ignore
                        src={candidateDetials?.user?.picture as string}
                        alt="avatar"
                        width={80}
                        height={80}
                        className="lazy-img rounded-circle w-100"
                      />
                    </div>
                  </div>
                  <h3 className="cadidate-name text-center">
                    {typeof candidateDetials?.user === 'object'
                      ? //@ts-ignore
                        candidateDetials?.user?.name
                      : ''}
                  </h3>
                  <div className="text-center pb-25">
                    <a href="#" className="invite-btn fw-500">
                      Invite
                    </a>
                  </div>
                  {/* CandidateBio */}

                  <CandidateBio
                    //@ts-ignore
                    user={user}
                  />
                  {/* CandidateBio */}
                  <button
                    type="button"
                    data-bs-toggle="modal"
                    data-bs-target="#resumeModal"
                    rel="noopener noreferrer"
                    className="btn-ten fw-500 text-white w-100 text-center tran3s mt-15"
                  >
                    View Resume
                  </button>
                  <div>
                    <PDFDownloadLink
                      className="btn-ten fw-500 text-white w-100 text-center tran3s mt-15"
                      target="_blank"
                      rel="noopener noreferrer"
                      document={
                        <Resume
                          overview={overview}
                          user={user}
                          education={education}
                          experience={experience}
                          skills={skills}
                        />
                      }
                      // @ts-ignore
                      fileName={`${user?.name as string}.pdf`}
                    >
                      {({ blob, url, loading, error }) =>
                        loading ? 'Loading...' : 'Download Resume'
                      }
                    </PDFDownloadLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* video modal start */}
      {/* <VideoPopup
        isVideoOpen={isVideoOpen}
        setIsVideoOpen={setIsVideoOpen}
        videoId={videoId as string}
      /> */}
      <ModalVideo
        channel="youtube"
        isOpen={isVideoOpen}
        videoId={videoId as string}
        onClose={() => setIsVideoOpen(false)}
      />
      {/* video modal end */}
      {/* Resume Modal start */}
      <ResumeModal>
        <Resume
          overview={overview}
          user={user}
          education={education}
          experience={experience}
          skills={skills}
        />
      </ResumeModal>
      {/* Resume Modal end */}
    </>
  );
};

export default CandidateDetailsArea;
