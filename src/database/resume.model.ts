import { Schema, models, model, Document } from 'mongoose';

export interface IEducation {
  title: string;
  academy: string;
  yearStart?: number;
  yearEnd?: number;
  year?: string;
  description: string;
}

export interface IExperience {
  title: string;
  company: string;
  yearStart?: number;
  yearEnd?: number;
  year?: string;
  description: string;
}

export interface IVideos {
  title?: string;
  videoId?: string;
}

export interface Iportfolio {
  imageUrl: string | undefined;
  public_id?: string | undefined;
}

export interface IResumeType extends Document {
  user: Schema.Types.ObjectId | string;
  overview: string;
  videos?: IVideos[];
  skills?: string[] | undefined;
  education: IEducation[];
  experience: IExperience[];
  portfolio?: Iportfolio[];
}

const educationSchema = new Schema({
  title: String,
  academy: String,
  yearStart: Number,
  yearEnd: Number,
  year: String,
  description: String
});

const experienceSchema = new Schema({
  title: String,
  company: String,
  yearStart: Number,
  yearEnd: Number,
  year: String,
  description: String
});

const resumeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  overview: String,
  videos: [{ title: String, videoId: String }],
  education: [educationSchema],
  skills: [{ type: String }],
  experience: [experienceSchema],
  portfolio: [{ imageUrl: String, public_id: String }],
  createdAt: { type: Date, default: Date.now }
});

const Resume = models.Resume || model<IResumeType>('Resume', resumeSchema);

export default Resume;
