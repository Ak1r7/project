import { Injectable } from '@nestjs/common';
import { Profile } from './profile.schemas';
import { Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PhoneInput } from './input/phone.input';
import { UserInputError } from 'apollo-server-express';
import { CodeInput } from './input/code.input';
import { CodeType } from './dto/code-type';
import { ThemeInput } from './input/theme.imput';
import { ProfileType } from './dto/profile-type';
import { NameInput } from './input/name.input';
import { DateInput } from './input/date.input';
import { GenderInput } from './input/gender.input';
import { NullType } from './dto/null-type';
import { PersonalDateType } from './dto/personal-type';
@Injectable()
export class ProfileService {
  constructor(
    @InjectModel('profiles') private readonly profileModel: Model<Profile>,
  ) {}

  async createProfile(ProfilInput: PhoneInput): Promise<Profile> {
    const phoneExist = await this.profileModel.findOne(ProfilInput);

    if (!phoneExist) {
      const createdProfile = new this.profileModel(ProfilInput);
      createdProfile.verify_code = (Math.random() * Math.pow(10, 6)) | 0;
      return createdProfile.save();
    } else if (phoneExist.phone === ProfilInput.phone) {
      throw new UserInputError(`Phone number is not correct`);
    }
  }

  async verify(_id: ObjectId, code: CodeInput): Promise<Profile> {
    const prof = await this.profileModel.findByIdAndUpdate(_id, { $set: code });

    if (prof.verify_code === code.code_input) {
      prof.verification = true;
      return prof.save();
    } else {
      throw new UserInputError('Incorect code');
    }
  }

  async code(_id: ObjectId, code: CodeType) {
    const codes = await this.profileModel.findById(_id, code);

    return [codes];
  }

  async createTheme(_id: ObjectId, themes: ThemeInput): Promise<Profile> {
    const a = themes.theme;

    if (a.toLowerCase() === 'dark') {
      const prof = await this.profileModel.findByIdAndUpdate(_id, {
        $set: themes,
      });
      return prof;
    } else if (a.toLowerCase() === 'light') {
      const prof = await this.profileModel.findByIdAndUpdate(_id, {
        $set: themes,
      });
      return prof;
    } else {
      throw new UserInputError('Incorect select theme');
    }
  }

  async getProfile(_id: ObjectId, prof: ProfileType) {
    const profile = await this.profileModel.findById(_id, prof);
    return [profile];
  }

  async names(_id: ObjectId, names: NameInput): Promise<Profile> {
    const profile = await this.profileModel.findByIdAndUpdate(_id, {
      $set: names,
    });
    return profile.save();
  }
  async dates(_id: ObjectId, dates: DateInput): Promise<Profile> {
    const profile = await this.profileModel.findByIdAndUpdate(_id, {
      $set: dates,
    });
    return profile.save();
  }
  async genders(_id: ObjectId, genders: GenderInput): Promise<Profile> {
    const profile = await this.profileModel.findByIdAndUpdate(_id, {
      $set: genders,
    });
    return profile.save();
  }

  async notcomplete(_id: ObjectId) {
    const profile = await this.profileModel.findById(_id);
    const nullKeys = this.findNullFields(profile);
    return { nullKeys, profile };
  }

  private findNullFields(prof: Profile) {
    const nullFields: string[] = [];
    for (const key in prof) {
      if (prof[key] === null) {
        nullFields.push(key);
      }
    }
    return nullFields;
  }
}
