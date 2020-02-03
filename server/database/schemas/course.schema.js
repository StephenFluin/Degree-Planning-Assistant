import { Schema } from 'mongoose';

const courseSchema = new Schema({
  code: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  prerequisites: { type: [Course] },
  corequisities: { type: [Course] },
  difficulty: { type: Number },
  impaction: { type: Number },
  termsOffered: { type: String, required: true }
});

export default courseSchema;