require('dotenv').config();

import mongoose from 'mongoose';
const bcrypt = require('bcrypt');
const url = process.env.MONGODB_URI ?? '';
const saltRounds = 10;
mongoose.set('strictQuery', false);

export interface IUserSchema extends mongoose.Document {
  email: string;
  password: string;
  isCorrectPassword: ((password: string, callback: IComparePasswordCallback) => void)
}
export interface IComparePasswordCallback {
  (err: Error | null, same?: Boolean | null): void;
}

mongoose
  .connect(url)
  .then((_: any) => {
    console.log('connected to MongoDB');
  })
  .catch((error: any) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

UserSchema.pre<IUserSchema>('save', function (next) {
  if (this.isNew || this.isModified('password')) {
    const document = this;
    bcrypt.hash(
      document.password,
      saltRounds,
      function (err: Error, hashedPassword: string) {
        if (err) {
          next(err);
        } else {
          document.password = hashedPassword;
          next();
        }
      }
    );
  } else {
    next();
  }
});

UserSchema.methods.isCorrectPassword = function (
  password: string,
  callback: IComparePasswordCallback
) {
  bcrypt.compare(password, this.password, function (err: Error, same: boolean) {
    if (err) {
      callback(err);
    } else {
      callback(err, same);
    }
  });
};

module.exports = mongoose.model('User', UserSchema);
