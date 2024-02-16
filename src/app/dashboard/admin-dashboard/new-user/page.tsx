'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import search from '@/assets/dashboard/images/icon/icon_16.svg';
import { useForm, FormProvider } from 'react-hook-form';
import { createUserByAdmin } from '@/lib/actions/user.action';
import * as z from 'zod';
import { notifyError, notifySuccess } from '@/utils/toast';
import StateSelect from '@/app/components/dashboard/candidate/state-select';
import CountrySelect from '@/app/components/dashboard/candidate/country-select';
import CitySelect from '@/app/components/dashboard/candidate/city-select';
import QualicationSelect from '@/app/components/dashboard/candidate/QualicationSelect';
import ErrorMsg from '@/app/components/common/error-msg';
import { userSchema } from '@/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';

const NewUser = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filename, setFilename] = useState('');
  const [gender, setGender] = useState('male');
  const [role, setRole] = useState('candidate');
  const [imagePreview, setImagePreview] = useState<string | undefined>();

  type userSchemaType = z.infer<typeof userSchema>;

  const methods = useForm<userSchemaType>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      username: '',
      phone: '',
      qualification: '',
      bio: '',
      mediaLinks: {
        linkedin: '',
        github: ''
      },
      address: '',
      country: '',
      city: '',
      zip: '',
      state: '',
      mapLocation: '',
      location: ''
    }
  });

  const {
    register,
    reset,
    setValue,
    handleSubmit,
    formState: { errors }
  } = methods;

  // handle file pdf upload
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const pdfFile = new FileReader();
    const selectedFile = event.target.files?.[0] || null;

    const fileName = selectedFile?.name || '';
    setFilename(fileName);
    if (event.target.name === 'file') {
      pdfFile.onload = () => {
        if (pdfFile.readyState === 2) {
          setValue('picture', pdfFile.result as string);
        }
      };

      pdfFile.onloadend = () => {
        setImagePreview(pdfFile.result as string | undefined);
      };
    }
    pdfFile.readAsDataURL(event.target.files?.[0] as File);
  };

  const handleGenderChange = (event: any) => {
    setGender(event.target.value);
  };
  const handleRoleChange = (event: any) => {
    setRole(event.target.value);
  };

  const onSubmit = async (value: userSchemaType) => {
    setIsSubmitting(true);
    console.log(value);
    try {
      await createUserByAdmin({
        name: value?.name,
        email: value.email,
        username: value.username,
        role: value.role,
        bio: value.bio,
        phone: value.phone,
        age: value.age,
        picture: value.picture,
        gender: value.gender,
        qualification: value.qualification,
        minSalary: value.minSalary,
        maxSalary: value.maxSalary,
        mediaLinks: {
          linkedin: value.mediaLinks?.linkedin,
          github: value.mediaLinks?.github
        },
        address: value.address,
        country: value.country,
        city: value.city,
        zip: value.zip,
        state: value.state,
        mapLocation: value.mapLocation,
        location: value.location
      });
      notifySuccess('User Created Successfully');
    } catch (error: any) {
      notifyError(error as string);
    } finally {
      setIsSubmitting(false);
      reset();
    }
  };

  return (
    <>
      <h2 className="main-title">Create User</h2>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white card-box border-20">
            <div className="user-avatar-setting d-flex align-items-center mb-30">
              {imagePreview && (
                <Image
                  src={imagePreview}
                  alt="avatar"
                  height={80}
                  width={80}
                  className="lazy-img user-img"
                />
              )}

              <div className="upload-btn position-relative tran3s ms-4 me-3">
                <small>{filename || ' Upload new photo'}</small>

                <input
                  type="file"
                  id="uploadImg"
                  name="file"
                  accept="image/*"
                  placeholder="Upload new photo"
                  onChange={(e) => handleFileChange(e)}
                />
              </div>
              <button className="delete-btn tran3s">Delete</button>
            </div>
            <div className="dash-input-wrapper mb-30">
              <label htmlFor="">Full Name*</label>
              <input
                type="text"
                placeholder="You name"
                {...register('name')}
                name="name"
              />
              <ErrorMsg msg={errors?.name?.message as string} />
            </div>
            <div className="dash-input-wrapper mb-30">
              <label htmlFor="">username</label>
              <input
                type="text"
                placeholder="username"
                {...register('username')}
                name="username"
              />
              <ErrorMsg msg={errors?.username?.message as string} />
            </div>
            <div className="dash-input-wrapper mb-30">
              <label htmlFor="">Email*</label>
              <input
                type="email"
                placeholder="Your email address"
                {...register('email', { required: true })}
                name="email"
              />
              <ErrorMsg msg={errors?.email?.message as string} />
            </div>
            <div className="dash-input-wrapper mb-30">
              <label htmlFor="">Phone</label>
              <input
                type="text"
                placeholder="017xxxxxxxxx"
                {...register('phone')}
                name="phone"
              />
              {errors?.phone && (
                <ErrorMsg msg={errors?.phone?.message as string} />
              )}
            </div>
            {/* age start */}
            <div className="dash-input-wrapper mb-30">
              <label htmlFor="">age</label>
              <input
                type="number"
                placeholder="your age"
                {...register('age', { valueAsNumber: true })}
                name="age"
              />
              <ErrorMsg msg={errors?.age?.message as string} />
            </div>
            {/* age end */}

            {/* Gender Start */}
            <div className="mb-30">
              <label className="mb-20 ">Gender</label>
              <div>
                <div>
                  <input
                    {...register('gender', { required: true })}
                    type="radio"
                    id="male"
                    value="male"
                    className="me-2"
                    checked={gender === 'male'}
                    onChange={handleGenderChange}
                  />
                  <label htmlFor="male">Male</label>
                </div>

                <div>
                  <input
                    {...register('gender', { required: true })}
                    type="radio"
                    id="female"
                    className="me-2"
                    value="female"
                    checked={gender === 'female'}
                    onChange={handleGenderChange}
                  />
                  <label htmlFor="female">Female</label>
                </div>
              </div>
              {errors?.gender && (
                <ErrorMsg msg={errors?.gender?.message as string} />
              )}
            </div>
            {/* Gender end */}
            {/* Qualification Start */}
            <div className="dash-input-wrapper mb-25">
              <label htmlFor="">Qualification*</label>
              <QualicationSelect setValue={setValue} />
            </div>
            {/* Qualification End */}

            {/* Salary start */}
            <div className="d-flex align-items-center mb-3 mt-30">
              <label htmlFor="salaryStart" className="form-label me-4">
                Salary Range *
              </label>
              <div className="d-flex dash-input-wrapper gap-3">
                <input
                  type="number"
                  placeholder="min salary"
                  {...register('minSalary', {
                    valueAsNumber: true
                  })}
                  name="minSalary"
                />
                {errors?.minSalary && (
                  <ErrorMsg msg={errors?.minSalary?.message as string} />
                )}
                <input
                  type="number"
                  placeholder="max salary"
                  {...register('maxSalary', {
                    valueAsNumber: true
                  })}
                  name="maxSalary"
                />
                {errors?.maxSalary?.message && (
                  <ErrorMsg msg={errors?.maxSalary?.message as string} />
                )}
              </div>
            </div>
            {/* Salary end */}
            <div className="dash-input-wrapper">
              <label htmlFor="">Bio*</label>
              <textarea
                className="size-lg"
                placeholder="Write something interesting about you...."
                {...register('bio')}
                name="bio"
              ></textarea>
              <div className="alert-text">
                Brief description for your profile. URLs are hyperlinked.
              </div>
              <ErrorMsg msg={errors.bio?.message as string} />
            </div>
          </div>

          <div className="bg-white card-box border-20 mt-40">
            <h4 className="dash-title-three">Social Media</h4>

            <div className="dash-input-wrapper mb-20">
              <label htmlFor="">LinkedIn</label>
              <input
                type="text"
                placeholder="Ex. linkedin.com/in/jamesbrower"
                {...register('mediaLinks.linkedin')}
              />
              <ErrorMsg msg={errors.mediaLinks?.message as string} />
            </div>

            <div className="dash-input-wrapper mb-20">
              <label htmlFor="">Github</label>
              <input
                type="text"
                placeholder="ex. github.com/jamesbrower"
                {...register('mediaLinks.github')}
              />
              <ErrorMsg msg={errors.mediaLinks?.message as string} />
            </div>
            <a href="#/" className="dash-btn-one">
              <i className="bi bi-plus"></i> Add more link
            </a>
          </div>

          <div className="bg-white card-box border-20 mt-40">
            <h4 className="dash-title-three">Address & Location</h4>
            <div className="row">
              <div className="col-12">
                <div className="dash-input-wrapper mb-25">
                  <label htmlFor="">Address*</label>
                  <input
                    type="text"
                    placeholder="Cowrasta, Chandana, Gazipur Sadar"
                    {...register('address')}
                    name="address"
                  />
                  <ErrorMsg msg={errors?.address?.message as string} />
                </div>
              </div>
              <div className="col-lg-3">
                <div className="dash-input-wrapper mb-25">
                  <label htmlFor="">Country*</label>
                  <CountrySelect setValue={setValue} />
                </div>
              </div>
              <div className="col-lg-3">
                <div className="dash-input-wrapper mb-25">
                  <label htmlFor="">City*</label>
                  <CitySelect setValue={setValue} />
                </div>
              </div>
              <div className="col-lg-3">
                <div className="dash-input-wrapper mb-25">
                  <label htmlFor="">Zip Code*</label>
                  <input
                    type="text"
                    {...register('zip')}
                    placeholder="1708"
                    name="zip"
                  />
                </div>
              </div>
              <div className="col-lg-3">
                <div className="dash-input-wrapper mb-25">
                  <label htmlFor="">State*</label>
                  <StateSelect setValue={setValue} />
                </div>
              </div>
              <div className="col-12">
                <div className="dash-input-wrapper mb-25">
                  <label htmlFor="">Map Location*</label>
                  <div className="position-relative">
                    <input
                      type="text"
                      placeholder="XC23+6XC, Moiran, N105"
                      {...register('mapLocation')}
                      name="mapLocation"
                    />
                    <ErrorMsg msg={errors?.mapLocation?.message as string} />
                    <button className="location-pin tran3s">
                      <Image
                        src={search}
                        alt="icon"
                        className="lazy-img m-auto"
                      />
                    </button>
                  </div>
                  <div className="map-frame mt-30">
                    <div className="gmap_canvas h-100 w-100">
                      <iframe
                        className="gmap_iframe h-100 w-100"
                        src="https://maps.google.com/maps?width=600&amp;height=400&amp;hl=en&amp;q=bass hill plaza medical centre&amp;t=&amp;z=12&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="mb-30">
                  <label className="mb-20 fw-bold">User Role*</label>
                  <div>
                    <div>
                      <input
                        {...register('role', { required: true })}
                        type="radio"
                        id="candidate"
                        value="candidate"
                        className="me-2"
                        checked={role === 'candidate'}
                        onChange={handleRoleChange}
                      />
                      <label htmlFor="Candidate">Candidate</label>
                    </div>

                    <div>
                      <input
                        {...register('role', { required: true })}
                        type="radio"
                        id="employee"
                        className="me-2"
                        value="employee"
                        checked={role === 'employee'}
                        onChange={handleRoleChange}
                      />
                      <label htmlFor="employee">employee</label>
                    </div>
                  </div>
                  {errors?.gender && (
                    <ErrorMsg msg={errors?.gender?.message as string} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="button-group d-inline-flex align-items-center mt-30">
            <button
              disabled={isSubmitting}
              type="submit"
              className="dash-btn-two tran3s me-3 px-4"
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
            <button onClick={() => reset()} className="dash-cancel-btn tran3s">
              Cancel
            </button>
          </div>
        </form>
      </FormProvider>
    </>
  );
};

export default NewUser;
