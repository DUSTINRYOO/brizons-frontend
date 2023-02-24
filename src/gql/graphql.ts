/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: any;
};

export type CreateAccountInput = {
  email: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
};

export type CreateAccountOutput = {
  __typename?: 'CreateAccountOutput';
  error?: Maybe<Scalars['String']>;
  ok: Scalars['Boolean'];
};

export type CreateExampleDto = {
  category?: InputMaybe<Scalars['String']>;
  isGood?: Scalars['Boolean'];
  name: Scalars['String'];
  title: Scalars['String'];
};

export type EditProfileInput = {
  email?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
  username?: InputMaybe<Scalars['String']>;
};

export type EditProfileOutput = {
  __typename?: 'EditProfileOutput';
  error?: Maybe<Scalars['String']>;
  ok: Scalars['Boolean'];
};

export type Example = {
  __typename?: 'Example';
  category?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
  isGood: Scalars['Boolean'];
  name: Scalars['String'];
  title: Scalars['String'];
};

export type LoginInput = {
  password: Scalars['String'];
  username: Scalars['String'];
};

export type LoginOutput = {
  __typename?: 'LoginOutput';
  error?: Maybe<Scalars['String']>;
  ok: Scalars['Boolean'];
  token?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createAccount: CreateAccountOutput;
  createExample: Scalars['Boolean'];
  editProfile: EditProfileOutput;
  login: LoginOutput;
  updateExample: Scalars['Boolean'];
  verifyEmail: VerifyEmailOutput;
};


export type MutationCreateAccountArgs = {
  input: CreateAccountInput;
};


export type MutationCreateExampleArgs = {
  input: CreateExampleDto;
};


export type MutationEditProfileArgs = {
  input: EditProfileInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationUpdateExampleArgs = {
  input: UpdateExampleDto;
};


export type MutationVerifyEmailArgs = {
  input: VerifyEmailInput;
};

export type Query = {
  __typename?: 'Query';
  examples: Array<Example>;
  me: User;
  userProfile: UserProfileOutput;
};


export type QueryUserProfileArgs = {
  userId: Scalars['Float'];
};

export type UpdateExampleDto = {
  data: UpdateExampleInputType;
  id: Scalars['Float'];
};

export type UpdateExampleInputType = {
  category?: InputMaybe<Scalars['String']>;
  isGood?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  id: Scalars['Float'];
  password: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  username: Scalars['String'];
  verified: Scalars['Boolean'];
};

export type UserProfileOutput = {
  __typename?: 'UserProfileOutput';
  error?: Maybe<Scalars['String']>;
  ok: Scalars['Boolean'];
  user?: Maybe<User>;
};

export type VerifyEmailInput = {
  code: Scalars['String'];
};

export type VerifyEmailOutput = {
  __typename?: 'VerifyEmailOutput';
  error?: Maybe<Scalars['String']>;
  ok: Scalars['Boolean'];
};
