'use client';
import ErrorMsg from '@/components/common/error-msg';
import { ICategory } from '@/database/category.model';
import avatarPerson from '@/assets/images/avatar-person.svg';
import {
  createCategory,
  deleteSingleSubcategory,
  updateCategoryById
} from '@/lib/actions/admin.action';
import { notifyError, notifySuccess } from '@/utils/toast';
import { categorySchema } from '@/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

interface IProps {
  type: string;
  category?: ICategory | null;
}

const CategoryForm = ({ type, category }: IProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filename, setFilename] = useState('');
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const pathname = usePathname();
  const router = useRouter();
  const groupedSubcategories = category?.subcategory?.map((item) => item.name);
  const [skillsTag, setSkillsTag] = useState<string[]>(
    groupedSubcategories || []
  );

  type ICategoryType = z.infer<typeof categorySchema>;
  // react hook form
  const methods = useForm<ICategoryType>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      subcategory: groupedSubcategories || []
    }
  });

  const {
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors }
  } = methods;

  // handle file  upload
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
          setValue('image.url', pdfFile.result as string);
          clearErrors('image.url');
        }
      };

      pdfFile.onloadend = () => {
        setImagePreview(pdfFile.result as string | undefined);
      };
    }
    pdfFile.readAsDataURL(event.target.files?.[0] as File);
  };

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
          return setError('subcategory', {
            type: 'required',
            message: 'Tag must be less than 15 characters.'
          });
        }
        // Retrieve current skills array
        const currentSkills = skillsTag || [];

        if (!skillsTag.includes(tagValue as never)) {
          setValue('subcategory', [...currentSkills, tagValue]);
          setSkillsTag([...currentSkills, tagValue]);
          tagInput.value = '';
          clearErrors('subcategory');
        }
      }
    }
  };

  // remove skill
  const handleTagRemove = async (tag: string, e: any) => {
    e.preventDefault();
    const newTags = skillsTag.filter((t: string) => t !== tag);
    if (category?._id) {
      const res = await deleteSingleSubcategory(category?._id, tag);
      if (res.success) {
        notifySuccess(res.message);
      }
    }
    setSkillsTag(newTags);
    setValue('subcategory', newTags);
  };

  const onSubmit = async (data: ICategoryType) => {
    setIsSubmitting(true);
    try {
      if (type === 'add') {
        const res = await createCategory({
          name: data.name,
          subcategories: data.subcategory,
          image: {
            url: data.image.url
          },
          path: pathname
        });
        if (res.success) {
          notifySuccess(res.message);
          setImagePreview('');
          reset();
        }
        if (!res.success) {
          notifyError(res.message);
        }
      }
      if (type === 'edit') {
        const res = await updateCategoryById({
          categoryId: category?._id,
          name: data.name,
          image: {
            url: data.image.url,
            public_id: category?.image?.public_id
          },
          subcategories: data.subcategory,
          path: pathname
        });

        if (res.success) {
          notifySuccess(res.message);
          router.push('/dashboard/admin-dashboard/categories');
        }
        if (res.error) {
          notifyError(res.message);
        }
      }
    } catch (error) {
      console.error('Error creating category:', error);
      notifyError('Error creating category');
    } finally {
      setSkillsTag([]);
      setValue('name', '');
      setValue('subcategory', []);

      setFilename('');
      setIsSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-white card-box border-20">
        <div className="user-avatar-setting d-flex align-items-center mb-30">
          {errors?.image?.url ? (
            <ErrorMsg msg={errors.image.url.message} />
          ) : (
            <Image
              src={imagePreview || category?.image.url || avatarPerson}
              alt="avatar"
              height={200}
              width={200}
              className="lazy-img user-img"
            />
          )}
          <div className="upload-btn position-relative tran3s ms-4 me-3">
            <small>{filename || ' Upload Category photo'}</small>
            {errors.image && <ErrorMsg msg={errors.image.message as string} />}
            <Controller
              name="image.url"
              control={control}
              rules={{ required: 'Image is required' }}
              render={() => (
                <>
                  <input
                    type="file"
                    id="uploadImg"
                    name="file"
                    accept="image/*"
                    placeholder="Upload Image"
                    onChange={(e) => handleFileChange(e)}
                  />
                  {/* {errors?.image?.url && (
                    <ErrorMsg msg={errors.image.url.message} />
                  )} */}
                </>
              )}
            />
          </div>
          {/* <button className="delete-btn tran3s">Delete</button> */}
        </div>

        <div className="dash-input-wrapper mb-30">
          <label htmlFor="">Category Name*</label>
          <Controller
            name="name"
            control={control}
            defaultValue={category?.name || ''}
            render={({ field }) => (
              <>
                <input
                  type="text"
                  placeholder="Enter Category Name"
                  {...field}
                />
                {errors.name && (
                  <ErrorMsg msg={errors.name?.message as string} />
                )}
              </>
            )}
          />
        </div>

        <div className="dash-input-wrapper mb-30">
          <label htmlFor="">SubCategory Skills*</label>

          <div>
            <input
              type="text"
              placeholder="Enter Skills"
              onKeyDown={(e) => handleInputKeyDown(e, 'skills')}
            />
            {errors?.subcategory && (
              <ErrorMsg msg={errors?.subcategory?.message as string} />
            )}
          </div>

          <ul className="style-none d-flex flex-wrap gap-2  align-items-center mt-2">
            {skillsTag?.map((item: any, index) => {
              return (
                <li className="is_tag" key={index}>
                  <button className="is_tag  px-2 py-1 ">
                    <span className="">{item} </span>
                    <i
                      className="bi bi-x text-danger fs-3  "
                      onClick={(e) => handleTagRemove(item, e)}
                    ></i>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="button-group d-inline-flex align-items-center mt-5">
          <button
            disabled={isSubmitting}
            type="submit"
            className="dash-btn-two tran3s me-3"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </form>
  );
};
export default CategoryForm;

// const categories = [
//   {
//     name: '',
//     subcategory: [
//       {
//         name: ''
//       }
//     ]
//   }
// ];
