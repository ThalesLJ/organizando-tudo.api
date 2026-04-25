import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false, versionKey: false })
export class UserSession {
  @Prop()
  sessionId?: string;

  @Prop()
  tokenHash?: string;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: false })
  isValid!: boolean;
}

const UserSessionSchema = SchemaFactory.createForClass(UserSession);

@Schema({ _id: false, versionKey: false })
export class PasswordRecovery {
  @Prop()
  codeHash?: string;

  @Prop()
  expiresAt?: Date;
}

const PasswordRecoverySchema = SchemaFactory.createForClass(PasswordRecovery);

@Schema({ _id: false, versionKey: false })
export class UserColors {
  @Prop()
  backgroundPrimary?: string;

  @Prop()
  backgroundSecondary?: string;

  @Prop()
  textPrimary?: string;

  @Prop()
  textSecondary?: string;
}

const UserColorsSchema = SchemaFactory.createForClass(UserColors);

@Schema({ _id: false, versionKey: false })
export class UserPreferences {
  @Prop({ default: 'en' })
  language!: string;

  @Prop({ type: UserColorsSchema, default: null })
  colors!: UserColors | null;
}

const UserPreferencesSchema = SchemaFactory.createForClass(UserPreferences);

@Schema({ collection: 'Users', timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, unique: true, trim: true })
  username!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: UserSessionSchema, default: () => ({ isValid: false }) })
  session!: UserSession;

  @Prop({ type: PasswordRecoverySchema, default: null })
  passwordRecovery!: PasswordRecovery | null;

  @Prop({ type: UserPreferencesSchema, default: () => ({ language: 'en', colors: null }) })
  preferences!: UserPreferences;

  @Prop()
  lastLoginAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
