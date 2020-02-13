import { Schema } from 'mongoose';

const courseSchema = new Schema({
  school: {type: String, required: true, uppercase: true },
  code: { type: String, required: true, uppercase: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  prerequisites: [ { type: Schema.Types.ObjectId, ref: 'Course' , uppercase: true } ],
  corequisities: [ { type: Schema.Types.ObjectId, ref: 'Course' , uppercase: true } ],
  difficulty: { type: Number },
  impaction: { type: Number },
  termsOffered: { type: String, required: true }
});

export default courseSchema;