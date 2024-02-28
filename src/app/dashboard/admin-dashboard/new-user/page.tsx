'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm, FormProvider } from 'react-hook-form';
import { createUserByAdmin } from '@/lib/actions/user.action';
import * as z from 'zod';
import { notifyError, notifySuccess } from '@/utils/toast';
import CountrySelect from '@/app/components/dashboard/candidate/country-select';
import CitySelect from '@/app/components/dashboard/candidate/city-select';
import ErrorMsg from '@/app/components/common/error-msg';
import { userSchema } from '@/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Country } from 'country-state-city';
import OptionSelect from '@/app/components/common/OptionSelect';
import SalaryDurationSelect from '@/app/components/dashboard/employ/salary-duration-select';

const NewUser = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filename, setFilename] = useState('');
  const [gender, setGender] = useState('male');
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [skillsTag, setSkillsTag] = useState<string[]>([]);
  const [selectedCountryDetails, setSelectedCountryDetails] = useState(
    {} as any
  );

  type userSchemaType = z.infer<typeof userSchema>;

  const methods = useForm<userSchemaType>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      age: '',
      phone: '',
      post: '',
      skills: [],
      salary_duration: '',
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
      location: ''
    }
  });

  const {
    register,
    reset,
    setValue,
    setError,
    watch,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = methods;

  // console.log('new user', watch());
  console.log('errors', errors);
  const selectedCountryName = watch('country');

  useEffect(() => {
    const selectedCountry = Country.getAllCountries().find(
      (country) => country.name === selectedCountryName
    );
    setSelectedCountryDetails(selectedCountry);
  }, [selectedCountryName]);

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

  // add skills
  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: any
  ) => {
    if (e.key === 'Enter' && field === 'skills') {
      e.preventDefault();

      const tagInput = e.target as HTMLInputElement;
      const tagValue = tagInput.value;

      if (tagValue !== '') {
        if (tagValue.length > 15) {
          return setError('skills', {
            type: 'required',
            message: 'Tag must be less than 15 characters.'
          });
        }
        // Retrieve current skills array
        const currentSkills = skillsTag || [];

        if (!skillsTag.includes(tagValue as never)) {
          setValue('skills', [...currentSkills, tagValue]);
          setSkillsTag([...currentSkills, tagValue]);
          tagInput.value = '';
          clearErrors('skills');
        }
      }
    }
  };

  // remove skill
  const handleTagRemove = (tag: string, e: any) => {
    e.preventDefault();
    const newTags = skillsTag.filter((t: string) => t !== tag);
    setSkillsTag(newTags);
    setValue('skills', newTags);
  };

  const onSubmit = async (value: userSchemaType) => {
    setIsSubmitting(true);
    console.log(value);
    try {
      console.count('submit');
      await createUserByAdmin({
        name: value?.name,
        email: value.email,
        post: value.post,
        bio: value.bio,
        role: 'candidate',
        salary_duration: value.salary_duration,
        experience: value.experience,
        phone: value.phone,
        age: value.age,
        picture: value.picture,
        gender: value.gender,
        qualification: value.qualification,
        skills: value.skills,
        minSalary: value.minSalary,
        maxSalary: value.maxSalary,
        mediaLinks: {
          linkedin: value.mediaLinks?.linkedin || '',
          github: value.mediaLinks?.github || ''
        },
        address: value.address || '',
        country: value.country || '',
        city: value.city,
        zip: value.zip || '',
        location: value.location
      });
      notifySuccess('User Created Successfully');
    } catch (error: any) {
      console.log('error', error);
      notifyError(error as string);
    } finally {
      setIsSubmitting(false);
      reset();
      setSkillsTag([]);
      setImagePreview(undefined);
      setFilename('');
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
              <label htmlFor="">post*</label>
              <input
                type="text"
                placeholder="Designation"
                {...register('post', { required: true })}
                name="post"
              />
              <ErrorMsg msg={errors?.post?.message as string} />
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
                type="text"
                placeholder="your age"
                {...register('age')}
                name="age"
              />
              {errors.age && <ErrorMsg msg={errors?.age?.message as string} />}
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
              <OptionSelect
                register={register}
                name="qualification"
                options={[
                  { value: `master's degree`, label: `Master's Degree` },
                  { value: `bachelor degree`, label: `Bachelor Degree` },
                  { value: `Higher Secondary`, label: `Higher Secondary` },
                  { value: `Secondary School`, label: `Secondary School` }
                ]}
              />

              {errors?.qualification && (
                <ErrorMsg msg={errors?.qualification?.message as string} />
              )}
            </div>
            {/* Qualification End */}

            {/* Skills start */}
            <div className="dash-input-wrapper mb-30">
              <label htmlFor="">Skills*</label>
              <div className="skills-wrapper">
                <div className="dash-input-wrapper mb-30">
                  <input
                    type="text"
                    placeholder="Add skills..."
                    onKeyDown={(e) => handleInputKeyDown(e, 'skills')}
                  />
                  <ErrorMsg msg={errors.skills?.message} />
                </div>
                <ul className="style-none d-flex flex-wrap align-items-center">
                  {skillsTag.map((item: any, index) => {
                    return (
                      <li className="is_tag" key={index}>
                        <button>
                          {item}{' '}
                          <i
                            className="bi bi-x"
                            onClick={(e) => handleTagRemove(item, e)}
                          ></i>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Skills end */}

            {/* Experience start */}

            <div className="dash-input-wrapper mb-30">
              <label htmlFor="">Experience*</label>
              <OptionSelect
                register={register}
                name="experience"
                options={[
                  { value: 'Intermediate', label: 'Intermediate' },
                  { value: 'No-Experience', label: 'No-Experience' },
                  { value: 'Expert', label: 'Expert' }
                ]}
              />

              {errors?.experience && (
                <ErrorMsg msg={errors?.experience?.message as string} />
              )}
            </div>

            {/* Experience end */}

            {/* Salary start */}
            <div className="row">
              <div className="col-md-6">
                <div className="dash-input-wrapper">
                  <label htmlFor="">Salary*</label>
                  <SalaryDurationSelect register={register} />
                  {errors?.salary_duration && (
                    <ErrorMsg msg={errors?.salary_duration.message} />
                  )}
                </div>
              </div>
              <div className="col-md-3">
                <div className="dash-input-wrapper">
                  <input
                    type="text"
                    placeholder="Min Salary"
                    {...register('minSalary')}
                    name="minSalary"
                  />
                  {errors?.minSalary && (
                    <ErrorMsg msg={errors?.minSalary.message} />
                  )}
                </div>
              </div>
              <div className="col-md-3">
                <div className="dash-input-wrapper">
                  <input
                    type="text"
                    placeholder="Max salary"
                    {...register('maxSalary')}
                    name="maxSalary"
                  />
                  {errors?.maxSalary && (
                    <ErrorMsg msg={errors?.maxSalary.message} />
                  )}
                </div>
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
                  <CountrySelect register={register} />
                </div>
              </div>
              <div className="col-lg-3">
                <div className="dash-input-wrapper mb-25">
                  <label htmlFor="">City*</label>
                  <CitySelect
                    register={register}
                    countryCode={selectedCountryDetails?.isoCode || ''}
                  />
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
