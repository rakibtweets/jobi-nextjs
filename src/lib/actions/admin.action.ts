'use server';

import Category from '@/database/category.model';
import User from '@/database/user.model';
import { clerkClient } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '../mongoose';
import { UpdateCategoryParams } from './shared.types';
import ShareData from '@/database/shareData.model';
import connectToCloudinary from '../cloudinary';
import cloudinary from 'cloudinary';

interface ICreateCategory {
  name: string;
  subcategories?: string[];
  image: {
    url: string;
    public_id?: string;
  };
  path: string;
}

export async function createCategory(params: ICreateCategory) {
  const { name, image, subcategories, path } = params;

  try {
    await connectToDatabase();
    connectToCloudinary();
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return { success: false, message: 'Category already exists' };
    }
    if (image.url) {
      const result = await cloudinary.v2.uploader.upload(image.url as string, {
        folder: 'categories',
        width: 350
      });

      if (!result) {
        return { success: false, message: 'Error uploading image' };
      }
      image.url = result.secure_url;
      image.public_id = result.public_id;
    }
    const category = new Category({
      name,
      subcategory: subcategories?.map((name) => ({ name })),
      image: {
        url: image.url,
        public_id: image.public_id
      }
    });
    await category.save();
    revalidatePath(path);
    return { success: true, message: 'Category created successfully' };
  } catch (error) {
    console.log('Error creating category:', error);
    throw error;
  }
}

export async function getCategories() {
  try {
    await connectToDatabase();
    const categories = await Category.find({});
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.log('Error getting categories:', error);
  }
}
export async function getSingleCategoryById(categoryId: string) {
  try {
    await connectToDatabase();
    const category = await Category.findById(categoryId);
    if (!category) {
      return { success: false, message: 'Category not found' };
    }
    return JSON.parse(JSON.stringify(category));
  } catch (error) {
    console.log('Error getting category by ID:', error);
    throw error;
  }
}

export async function deleteSingleCategory(param: {
  mongoId: string;
  path: string;
}) {
  const { mongoId, path } = param;
  try {
    await connectToDatabase();
    await connectToCloudinary();
    const result = await Category.findByIdAndDelete(mongoId);

    if (result) {
      // Delete the image from Cloudinary
      if (result.image.public_id) {
        await cloudinary.v2.uploader.destroy(result.image.public_id);
      }
      revalidatePath(path);
      return { success: true, message: 'Category deleted successfully' };
    } else {
      return {
        success: false,
        message: `Category with ID: ${mongoId} not found`
      };
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error; // Re-throw to allow for error handling in calling code
  }
}

export async function updateCategoryById(params: UpdateCategoryParams) {
  const { categoryId, name, image, path, subcategories } = params;

  try {
    await connectToDatabase();
    await connectToCloudinary();

    const category = await Category.findById(categoryId);

    if (!category) {
      return { success: false, message: 'Category not found' };
    }
    // check if subcategory exists
    for (const subcategory of subcategories ?? []) {
      const existingSubcategory = category?.subcategory?.find(
        (sc: any) => sc.name === subcategory
      );
      if (!existingSubcategory) {
        await Category.findOneAndUpdate(
          { _id: category._id },
          {
            $push: { subcategory: { name: subcategory } }
          },
          { new: true }
        );
      }
    }
    // upload image to cloudinary
    if (image.url) {
      const result = await cloudinary.v2.uploader.upload(image.url as string, {
        folder: 'categories',
        width: 350
      });

      if (!result) {
        return { success: false, message: 'Error uploading image' };
      }
      image.url = result.secure_url;
      image.public_id = result.public_id;
    }

    category.name = name;
    category.image = image;

    await category.save();

    revalidatePath(path);
    return { success: true, message: 'Category updated successfully' };
  } catch (error) {
    console.log('Error updating category:', error);
    return {
      success: false,
      message: 'Failed to update category. Please try again later.'
    };
  }
}

export async function deleteSingleSubcategory(
  categoryId: string,
  subcategoryName: string
) {
  try {
    await connectToDatabase();

    const category = await Category.findOneAndUpdate(
      { _id: categoryId },
      { $pull: { subcategory: { name: subcategoryName } } }
    );

    if (!category) {
      return { success: false, message: 'Category not found' };
    }

    if (!category.subcategory.length) {
      // Optional: Handle the case where all subcategories are deleted
    }

    return { success: true, message: 'Subcategory deleted successfully' };
  } catch (error) {
    console.log('Error deleting subcategory:', error);
    throw error; // Re-throw for handling at a higher level
  }
}

interface ImakeAdminProps {
  email: string;
  path: string;
}
export async function makeUserAdmin(params: ImakeAdminProps) {
  const { email, path } = params;
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('User not found');
  }

  if (user?.clerkId) {
    user.isAdmin = true;
    await user.save();
    const clerkUser = await clerkClient.users.getUser(user.clerkId as string);
    if (!clerkUser.privateMetadata.isAdmin) {
      await clerkClient.users.updateUserMetadata(user.clerkId as string, {
        privateMetadata: {
          isAdmin: true
        }
      });
    }
  }
  revalidatePath(path);
  return JSON.parse(JSON.stringify(user));
}

export async function getAdmins() {
  try {
    await connectToDatabase();
    const admins = await User.find(
      { isAdmin: true },
      { _id: 1, isAdmin: 1, name: 1, email: 1 }
    );
    return JSON.parse(JSON.stringify(admins));
  } catch (error) {
    console.log('Error getting admins:', error);
  }
}

interface IRemoveAdminProps {
  userId: string;
  path: string;
}

export async function removeFromAdmin(params: IRemoveAdminProps) {
  const { userId, path } = params;
  try {
    await connectToDatabase();

    const isAdmin = await User.findOne({ _id: userId, isAdmin: true });
    if (!isAdmin) {
      // Handle user not being an admin gracefully
      console.log(`User with ID ${userId} is not an admin.`);
      return;
    }

    // Set isAdmin to false, preserving data integrity
    await User.updateOne({ _id: userId }, { isAdmin: false });

    revalidatePath(path);
  } catch (error) {
    console.error('Error removing user from admin:', error);
  }
}

export async function getShareSavedCandidates() {
  try {
    await connectToDatabase();
    const sharedCandidates = await ShareData.find()
      .populate({
        path: 'employeeId',
        select: 'name companyName picture email clerkId' // Specify fields for employee
      })
      .populate({
        path: 'candidates',
        select: 'name email picture resumeId' // Specify fields for candidates
      });

    return {
      success: true,
      data: sharedCandidates
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function getSingleCompanySharedData(employeeId: string) {
  try {
    await connectToDatabase();
    await connectToDatabase();
    const singleShareData = await ShareData.findOne({ employeeId })
      .populate({
        path: 'employeeId',
        select:
          'name companyName website clerkId picture email categories mediaLinks' // Specify fields for employee
      })
      .populate({
        path: 'candidates',
        select: 'name email picture resumeId post skills' // Specify fields for candidates
      });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(singleShareData))
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
