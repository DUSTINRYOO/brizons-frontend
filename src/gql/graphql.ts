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

export type Briz = {
  __typename?: 'Briz';
  coverImg: Scalars['String'];
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  grid: Grid;
  id: Scalars['Float'];
  inBucket: Scalars['Boolean'];
  metatags: Scalars['String'];
  owner: User;
  pinned: Scalars['Boolean'];
  text?: Maybe<Text>;
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  zindex: Scalars['Float'];
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

export type CreateBrizInput = {
  coverImg: Scalars['String'];
  description: Scalars['String'];
  grid: GridInputType;
  inBucket: Scalars['Boolean'];
  metatags: Scalars['String'];
  parentBrizId?: InputMaybe<Scalars['Int']>;
  pinned: Scalars['Boolean'];
  text?: InputMaybe<TextInputType>;
  title: Scalars['String'];
  zindex: Scalars['Float'];
};

export type CreateBrizOutput = {
  __typename?: 'CreateBrizOutput';
  error?: Maybe<Scalars['String']>;
  ok: Scalars['Boolean'];
};

export type CreateExampleDto = {
  category?: InputMaybe<Scalars['String']>;
  isGood?: Scalars['Boolean'];
  name: Scalars['String'];
  title: Scalars['String'];
};

export type DeleteBrizInput = {
  brizId: Scalars['Float'];
};

export type DeleteBrizOutput = {
  __typename?: 'DeleteBrizOutput';
  error?: Maybe<Scalars['String']>;
  ok: Scalars['Boolean'];
};

export type EditBrizInput = {
  brizId: Scalars['Float'];
  coverImg?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  grid?: InputMaybe<GridInputType>;
  inBucket?: InputMaybe<Scalars['Boolean']>;
  metatags?: InputMaybe<Scalars['String']>;
  parentBrizId?: InputMaybe<Scalars['Int']>;
  pinned?: InputMaybe<Scalars['Boolean']>;
  text?: InputMaybe<TextInputType>;
  title?: InputMaybe<Scalars['String']>;
  zindex?: InputMaybe<Scalars['Float']>;
};

export type EditBrizOutput = {
  __typename?: 'EditBrizOutput';
  error?: Maybe<Scalars['String']>;
  ok: Scalars['Boolean'];
};

export type EditProfileInput = {
  biography?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
  profileImg?: InputMaybe<Scalars['String']>;
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

export type GetBrizInput = {
  brizUserName: Scalars['String'];
  parentId?: InputMaybe<Scalars['Int']>;
};

export type GetBrizOutput = {
  __typename?: 'GetBrizOutput';
  error?: Maybe<Scalars['String']>;
  getBriz: Array<Briz>;
  ok: Scalars['Boolean'];
};

export type GetInBucketBrizInput = {
  brizUserName: Scalars['String'];
  parentId?: InputMaybe<Scalars['Int']>;
};

export type GetInBucketBrizOutput = {
  __typename?: 'GetInBucketBrizOutput';
  error?: Maybe<Scalars['String']>;
  getInBucketBriz: Array<Briz>;
  ok: Scalars['Boolean'];
};

export type GetParentBrizInput = {
  brizUserName: Scalars['String'];
  parentId: Scalars['Int'];
};

export type GetParentBrizOutput = {
  __typename?: 'GetParentBrizOutput';
  error?: Maybe<Scalars['String']>;
  getParentBriz: Briz;
  ok: Scalars['Boolean'];
  parentOfParentBriz?: Maybe<Briz>;
};

export type GetPinnedBrizInput = {
  brizUserName: Scalars['String'];
};

export type GetPinnedBrizOutput = {
  __typename?: 'GetPinnedBrizOutput';
  error?: Maybe<Scalars['String']>;
  getPinnedBriz: Array<Briz>;
  ok: Scalars['Boolean'];
};

export type Grid = {
  __typename?: 'Grid';
  colEnd: Scalars['Float'];
  colStart: Scalars['Float'];
  createdAt: Scalars['DateTime'];
  id: Scalars['Float'];
  rowEnd: Scalars['Float'];
  rowStart: Scalars['Float'];
  updatedAt: Scalars['DateTime'];
};

export type GridInputType = {
  colEnd: Scalars['Float'];
  colStart: Scalars['Float'];
  rowEnd: Scalars['Float'];
  rowStart: Scalars['Float'];
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
  createBriz: CreateBrizOutput;
  createExample: Scalars['Boolean'];
  deleteBriz: DeleteBrizOutput;
  editBriz: EditBrizOutput;
  editProfile: EditProfileOutput;
  login: LoginOutput;
  updateExample: Scalars['Boolean'];
  verifyEmail: VerifyEmailOutput;
};


export type MutationCreateAccountArgs = {
  input: CreateAccountInput;
};


export type MutationCreateBrizArgs = {
  createBrizInput: CreateBrizInput;
};


export type MutationCreateExampleArgs = {
  input: CreateExampleDto;
};


export type MutationDeleteBrizArgs = {
  deleteBrizInput: DeleteBrizInput;
};


export type MutationEditBrizArgs = {
  editBrizInput: EditBrizInput;
};


export type MutationEditProfileArgs = {
  editProfileInput: EditProfileInput;
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
  getBriz: GetBrizOutput;
  getInBucketBriz: GetInBucketBrizOutput;
  getParentBriz: GetParentBrizOutput;
  getPinnedBriz: GetPinnedBrizOutput;
  me: User;
  userProfile: UserProfileOutput;
};


export type QueryGetBrizArgs = {
  getBrizInput: GetBrizInput;
};


export type QueryGetInBucketBrizArgs = {
  getInBucketBrizInput: GetInBucketBrizInput;
};


export type QueryGetParentBrizArgs = {
  getParentBrizInput: GetParentBrizInput;
};


export type QueryGetPinnedBrizArgs = {
  getPinnedBrizInput: GetPinnedBrizInput;
};


export type QueryUserProfileArgs = {
  userId: Scalars['Float'];
};

export type Text = {
  __typename?: 'Text';
  bold: Scalars['String'];
  boxColor: Scalars['String'];
  createdAt: Scalars['DateTime'];
  fontSize: Scalars['Float'];
  id: Scalars['Float'];
  italic: Scalars['Boolean'];
  text: Scalars['String'];
  textColAlign: Scalars['String'];
  textColor: Scalars['String'];
  textRowAlign: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type TextInputType = {
  bold: Scalars['String'];
  boxColor: Scalars['String'];
  fontSize: Scalars['Float'];
  italic: Scalars['Boolean'];
  text: Scalars['String'];
  textColAlign: Scalars['String'];
  textColor: Scalars['String'];
  textRowAlign: Scalars['String'];
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
  biography?: Maybe<Scalars['String']>;
  brizs?: Maybe<Array<Briz>>;
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  id: Scalars['Float'];
  name?: Maybe<Scalars['String']>;
  password: Scalars['String'];
  profileImg?: Maybe<Scalars['String']>;
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
