import type { NextPage } from "next";
import { gql, useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { isLoggedInVar } from "@/libs/apolloClient";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { LOCALSTORAGE_TOKEN } from "@/src/constants";
import Layout from "@/components/layout";
import { AnimatePresence, useScroll, motion } from "framer-motion";
import Button from "@/components/button";
import Input from "@/components/input";
import { useForm } from "react-hook-form";
import { capitalizeFirstLetter, cls } from "@/libs/utils";
import Image from "next/image";
import ThreeDotsWave from "@/components/loading";
import Link from "next/link";
import {
  CreateBrizOutput,
  DeleteBrizOutput,
  EditBrizOutput,
  EditProfileOutput,
  GetBrizOutput,
  GetInBucketBrizOutput,
  GetOthersProfileOutput,
  GetPinnedBrizOutput,
} from "@/src/gql/graphql";

const ME_QUERY = gql`
  query meQuery {
    me {
      id
      email
      username
      verified
      profileImg
      biography
      name
    }
  }
`;

const OTHERS_PROFILE_QUERY = gql`
  query getOthersProfile($getOthersProfileInput: GetOthersProfileInput!) {
    getOthersProfile(getOthersProfileInput: $getOthersProfileInput) {
      ok
      error
      user {
        username
        profileImg
        biography
        name
      }
    }
  }
`;

const BRIZ_QUERY = gql`
  query brizQuery($getBrizInput: GetBrizInput!) {
    getBriz(getBrizInput: $getBrizInput) {
      ok
      error
      getBriz {
        id
        text {
          text
          fontSize
          bold
          italic
          textColor
          boxColor
          textColAlign
          textRowAlign
        }
        coverImg
        pinned
        inBucket
        title
        description
        metatags
        zindex
        grid {
          colStart
          colEnd
          rowStart
          rowEnd
        }
      }
    }
  }
`;

const INBUCKET_BRIZ_QUERY = gql`
  query inBucketBrizQuery($getInBucketBrizInput: GetInBucketBrizInput!) {
    getInBucketBriz(getInBucketBrizInput: $getInBucketBrizInput) {
      ok
      error
      getInBucketBriz {
        id
        text {
          text
          fontSize
          bold
          italic
          textColor
          boxColor
          textColAlign
          textRowAlign
        }
        coverImg
        pinned
        inBucket
        title
        description
        metatags
        grid {
          colStart
          colEnd
          rowStart
          rowEnd
        }
      }
    }
  }
`;

const PINNED_BRIZ_QUERY = gql`
  query pinnedBrizQuery($getPinnedBrizInput: GetPinnedBrizInput!) {
    getPinnedBriz(getPinnedBrizInput: $getPinnedBrizInput) {
      ok
      error
      getPinnedBriz {
        id
        coverImg
        pinned
        title
      }
    }
  }
`;

const CREATE_BRIZ_MUTATION = gql`
  mutation createBrizMutation($createBrizInput: CreateBrizInput!) {
    createBriz(createBrizInput: $createBrizInput) {
      ok
      error
    }
  }
`;

const EDIT_BRIZ_MUTATION = gql`
  mutation editBrizMutation($editBrizInput: EditBrizInput!) {
    editBriz(editBrizInput: $editBrizInput) {
      ok
      error
    }
  }
`;

const EDIT_PROFILE_MUTATION = gql`
  mutation editProfileMutation($editProfileInput: EditProfileInput!) {
    editProfile(editProfileInput: $editProfileInput) {
      ok
      error
      username
      profileImg
    }
  }
`;

const DELETE_BRIZ_MUTATION = gql`
  mutation deleteBrizMutation($deleteBrizInput: DeleteBrizInput!) {
    deleteBriz(deleteBrizInput: $deleteBrizInput) {
      ok
      error
    }
  }
`;
type meQueryList = {
  id: string;
  email: string;
  username: string;
  verified: boolean;
  name: string;
  biography: string;
  profileImg: string;
};

interface meQuery {
  me: meQueryList;
}

interface getOthersProfileQuery {
  getOthersProfile: GetOthersProfileOutput;
}

interface IGrid {
  colStart?: number;
  colEnd?: number;
  rowStart?: number;
  rowEnd?: number;
}

interface IText {
  text: string;
  fontSize: number;
  bold: string;
  italic: boolean;
  textColor: string;
  boxColor: string;
  textColAlign: string;
  textRowAlign: string;
}
interface IDragIndex {
  colStartIndex?: number;
  colEndIndex?: number;
  rowStartIndex?: number;
  rowEndIndex?: number;
}
interface CreateBrizForm {
  title: string;
  text: IText;
  description: string;
  metatags: string;
  coverImg: string;
  parentBrizId?: number;
}

interface EditBrizInputForm {
  id?: number;
  title?: string;
  pinned?: boolean;
  description?: string;
  metatags?: string;
  zindex?: number;
  text?: IText | null;
  grid?: IGrid;
}

interface EditProfileInputForm {
  name?: string;
  username?: string;
  biography?: string;
  password?: string;
  profileImg?: string;
  email?: string;
}

interface EditBrizForm {
  editBriz: EditBrizInputForm;
}

interface EditProfileForm {
  editProfile: EditProfileInputForm;
}

interface EditClickedForm {
  id: number;
  briztype: string;
}

interface OpenAiForm {
  prompt: string;
}

interface createBrizMutation {
  createBriz: CreateBrizOutput;
}

interface editBrizMutation {
  editBriz: EditBrizOutput;
}

interface editProfileMutation {
  editProfile: EditProfileOutput;
}

interface deleteBrizMutation {
  deleteBriz: DeleteBrizOutput;
}

interface getBrizQuery {
  getBriz: GetBrizOutput;
}

interface getInBucketBrizQuery {
  getInBucketBriz: GetInBucketBrizOutput;
}

interface getPinnedBrizQuery {
  getPinnedBriz: GetPinnedBrizOutput;
}
enum textRowAlign {
  "start" = "start",
  "center" = "center",
  "end" = "end",
}

const Briz: NextPage = () => {
  const { scrollY } = useScroll();
  const longPressTimeOut = useRef<number>();
  const [gridRowNumber, setGridRowNumber] = useState<number>(14);
  const baseGrid = [...Array(gridRowNumber * 24)];
  const router = useRouter();
  const brizUserName = router.query.username;
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [grid, setGrid] = useState<IGrid>({});
  const [dragIndex, setDragIndex] = useState<IDragIndex>({});
  const [brizText, setBrizText] = useState<string>();
  const [brizLongPressed, setBrizLongPressed] = useState<EditBrizInputForm>();
  const [brizMouseOn, setBrizMouseOn] = useState<number>();
  const [mouseOnBucketBtn, setMouseOnBucketBtn] = useState<boolean>(false);
  const [brizClicked, setBrizClicked] = useState<boolean>();
  const [bucketClicked, setBucketClicked] = useState<boolean>(false);
  const [profileClicked, setProfileClicked] = useState<boolean>(false);
  const [editClicked, setEditClicked] = useState<EditClickedForm>();
  const [editProfileClicked, setEditProfileClicked] = useState<boolean>(false);
  const [mouseOnLayerBtn, setMouseOnLayerBtn] = useState<boolean>(false);
  const [dragged, setDragged] = useState<boolean>(false);
  const [gridOnOff, setGridOnOff] = useState<boolean>(false);
  const [boxColorOnOff, setBoxColorOnOff] = useState<boolean>(false);
  const [brizLoading, setBrizLoading] = useState<boolean>(false);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [openAiOnOff, setOpenAiOnOff] = useState<boolean>(false);
  const [inputToggle, setInputToggle] = useState<boolean>(false);
  const [textBold, setTextBold] = useState<string>("500");
  const [textItalic, setTextItalic] = useState<boolean>(false);
  const [textRowAlign, setTextRowAlign] = useState<string>("center");
  const [textColAlign, setTextColAlign] = useState<string>("center");
  const [openAI, setOpenAI] = useState("Hello! What do you want to know?");
  const {
    data: meData,
    loading: meLoading,
    error: meError,
    refetch: meRefetch,
  } = useQuery<meQuery>(ME_QUERY);

  const {
    data: getOthersProfileData,
    loading: getOthersProfileLoading,
    error: getOthersProfileError,
    refetch: getOthersProfileRefetch,
  } = useQuery<getOthersProfileQuery>(OTHERS_PROFILE_QUERY, {
    variables: { getOthersProfileInput: { username: brizUserName } },
  });

  const {
    data: getBrizData,
    loading: getBrizLoading,
    error: getBrizError,
    refetch: getBrizRefetch,
  } = useQuery<getBrizQuery>(BRIZ_QUERY, {
    variables: { getBrizInput: { brizUserName, parentId: null } },
  });
  const {
    data: getInBucketBrizData,
    loading: getInBucketBrizLoading,
    error: getInBucketBrizError,
    refetch: getInBucketBrizRefetch,
  } = useQuery<getInBucketBrizQuery>(INBUCKET_BRIZ_QUERY, {
    variables: { getInBucketBrizInput: { brizUserName, parentId: null } },
  });
  const {
    data: getPinnedBrizData,
    loading: getPinnedBrizLoading,
    error: getPinnedBrizError,
    refetch: getPinnedBrizRefetch,
  } = useQuery<getPinnedBrizQuery>(PINNED_BRIZ_QUERY, {
    variables: { getPinnedBrizInput: { brizUserName } },
  });

  useEffect(() => {
    meRefetch();
    if (brizUserName) {
      getBrizRefetch();
      getPinnedBrizRefetch();
      getInBucketBrizRefetch();
      getOthersProfileRefetch();
    }
  }, [
    meData,
    getBrizData,
    getPinnedBrizData,
    getInBucketBrizData,
    getOthersProfileData,
  ]);

  useEffect(() => {
    if (
      !getBrizError &&
      !getBrizLoading &&
      getBrizData?.getBriz.getBriz.length !== 0
    ) {
      const gridRow: Array<number> = [];
      getBrizData?.getBriz.getBriz.map((briz, i) => {
        gridRow.push(briz.grid.rowEnd!);
      });
      setGridRowNumber(Math.max(...gridRow) + 13);
    } else {
      setGridRowNumber(14);
    }
  }, [getBrizData, getBrizError, getBrizLoading]);

  const {
    register,
    handleSubmit,
    resetField,
    reset,
    formState: { errors },
  } = useForm<CreateBrizForm>({
    mode: "onChange",
  });

  const {
    register: registerEditBriz,
    handleSubmit: handleSubmitEditBriz,
    resetField: resetFieldEditBriz,
    formState: { errors: errorsEditBriz },
    setValue: setValueEditBriz,
    reset: resetEditBriz,
  } = useForm<EditBrizForm>({
    mode: "onChange",
    defaultValues: {
      editBriz: {
        title: "",
        description: "",
        metatags: "",
        text: undefined,
      },
    },
  });

  const {
    register: registerEditProfile,
    handleSubmit: handleSubmitEditProfile,
    resetField: resetFieldEditProfile,
    formState: { errors: errorsEditProfile },
    setValue: setValueEditProfile,
    reset: resetEditProfile,
  } = useForm<EditProfileForm>({
    mode: "onChange",
    defaultValues: {
      editProfile: {
        username: "",
        email: "",
        name: "",
        biography: "",
      },
    },
  });

  const {
    register: registerOpenAi,
    handleSubmit: handleSubmitOpenAi,
    formState: { errors: errorsOpenAi },
  } = useForm<OpenAiForm>({
    mode: "onChange",
  });

  const [
    createBrizMutation,
    {
      data: createBrizMutationResult,
      loading: createBrizMutationLoading,
      error: createBrizMutationError,
    },
  ] = useMutation<createBrizMutation>(CREATE_BRIZ_MUTATION, {
    onCompleted(data: createBrizMutation) {
      const {
        createBriz: { ok, error },
      } = data;
      setTextBold("500");
      setTextItalic(false);
      setTextRowAlign("center");
      setTextColAlign("center");
      reset();
      getInBucketBrizRefetch();
      return getBrizRefetch();
    },
  });

  const [
    editBrizMutation,
    {
      data: editBrizMutationResult,
      loading: editBrizMutationLoading,
      error: editBrizMutationError,
    },
  ] = useMutation<editBrizMutation>(EDIT_BRIZ_MUTATION, {
    onCompleted(data: editBrizMutation) {
      const {
        editBriz: { ok, error },
      } = data;
      setTextBold("500");
      setTextItalic(false);
      setTextRowAlign("center");
      setTextColAlign("center");
      reset();
      resetEditBriz();
      getInBucketBrizRefetch();
      getPinnedBrizRefetch();
      return getBrizRefetch();
    },
  });

  const [
    deleteBrizMutation,
    {
      data: deleteBrizMutationResult,
      loading: deleteBrizMutationLoading,
      error: deleteBrizMutationError,
    },
  ] = useMutation<deleteBrizMutation>(DELETE_BRIZ_MUTATION, {
    onCompleted(data: deleteBrizMutation) {
      const {
        deleteBriz: { ok, error },
      } = data;
      getPinnedBrizRefetch();
      getInBucketBrizRefetch();
      return getBrizRefetch();
    },
  });

  const [
    editProfileMutation,
    {
      data: editProfileMutationResult,
      loading: editProfileMutationLoading,
      error: editProfileMutationError,
      reset: editProfileMutationReset,
    },
  ] = useMutation<editProfileMutation>(EDIT_PROFILE_MUTATION, {
    onCompleted(data: editProfileMutation) {
      const {
        editProfile: { ok, error, username, profileImg },
      } = data;
      if (!ok) {
        return setProfileLoading(false);
      }
      meRefetch();
      getOthersProfileRefetch();
      setEditProfileClicked(false);
      if (brizUserName !== username) {
        router.replace(`/briz/${username}`);
      }
      setProfileLoading(false);
      return resetEditProfile();
    },
  });
  const onOverlayClick = () => {
    setBucketClicked(false);
    setProfileClicked(false);
    setEditProfileClicked(false);
    setGrid({});
    setDragIndex({});
    setDragged(false);
    setBrizClicked(false);
    setEditClicked(undefined);
    setOpenAiOnOff(false);
    editProfileMutationReset();
    setOpenAI("Hello! What do you want to know?");
  };

  const onClickDelete = async (brizId: number) => {
    if (meData?.me.username !== brizUserName) {
      return null;
    }
    if (!meLoading) {
      deleteBrizMutation({
        variables: {
          deleteBrizInput: {
            brizId,
          },
        },
      });
    }
  };
  const onSubmitCreate = async (data: CreateBrizForm) => {
    if (meData?.me.username !== brizUserName) {
      return null;
    }
    setDragged(false);
    setGridOnOff(false);
    setBrizLoading(true);
    const bucketGrid: IGrid = {
      colStart: 23,
      colEnd: 24,
      rowStart: 1,
      rowEnd: 2,
    };
    let coverImg = "null";
    let text = null;
    if (data.coverImg) {
      if (data.coverImg.length !== 0) {
        const actualFile = data.coverImg[0];
        const formBody = new FormData();
        formBody.append("file", actualFile);
        const { fileUrl: fetchCoverImg } = await (
          await fetch("http://localhost:4000/uploads", {
            method: "POST",
            body: formBody,
          })
        ).json();
        coverImg = fetchCoverImg;
      }
    }
    if (data.text) {
      text = data.text;
      text.fontSize = +data.text.fontSize;
      text.textColAlign = textColAlign;
      text.textRowAlign = textRowAlign;
      text.bold = textBold;
      text.italic = textItalic;
      data.description = "";
      if (boxColorOnOff) {
        text.boxColor = "";
      }
      setBrizText(text.text);
      setBrizLoading(false);
    }

    setDragIndex({});
    if (!meLoading) {
      createBrizMutation({
        variables: {
          createBrizInput: {
            text,
            title: data.title,
            description: data.description,
            metatags: data.metatags,
            coverImg: coverImg,
            grid: Object.keys(grid).length === 0 ? bucketGrid : grid,
            inBucket: Object.keys(grid).length === 0 ? true : false,
            pinned: false,
            parentBrizId: null,
            zindex: 100,
          },
        },
      });
    }
  };
  const onSubmitEdit = async (data: EditBrizForm) => {
    if (meData?.me.username !== brizUserName) {
      return null;
    }
    let text = null;
    if (data.editBriz.text) {
      text = data.editBriz.text;
      text.fontSize = +data.editBriz.text.fontSize;
      text.textColAlign = textColAlign;
      text.textRowAlign = textRowAlign;
      text.bold = textBold;
      text.italic = textItalic;
      text.text = data.editBriz.text.text;
      data.editBriz.description = "";
      if (boxColorOnOff) {
        text.boxColor = "";
      }
    }
    if (!meLoading && text) {
      editBrizMutation({
        variables: {
          editBrizInput: {
            brizId: editClicked?.id,
            text: {
              text: text?.text,
              bold: text?.bold,
              boxColor: text?.boxColor,
              textColor: text?.textColor,
              fontSize: text?.fontSize,
              italic: text?.italic,
              textColAlign: text?.textColAlign,
              textRowAlign: text?.textRowAlign,
            },
            title: data.editBriz.title,
            description: data.editBriz.description,
            metatags: data.editBriz.metatags,
          },
        },
      });
    } else {
      editBrizMutation({
        variables: {
          editBrizInput: {
            brizId: editClicked?.id,
            title: data.editBriz.title,
            description: data.editBriz.description,
            metatags: data.editBriz.metatags,
          },
        },
      });
    }
    setEditClicked(undefined);
  };

  const onSubmitEditProfile = async (data: EditProfileForm) => {
    if (meData?.me.username !== brizUserName) {
      return null;
    }
    setProfileLoading(true);
    let profileImg: string | null = null;
    if (data.editProfile.profileImg) {
      if (data.editProfile.profileImg.length !== 0) {
        const actualFile = data.editProfile.profileImg[0];
        const formBody = new FormData();
        formBody.append("file", actualFile);
        const { fileUrl: fetchProfileImg } = await (
          await fetch("http://localhost:4000/uploads", {
            method: "POST",
            body: formBody,
          })
        ).json();
        profileImg = fetchProfileImg;
      }
    }

    if (!meLoading) {
      editProfileMutation({
        variables: {
          editProfileInput: {
            username: data.editProfile.username?.toLowerCase(),
            name: data.editProfile.name,
            email: data.editProfile.email,
            biography: data.editProfile.biography,
            profileImg,
          },
        },
      });
    }
  };

  const onSubmitGridEdit = async (brizId: number, pinnedStatus: boolean) => {
    if (meData?.me.username !== brizUserName) {
      return null;
    }
    const bucketGrid: IGrid = {
      colStart: 23,
      colEnd: 24,
      rowStart: 1,
      rowEnd: 2,
    };
    if (!meLoading) {
      editBrizMutation({
        variables: {
          editBrizInput: {
            brizId,
            grid: Object.keys(grid).length === 0 ? bucketGrid : grid,
            inBucket: Object.keys(grid).length === 0 ? true : false,
            pinned: Object.keys(grid).length === 0 ? false : pinnedStatus,
          },
        },
      });
    }
    setEditClicked(undefined);
  };

  const onClickPinned = async (brizId: number, pinned: boolean) => {
    if (meData?.me.username !== brizUserName) {
      return null;
    }
    if (!meLoading) {
      editBrizMutation({
        variables: {
          editBrizInput: {
            brizId,
            pinned,
          },
        },
      });
    }
  };

  const onClickUpZindex = async (brizId: number, currentZindex: number) => {
    if (meData?.me.username !== brizUserName) {
      return null;
    }
    if (!meLoading) {
      editBrizMutation({
        variables: {
          editBrizInput: {
            brizId,
            zindex: currentZindex! + 1,
          },
        },
      });
    }
    setBrizLongPressed({ zindex: currentZindex! + 1 });
  };

  const onClickDownZindex = async (brizId: number, currentZindex: number) => {
    if (meData?.me.username !== brizUserName) {
      return null;
    }
    if (!meLoading) {
      editBrizMutation({
        variables: {
          editBrizInput: {
            brizId,
            zindex: currentZindex! - 1,
          },
        },
      });
    }
    setBrizLongPressed({ zindex: currentZindex! - 1 });
  };

  const onSubmitOpenAi = async (data: OpenAiForm) => {
    const prompt = data.prompt;

    const test = await fetch("http://localhost:4000/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });
    console.log(test);
    /* 
    const { openAi } = await (
      await fetch("http://localhost:4000/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      })
    ).json(); */
    /*     setOpenAI(openAi); */
  };

  const gridOnOffVar = {
    hidden: { backgroundColor: "rgba(255, 0, 0,0)" },
    visibleCreate: { backgroundColor: "rgba(255, 0, 0, 0.5)" },
    visibleEdit: { backgroundColor: "rgba(255, 255, 0, 0.5)" },
    exit: { backgroundColor: "rgba(255, 0, 0, 0)" },
  };

  useEffect(() => {
    const localToken = localStorage.getItem(LOCALSTORAGE_TOKEN);
    if (localToken === ("" || null) && !isLoggedIn) router.replace("/");
  }, [isLoggedIn]);
  if (meLoading) {
    return (
      <span className="fixed top-[15vw] w-full   py-2 text-center text-2xl font-extrabold text-gray-300">
        Loading
      </span>
    );
  }
  return (
    <Layout title="Main - Briz" hasTabBar>
      <motion.div className="h-auto w-full py-20 ">
        {getOthersProfileData?.getOthersProfile.ok ? (
          <motion.div
            layout
            className="relative mx-auto mb-6 flex w-[92vw] max-w-7xl flex-row items-center justify-center rounded-3xl border-[0.2vw] border-gray-50 bg-white  shadow-md"
            initial={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              height: `clamp(1px,
                12vw,9.6rem)`,
            }}
          >
            {bucketClicked ? (
              <motion.div
                className={cls(
                  "fixed top-0 left-0 z-[200] h-screen w-full bg-gray-500 opacity-0"
                )}
                onClick={onOverlayClick}
                exit={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              ></motion.div>
            ) : null}
            {profileClicked ? (
              <>
                <motion.div
                  className="fixed top-0 left-0 z-[200] h-screen w-full bg-gray-500 opacity-0"
                  onClick={onOverlayClick}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                ></motion.div>
                <motion.div
                  className="absolute left-0 right-0 top-[10vw] z-[201] mx-auto flex h-[50vh] max-h-max w-3/5 flex-col justify-center overflow-hidden rounded-3xl border-4 border-gray-50 bg-white p-4 shadow-lg"
                  layout
                  layoutId="profile"
                  onClick={() => {
                    setProfileClicked(false);
                  }}
                >
                  <motion.span
                    layout={true}
                    className={cls(
                      " absolute left-0 right-0  z-[202] mx-auto  max-w-max rounded-2xl  bg-white px-6 text-center font-extrabold shadow-2xl",
                      !getOthersProfileData?.getOthersProfile.user?.name
                        ? "cursor-pointer text-gray-300"
                        : ""
                    )}
                    onClick={() => {
                      if (meData?.me.username !== brizUserName) {
                        return null;
                      } else {
                        if (!meData?.me.name) {
                          setValueEditProfile("editProfile", {
                            username: meData?.me.username,
                            email: meData?.me.email,
                            biography: meData?.me.biography,
                            name: meData?.me.name,
                          });
                          setEditProfileClicked(true);
                        }
                        return null;
                      }
                    }}
                    style={{
                      top: `clamp(1px,
                        11vw,8.8rem)`,
                      fontSize: `clamp(1px,
                      2vw,1.6rem)`,
                    }}
                  >
                    {getOthersProfileData?.getOthersProfile.user?.name
                      ? getOthersProfileData?.getOthersProfile.user?.name
                      : "Add your name"}
                  </motion.span>
                  <motion.div
                    className="absolute left-0 right-0 top-2 z-[202] mx-auto flex flex-col items-center justify-center overflow-hidden rounded-full  border-4 border-gray-50 bg-white"
                    style={{
                      width: `clamp(1px,
                        10vw,8rem)`,
                      height: `clamp(1px,
                          10vw,8rem)`,
                    }}
                  >
                    {getOthersProfileData?.getOthersProfile.user?.profileImg ? (
                      <Image
                        priority
                        src={`${getOthersProfileData?.getOthersProfile.user?.profileImg}`}
                        alt={`${getOthersProfileData?.getOthersProfile.user?.username}'s Briz`}
                        fill
                        style={{
                          objectFit: "cover",
                        }}
                        onLoadingComplete={() => {
                          setGrid({});
                          setBrizLoading(false);
                        }}
                      ></Image>
                    ) : (
                      <motion.span
                        className={cls(
                          "mx-auto flex h-full w-full cursor-pointer items-center justify-center bg-white  text-center  font-semibold shadow-2xl"
                        )}
                        onClick={() => {
                          if (meData?.me.username !== brizUserName) {
                            return null;
                          } else {
                            setValueEditProfile("editProfile", {
                              username: meData?.me.username,
                              email: meData?.me.email,
                              biography: meData?.me.biography,
                              name: meData?.me.name,
                            });
                            setEditProfileClicked(true);
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="4vw"
                          height="4vw"
                          viewBox="-220 -160 825 825"
                        >
                          <path
                            d="M384 64c0-35.3-28.7-64-64-64H64C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64l0-384zM128 192a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zM80 356.6c0-37.9 30.7-68.6 68.6-68.6h86.9c37.9 0 68.6 30.7 68.6 68.6c0 15.1-12.3 27.4-27.4 27.4H107.4C92.3 384 80 371.7 80 356.6z"
                            fill="rgb(229 231 235)"
                          />
                        </svg>
                      </motion.span>
                    )}
                  </motion.div>
                  <motion.span
                    className={cls(
                      "absolute left-0 right-0 z-[202] mx-auto block h-full w-full rounded-xl bg-white px-4 py-2 text-left font-medium",
                      !getOthersProfileData?.getOthersProfile.user?.biography
                        ? "cursor-pointer text-gray-300"
                        : ""
                    )}
                    onClick={() => {
                      if (meData?.me.username !== brizUserName) {
                        return null;
                      } else {
                        if (!meData?.me.biography) {
                          setValueEditProfile("editProfile", {
                            username: meData?.me.username,
                            email: meData?.me.email,
                            biography: meData?.me.biography,
                            name: meData?.me.name,
                          });
                          setEditProfileClicked(true);
                        }
                        return null;
                      }
                    }}
                    style={{
                      top: `clamp(1px,
                        15vw,12rem)`,
                      fontSize: `clamp(1px,
                  1.6vw,1.28rem)`,
                    }}
                  >
                    {getOthersProfileData?.getOthersProfile.user?.biography
                      ? getOthersProfileData?.getOthersProfile.user?.biography
                      : "Add your biography"}
                  </motion.span>
                </motion.div>
              </>
            ) : null}
            {!profileClicked ? (
              <>
                {!profileLoading ? (
                  <motion.div
                    layout
                    layoutId="profile"
                    className="absolute z-[101] flex aspect-square  items-center justify-center overflow-hidden rounded-3xl border-4 border-gray-50 bg-white shadow-lg"
                    style={{
                      height: `clamp(1px,10vw,8rem)`,
                      top: `clamp(1px,3.2vw,2.56rem)`,
                      left: `clamp(1px,2vw,1.6rem)`,
                    }}
                    whileHover={"hoverBox"}
                    whileTap={{ scale: 1.08 }}
                    variants={{
                      hoverBox: {
                        scale: 1.05,
                      },
                    }}
                    onMouseDown={() => {
                      longPressTimeOut.current = window.setTimeout(() => {
                        if (meData?.me.username !== brizUserName) {
                          return null;
                        } else {
                          setValueEditProfile("editProfile", {
                            username: meData?.me.username,
                            email: meData?.me.email,
                            biography: meData?.me.biography,
                            name: meData?.me.name,
                          });
                          setEditProfileClicked(true);
                        }
                      }, 400);
                    }}
                    onMouseUp={() => {
                      clearTimeout(longPressTimeOut.current);
                    }}
                    onClick={() => {
                      setProfileClicked(true);
                    }}
                  >
                    {getOthersProfileData?.getOthersProfile.user?.profileImg ? (
                      <Image
                        priority
                        src={`${getOthersProfileData?.getOthersProfile.user?.profileImg}`}
                        alt={`${getOthersProfileData?.getOthersProfile.user?.biography}`}
                        fill
                        style={{
                          objectFit: "contain",
                        }}
                      ></Image>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="8vw"
                        height="8vw"
                        viewBox="-220 -170 825 825"
                      >
                        <path
                          d="M384 64c0-35.3-28.7-64-64-64H64C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64l0-384zM128 192a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zM80 356.6c0-37.9 30.7-68.6 68.6-68.6h86.9c37.9 0 68.6 30.7 68.6 68.6c0 15.1-12.3 27.4-27.4 27.4H107.4C92.3 384 80 371.7 80 356.6z"
                          fill="rgb(229 231 235)"
                        />
                      </svg>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    layout
                    layoutId="profile"
                    className="absolute z-[101] aspect-square overflow-hidden rounded-3xl border-4 border-red-300 bg-white shadow-lg"
                    style={{
                      height: `clamp(1px,10vw,8rem)`,
                      top: `clamp(1px,3.2vw,2.56rem)`,
                      left: `clamp(1px,2vw,1.6rem)`,
                    }}
                  >
                    <ThreeDotsWave />
                  </motion.div>
                )}
              </>
            ) : null}
            {editProfileClicked ? (
              <>
                <motion.div
                  className="fixed top-0 left-0 z-[200] h-screen w-full bg-gray-500 opacity-0"
                  onClick={onOverlayClick}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                ></motion.div>
                <motion.div
                  className=" absolute  left-0 right-0  z-[201]  mx-auto max-w-md  rounded-3xl bg-white p-6 pb-8 opacity-0 shadow-lg"
                  style={{ top: scrollY.get() + 100 }}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h3 className="text-center text-3xl font-bold">
                    Edit Profile
                  </h3>
                  <div className="mt-4 px-4 max-sm:px-0 ">
                    <form
                      className="mx-auto mt-6 flex w-80 flex-col space-y-4  max-sm:w-72 "
                      onSubmit={handleSubmitEditProfile(onSubmitEditProfile)}
                    >
                      <Input
                        label="Image"
                        name="profileImg"
                        type="file"
                        required={false}
                        tab
                        accept="image/*"
                        register={registerEditProfile("editProfile.profileImg")}
                      />
                      <Input
                        label="Name"
                        name="name"
                        type="text"
                        placeholder="Name"
                        required={false}
                        register={registerEditProfile("editProfile.name")}
                      />
                      <Input
                        label="Bio"
                        name="bio"
                        type="textarea"
                        placeholder="Write a bio"
                        required={false}
                        register={registerEditProfile("editProfile.biography")}
                      />
                      <Input
                        label="Username"
                        name="username"
                        type="text"
                        placeholder="Username"
                        required
                        register={registerEditProfile("editProfile.username", {
                          onChange: () => {
                            editProfileMutationReset();
                          },
                        })}
                      />
                      <Input
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        register={registerEditProfile("editProfile.email", {
                          pattern:
                            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                        })}
                      />
                      <Button text={"Edit profile"} />
                      <motion.span
                        className="absolute left-0 right-0 bottom-0 mx-auto w-[22rem]  text-center font-semibold text-red-500"
                        layout
                      >
                        <motion.span layout className="block">
                          {errorsEditProfile.editProfile?.email?.type ===
                          "pattern"
                            ? "Please enter a valid email."
                            : null}
                        </motion.span>
                        <motion.span layout className="block">
                          {!editProfileMutationResult?.editProfile.ok &&
                          errorsEditProfile.editProfile?.email?.type !==
                            "pattern"
                            ? editProfileMutationResult?.editProfile.error
                            : null}
                        </motion.span>
                      </motion.span>
                    </form>
                  </div>
                </motion.div>
              </>
            ) : null}

            {bucketClicked ? (
              <motion.div
                className={cls(
                  "absolute left-0 right-0 top-[10vw] z-[201] mx-auto flex h-auto min-h-[50vh] w-3/5 flex-col items-center justify-start overflow-hidden rounded-3xl border-4  border-gray-50 bg-white px-4 pb-4 shadow-lg"
                )}
                key={"bucket"}
                layout
                layoutId={"bucket"}
              >
                {dragged ? (
                  <motion.div
                    className={cls(
                      "fixed top-0 left-0 z-[200] h-screen w-full bg-gray-500 opacity-0"
                    )}
                    onClick={() => {
                      setDragged(false);
                    }}
                    exit={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                  ></motion.div>
                ) : null}
                {brizLoading ? (
                  <motion.div className="my-4 h-[9vw] w-[9vw] rounded-3xl border-4 border-red-300 bg-white">
                    <ThreeDotsWave />
                  </motion.div>
                ) : null}
                {!brizLoading ? (
                  <motion.div
                    className="my-4 flex  flex-col items-center justify-center rounded-3xl border-4 border-gray-50 bg-white"
                    style={{
                      height: `clamp(1px,10vw,8rem)`,
                      width: `clamp(1px,10vw,8rem)`,
                    }}
                    onClick={() => {
                      if (meData?.me.username !== brizUserName) {
                        return null;
                      }
                      setDragged(true);
                    }}
                    onMouseEnter={() => {
                      setMouseOnBucketBtn(true);
                    }}
                    onMouseLeave={() => {
                      setMouseOnBucketBtn(false);
                    }}
                    whileHover={{
                      scale: 1.05,
                      borderColor: "rgb(252 165 165)",
                    }}
                  >
                    <svg
                      className="block"
                      xmlns="http://www.w3.org/2000/svg"
                      width="9vw"
                      height="9vw"
                      viewBox="-90 -160 800 800"
                    >
                      <path
                        d="M45.9 42.1c3-6.1 9.6-9.6 16.3-8.7L307 64 551.8 33.4c6.7-.8 13.3 2.7 16.3 8.7l41.7 83.4c9 17.9-.6 39.6-19.8 45.1L426.6 217.3c-13.9 4-28.8-1.9-36.2-14.3L307 64 223.6 203c-7.4 12.4-22.3 18.3-36.2 14.3L24.1 170.6C4.8 165.1-4.7 143.4 4.2 125.5L45.9 42.1zM308.1 128l54.9 91.4c14.9 24.8 44.6 36.6 72.5 28.6L563 211.6v167c0 22-15 41.2-36.4 46.6l-204.1 51c-10.2 2.6-20.9 2.6-31 0l-204.1-51C66 419.7 51 400.5 51 378.5v-167L178.6 248c27.8 8 57.6-3.8 72.5-28.6L305.9 128h2.2z"
                        fill={cls(
                          brizLongPressed ? "rgb(254 215 170)" : "",
                          getInBucketBrizData?.getInBucketBriz.getInBucketBriz
                            .length !== 0 &&
                            !brizLongPressed &&
                            !mouseOnBucketBtn
                            ? "black"
                            : "",
                          getInBucketBrizData?.getInBucketBriz.getInBucketBriz
                            .length === 0 &&
                            !brizLongPressed &&
                            !mouseOnBucketBtn
                            ? "rgb(229 231 235)"
                            : "",
                          mouseOnBucketBtn ? "rgb(252 165 165)" : ""
                        )}
                      />
                    </svg>
                  </motion.div>
                ) : null}

                <motion.div className="grid h-auto w-full grid-cols-3">
                  <AnimatePresence>
                    {getInBucketBrizData?.getInBucketBriz.getInBucketBriz.map(
                      (briz) => (
                        <motion.div
                          key={briz.id}
                          layout
                          layoutId={briz.id + ""}
                          initial="initial"
                          animate={
                            brizLongPressed && brizLongPressed.id === briz.id
                              ? "selected"
                              : "normal"
                          }
                          exit="exit"
                          whileHover="hoverBox"
                          variants={{
                            initial: { opacity: 0 },
                            normal: { opacity: 1 },
                            selected: { opacity: 0.3, scale: 1.05 },
                            exit: { opacity: 0 },
                            hoverBox: { scale: 1.03 },
                          }}
                          transition={{
                            duration: 0.4,
                          }}
                          className={cls(
                            `relative m-1 flex aspect-square items-center justify-center object-scale-down`,
                            briz.id === brizMouseOn && brizClicked
                              ? "opacity-0"
                              : ""
                          )}
                          onMouseDown={() => {
                            longPressTimeOut.current = window.setTimeout(() => {
                              if (meData?.me.username !== brizUserName) {
                                return null;
                              } else {
                                setBrizLongPressed({
                                  id: briz.id,
                                  title: briz.title,
                                  metatags: briz.metatags,
                                  description: briz.description,
                                  text: briz.text,
                                });
                                setGridOnOff(true);
                                setBucketClicked(false);
                              }
                            }, 400);
                          }}
                          onMouseUp={() => {
                            clearTimeout(longPressTimeOut.current);
                          }}
                        >
                          {briz.coverImg !== "null" ? (
                            <Image
                              onMouseOver={() => {
                                setBrizMouseOn(briz.id);
                              }}
                              onClick={() => {
                                setBrizClicked(true);
                              }}
                              priority
                              src={`${briz.coverImg}`}
                              alt={`${briz.title}-${briz.description}`}
                              fill
                              placeholder="blur"
                              blurDataURL={briz.coverImg}
                              onLoadingComplete={() => {
                                setGrid({});
                                setBrizLoading(false);
                              }}
                              style={{
                                borderRadius: "clamp(1px,1vw,0.8rem)",
                                objectFit: "cover",
                              }}
                            ></Image>
                          ) : (
                            <motion.div className="relative h-full w-full ">
                              {briz.text ? (
                                <motion.span
                                  className="absolute flex h-full w-full flex-col break-words"
                                  style={{
                                    fontSize: `clamp(1px,${
                                      0.064 * (briz.text.fontSize + 10)
                                    }vw,${
                                      0.052 * (briz.text.fontSize + 10)
                                    }rem)`,
                                    color: briz.text.textColor,
                                    backgroundColor: briz.text.boxColor
                                      ? briz.text.boxColor
                                      : "",
                                    fontStyle: briz.text.italic ? "italic" : "",
                                    fontWeight: briz.text.bold,
                                    textAlign: briz.text
                                      .textRowAlign as textRowAlign,
                                    justifyContent: briz.text.textColAlign,
                                    borderRadius: "clamp(1px,1vw,0.8rem)",
                                  }}
                                >{`${briz.text.text}`}</motion.span>
                              ) : null}
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                className={cls(
                  "absolute  z-[101] flex aspect-square items-center justify-center overflow-hidden rounded-3xl border-4 border-gray-50 bg-white shadow-lg"
                )}
                style={{
                  height: `clamp(1px,10vw,8rem)`,
                  top: `clamp(1px,3.2vw,2.56rem)`,
                  right: `clamp(1px,2vw,1.6rem)`,
                }}
                whileHover={"hoverBox"}
                whileTap={{ scale: 1.08 }}
                variants={{
                  hoverBox: {
                    scale: 1.05,
                  },
                }}
                onClick={() => {
                  if (brizLongPressed) {
                    onSubmitGridEdit(
                      brizLongPressed.id!,
                      brizLongPressed.pinned!
                    );
                    setBrizLongPressed(undefined);
                    setGridOnOff((prev) => !prev);
                    setGrid({});
                    setDragIndex({});
                  } else setBucketClicked(true);
                }}
                key={"bucket"}
                layout
                layoutId={"bucket"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="8vw"
                  height="8vw"
                  viewBox="-110 -180 825 825"
                >
                  <path
                    d="M45.9 42.1c3-6.1 9.6-9.6 16.3-8.7L307 64 551.8 33.4c6.7-.8 13.3 2.7 16.3 8.7l41.7 83.4c9 17.9-.6 39.6-19.8 45.1L426.6 217.3c-13.9 4-28.8-1.9-36.2-14.3L307 64 223.6 203c-7.4 12.4-22.3 18.3-36.2 14.3L24.1 170.6C4.8 165.1-4.7 143.4 4.2 125.5L45.9 42.1zM308.1 128l54.9 91.4c14.9 24.8 44.6 36.6 72.5 28.6L563 211.6v167c0 22-15 41.2-36.4 46.6l-204.1 51c-10.2 2.6-20.9 2.6-31 0l-204.1-51C66 419.7 51 400.5 51 378.5v-167L178.6 248c27.8 8 57.6-3.8 72.5-28.6L305.9 128h2.2z"
                    fill={cls(
                      brizLongPressed ? "rgb(254 215 170)" : "",
                      getInBucketBrizData?.getInBucketBriz.getInBucketBriz
                        .length !== 0 && !brizLongPressed
                        ? "black"
                        : "",
                      getInBucketBrizData?.getInBucketBriz.getInBucketBriz
                        .length === 0 && !brizLongPressed
                        ? "rgb(229 231 235)"
                        : ""
                    )}
                  />
                </svg>
              </motion.div>
            )}
            {getPinnedBrizData?.getPinnedBriz.getPinnedBriz.map((briz, i) => (
              <AnimatePresence key={i}>
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative"
                  whileHover="hoverBox"
                >
                  <Link
                    legacyBehavior
                    href={`/briz/${brizUserName}/${briz.id}`}
                  >
                    <motion.div
                      key={briz.id}
                      layoutId={briz.id + "pinned"}
                      className="relative aspect-square overflow-hidden rounded-full border-4 border-gray-50 bg-white shadow-lg"
                      style={{
                        height: `clamp(1px,8vw,6.4rem)`,
                        margin: `clamp(1px,0.8vw,0.64rem)`,
                      }}
                      whileTap={{ scale: 1.08 }}
                      variants={{
                        hoverBox: {
                          scale: 1.05,
                        },
                      }}
                    >
                      <Image
                        priority
                        src={`${briz.coverImg}`}
                        alt={`${briz.title}-${briz.description}`}
                        fill
                        style={{
                          objectFit: "contain",
                        }}
                        onLoadingComplete={() => {
                          setGrid({});
                          setBrizLoading(false);
                        }}
                      ></Image>
                    </motion.div>
                  </Link>
                  <motion.span
                    className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl border-4 border-gray-50 bg-white px-4 py-1 font-bold  opacity-0 shadow-lg"
                    style={{
                      fontSize: `clamp(1px,
                      2vw,1.6rem)`,
                      bottom: `clamp(-2.4rem,
                        -3vw, -1px)`,
                    }}
                    variants={{
                      hoverBox: { opacity: 1 },
                    }}
                  >
                    {briz.title}
                  </motion.span>
                </motion.div>
              </AnimatePresence>
            ))}
            {getPinnedBrizData?.getPinnedBriz.getPinnedBriz.length === 0 ? (
              <AnimatePresence>
                <motion.span
                  layout
                  className={cls(
                    " absolute left-0 right-0 mx-auto border-4 border-white text-center font-extrabold"
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontSize: `clamp(1px,
                   5vw,4rem)`,
                  }}
                >
                  {capitalizeFirstLetter(
                    `${getOthersProfileData?.getOthersProfile.user?.username}`
                  ) + "'s Briz"}
                </motion.span>
              </AnimatePresence>
            ) : null}
          </motion.div>
        ) : null}
        {!getOthersProfileData?.getOthersProfile.ok &&
        !getOthersProfileLoading ? (
          <span className="fixed top-[15vw] w-full  bg-red-400 py-2 text-center text-2xl font-extrabold text-white">
            Nothing Found
          </span>
        ) : null}

        <motion.div className="relative mx-auto mt-0 h-auto max-w-7xl">
          {meData?.me.username === brizUserName ? (
            <>
              <AnimatePresence>
                {!brizLongPressed ? (
                  <motion.div
                    className="fixed bottom-16 left-1/2 z-[199] flex flex-row items-center justify-center rounded-2xl bg-white p-2 shadow-2xl"
                    initial={{ x: 180, opacity: 0 }}
                    animate={{ x: -90, opacity: 1 }}
                    exit={{ x: -360, opacity: 0 }}
                    drag
                    dragElastic={0.15}
                    dragConstraints={{
                      top: 0,
                      bottom: 0,
                      right: 20,
                      left: -200,
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                  >
                    <button
                      onClick={() => {
                        setOpenAiOnOff((prev) => !prev);
                      }}
                      className={cls(
                        "mx-2 flex aspect-square  cursor-pointer items-center justify-center rounded-2xl bg-red-300 p-2 shadow-lg transition-all hover:bg-red-400 active:scale-105"
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="50"
                        height="50"
                        viewBox="-112 -40 580 580"
                      >
                        <path
                          d="M281.2 248.9C295.6 228.3 304 203.2 304 176c0-70.7-57.3-128-128-128S48 105.3 48 176c0 27.2 8.4 52.3 22.8 72.9c3.7 5.3 8.1 11.3 12.8 17.7l0 0c12.9 17.7 28.3 38.9 39.8 59.8c10.4 19 15.7 38.8 18.3 57.5H93c-2.2-12-5.9-23.7-11.8-34.5c-9.9-18-22.2-34.9-34.5-51.8l0 0 0 0c-5.2-7.1-10.4-14.2-15.4-21.4C11.6 247.9 0 213.3 0 176C0 78.8 78.8 0 176 0s176 78.8 176 176c0 37.3-11.6 71.9-31.4 100.3c-5 7.2-10.2 14.3-15.4 21.4l0 0 0 0c-12.3 16.8-24.6 33.7-34.5 51.8c-5.9 10.8-9.6 22.5-11.8 34.5H210.4c2.6-18.7 7.9-38.6 18.3-57.5c11.5-20.9 26.9-42.1 39.8-59.8l0 0 0 0 0 0c4.7-6.4 9-12.4 12.7-17.7zM176 128c-26.5 0-48 21.5-48 48c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-44.2 35.8-80 80-80c8.8 0 16 7.2 16 16s-7.2 16-16 16zm0 384c-44.2 0-80-35.8-80-80V416H256v16c0 44.2-35.8 80-80 80z"
                          fill="white"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setGridOnOff((prev) => !prev);
                      }}
                      className={cls(
                        "mx-2 flex  aspect-square  cursor-pointer items-center justify-center rounded-2xl bg-red-300 p-2 shadow-xl transition-all hover:bg-red-400 active:scale-105"
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="50"
                        height="50"
                        viewBox="0 -60 625 625"
                      >
                        <path
                          d="M115.2 0C84.7 0 58.5 21.5 52.5 51.4L1.3 307.4C-6.6 347 23.6 384 64 384H281v64H217c-17.7 0-32 14.3-32 32s14.3 32 32 32H409c17.7 0 32-14.3 32-32s-14.3-32-32-32H345V384H562c40.4 0 70.7-36.9 62.8-76.6l-51.2-256C567.5 21.5 541.3 0 510.8 0H115.2zM253.9 64H372.1l10.4 104h-139L253.9 64zM195.3 168H94.4L115.2 64h90.4L195.3 168zM84.8 216H190.5L180.1 320H64L84.8 216zm153.9 0H387.3l10.4 104-169.4 0 10.4-104zm196.8 0H541.2L562 320h-116L435.5 216zm96-48H430.7L420.3 64h90.4l31.4-6.3L510.8 64l20.8 104z"
                          fill="white"
                        />
                      </svg>
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <AnimatePresence>
                {brizLongPressed ? (
                  <motion.div
                    className="fixed bottom-16 left-1/2 z-[199] flex flex-row items-center justify-center rounded-2xl bg-white p-2 shadow-2xl"
                    initial={{ x: 135, opacity: 0 }}
                    animate={{ x: -135, opacity: 1 }}
                    exit={{ x: -405, opacity: 0 }}
                    drag
                    dragElastic={0.15}
                    dragConstraints={{
                      top: 0,
                      bottom: 0,
                      right: -25,
                      left: -245,
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                  >
                    {mouseOnLayerBtn ? (
                      <div
                        className="mx-2 flex aspect-square flex-col items-center justify-between rounded-2xl"
                        onMouseLeave={() => {
                          setMouseOnLayerBtn(false);
                        }}
                      >
                        <button
                          onClick={() => {
                            onClickUpZindex(
                              brizLongPressed.id!,
                              brizLongPressed.zindex!
                            );

                            setBrizLongPressed(undefined);
                            setGridOnOff((prev) => !prev);
                          }}
                          className={cls(
                            " flex cursor-pointer items-center justify-center rounded-xl bg-orange-200 px-2 py-1  shadow-xl transition-all hover:bg-orange-300 active:scale-105",
                            mouseOnLayerBtn ? "" : "hidden"
                          )}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="50"
                            height="23"
                            viewBox="-10 -20 325 325"
                          >
                            <path
                              d="M182.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z "
                              fill="white"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            onClickDownZindex(
                              brizLongPressed.id!,
                              brizLongPressed.zindex!
                            );

                            setBrizLongPressed(undefined);
                            setGridOnOff((prev) => !prev);
                          }}
                          className={cls(
                            "flex aspect-auto cursor-pointer items-center  justify-center rounded-xl bg-orange-200 py-1 px-2  shadow-xl transition-all hover:bg-orange-300 active:scale-105"
                          )}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="50"
                            height="23"
                            viewBox="-10 210 325 325"
                          >
                            <path
                              d="M182.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9s16.6-19.8 29.6-19.8H288c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128z"
                              fill="white"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onMouseEnter={() => {
                          setMouseOnLayerBtn(true);
                        }}
                        className={cls(
                          "mx-2 flex  aspect-square  cursor-pointer items-center justify-center rounded-2xl bg-orange-200 p-2 shadow-xl transition-all hover:bg-orange-300 active:scale-105"
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="50"
                          height="50"
                          viewBox="-30 -60 625 625"
                        >
                          <path
                            d="M264.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 149.8C37.4 145.8 32 137.3 32 128s5.4-17.9 13.9-21.8L264.5 5.2zM476.9 209.6l53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 277.8C37.4 273.8 32 265.3 32 256s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0l152-70.2zm-152 198.2l152-70.2 53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 405.8C37.4 401.8 32 393.3 32 384s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0z"
                            fill="white"
                          />
                        </svg>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditClicked({
                          id: brizLongPressed.id!,
                          briztype: brizLongPressed.text ? "text" : "image",
                        });
                        setValueEditBriz("editBriz", {
                          title: brizLongPressed.title,
                          description: brizLongPressed.description,
                          metatags: brizLongPressed.metatags,
                          text: brizLongPressed.text,
                        });
                        setBrizLongPressed(undefined);
                        setGridOnOff((prev) => !prev);
                      }}
                      className={cls(
                        "mx-2 flex  aspect-square  cursor-pointer items-center justify-center rounded-2xl bg-orange-200 p-2 shadow-xl transition-all hover:bg-orange-300 active:scale-105"
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="50"
                        height="50"
                        viewBox="-50 -60 625 625"
                      >
                        <path
                          d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"
                          fill="white"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        onClickDelete(brizLongPressed.id!);
                        setBrizLongPressed(undefined);
                        setGridOnOff((prev) => !prev);
                      }}
                      className={cls(
                        "mx-2 flex aspect-square  cursor-pointer items-center justify-center rounded-2xl bg-orange-200 p-2 shadow-lg transition-all hover:bg-orange-300 active:scale-105"
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="50"
                        height="50"
                        viewBox="-65 -40 580 580"
                      >
                        <path
                          d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                          fill="white"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setBrizLongPressed(undefined);
                        setTextBold("500");
                        setTextItalic(false);
                        setTextRowAlign("center");
                        setTextColAlign("center");
                        setGridOnOff((prev) => !prev);
                      }}
                      className={cls(
                        "mx-2 flex  aspect-square  cursor-pointer items-center justify-center rounded-2xl bg-red-300 p-2 shadow-xl transition-all hover:bg-red-400 active:scale-105"
                      )}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="50"
                        height="50"
                        viewBox="-55 -60 625 625"
                      >
                        <path
                          d="M175 175C184.4 165.7 199.6 165.7 208.1 175L255.1 222.1L303 175C312.4 165.7 327.6 165.7 336.1 175C346.3 184.4 346.3 199.6 336.1 208.1L289.9 255.1L336.1 303C346.3 312.4 346.3 327.6 336.1 336.1C327.6 346.3 312.4 346.3 303 336.1L255.1 289.9L208.1 336.1C199.6 346.3 184.4 346.3 175 336.1C165.7 327.6 165.7 312.4 175 303L222.1 255.1L175 208.1C165.7 199.6 165.7 184.4 175 175V175zM0 96C0 60.65 28.65 32 64 32H448C483.3 32 512 60.65 512 96V416C512 451.3 483.3 480 448 480H64C28.65 480 0 451.3 0 416V96zM48 96V416C48 424.8 55.16 432 64 432H448C456.8 432 464 424.8 464 416V96C464 87.16 456.8 80 448 80H64C55.16 80 48 87.16 48 96z"
                          fill="white"
                        />
                      </svg>
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </>
          ) : null}
          <AnimatePresence>
            {gridOnOff && !brizLoading ? (
              <div className="absolute left-1/2 z-[198] grid  -translate-x-1/2 grid-cols-[repeat(24,clamp(0px,3.8vw,3.34rem))] ">
                {baseGrid.map((id, i) => (
                  <motion.div
                    draggable
                    onDragStart={() => {
                      setDragIndex({
                        ...dragIndex,
                        colStartIndex: i % 24,
                        rowStartIndex: Math.floor(i / 24),
                      });
                    }}
                    onDragOver={() => {
                      setDragIndex({
                        ...dragIndex,
                        colEndIndex: i % 24,
                        rowEndIndex: Math.floor(i / 24),
                      });
                      if (
                        dragIndex.colStartIndex! <= dragIndex.colEndIndex! &&
                        dragIndex.rowStartIndex! <= dragIndex.rowEndIndex!
                      ) {
                        setGrid({
                          colStart: dragIndex.colStartIndex! + 1,
                          rowStart: dragIndex.rowStartIndex! + 1,
                          colEnd: dragIndex.colEndIndex! + 2,
                          rowEnd: dragIndex.rowEndIndex! + 2,
                        });
                      }
                      if (
                        dragIndex.colStartIndex! >= dragIndex.colEndIndex! &&
                        dragIndex.rowStartIndex! <= dragIndex.rowEndIndex!
                      ) {
                        setGrid({
                          colStart: dragIndex.colEndIndex! + 1,
                          rowStart: dragIndex.rowStartIndex! + 1,
                          colEnd: dragIndex.colStartIndex! + 2,
                          rowEnd: dragIndex.rowEndIndex! + 2,
                        });
                      }
                      if (
                        dragIndex.colStartIndex! <= dragIndex.colEndIndex! &&
                        dragIndex.rowStartIndex! >= dragIndex.rowEndIndex!
                      ) {
                        setGrid({
                          colStart: dragIndex.colStartIndex! + 1,
                          rowStart: dragIndex.rowEndIndex! + 1,
                          colEnd: dragIndex.colEndIndex! + 2,
                          rowEnd: dragIndex.rowStartIndex! + 2,
                        });
                      }
                      if (
                        dragIndex.colStartIndex! >= dragIndex.colEndIndex! &&
                        dragIndex.rowStartIndex! >= dragIndex.rowEndIndex!
                      ) {
                        setGrid({
                          colStart: dragIndex.colEndIndex! + 1,
                          rowStart: dragIndex.rowEndIndex! + 1,
                          colEnd: dragIndex.colStartIndex! + 2,
                          rowEnd: dragIndex.rowStartIndex! + 2,
                        });
                      }
                    }}
                    onDragEnd={() => {
                      if (brizLongPressed) {
                        onSubmitGridEdit(
                          brizLongPressed.id!,
                          brizLongPressed.pinned!
                        );
                        setBrizLongPressed(undefined);
                        setGridOnOff((prev) => !prev);
                        setGrid({});
                        setDragIndex({});
                      } else setDragged(true);
                    }}
                    key={i}
                    variants={gridOnOffVar}
                    initial="hidden"
                    animate={!brizLongPressed ? "visibleCreate" : "visibleEdit"}
                    exit="exit"
                    transition={{ delay: i * 0.001 }}
                    className={cls(
                      `aspect-square w-full scale-95 rounded-md opacity-10 transition-all hover:opacity-40 active:scale-100`,
                      i % 24 <= dragIndex!.colEndIndex! % 24 &&
                        i % 24 >= dragIndex!.colStartIndex! % 24 &&
                        Math.floor(i / 24) <= dragIndex!.rowEndIndex! &&
                        Math.floor(i / 24) >= dragIndex!.rowStartIndex! &&
                        !brizLoading
                        ? "scale-100 opacity-40"
                        : "",
                      dragIndex!.colStartIndex! > dragIndex!.colEndIndex!
                        ? i % 24 >= dragIndex!.colEndIndex! % 24 &&
                          i % 24 <= dragIndex!.colStartIndex! % 24 &&
                          Math.floor(i / 24) <= dragIndex!.rowEndIndex! &&
                          Math.floor(i / 24) >= dragIndex!.rowStartIndex! &&
                          !brizLoading
                          ? "scale-100  opacity-40"
                          : ""
                        : "",
                      dragIndex!.rowStartIndex! > dragIndex!.rowEndIndex!
                        ? i % 24 <= dragIndex!.colEndIndex! % 24 &&
                          i % 24 >= dragIndex!.colStartIndex! % 24 &&
                          Math.floor(i / 24) >= dragIndex!.rowEndIndex! &&
                          Math.floor(i / 24) <= dragIndex!.rowStartIndex! &&
                          !brizLoading
                          ? "scale-100  opacity-40"
                          : ""
                        : "",
                      dragIndex!.rowStartIndex! > dragIndex!.rowEndIndex! &&
                        dragIndex!.colStartIndex! > dragIndex!.colEndIndex!
                        ? i % 24 >= dragIndex!.colEndIndex! % 24 &&
                          i % 24 <= dragIndex!.colStartIndex! % 24 &&
                          Math.floor(i / 24) >= dragIndex!.rowEndIndex! &&
                          Math.floor(i / 24) <= dragIndex!.rowStartIndex! &&
                          !brizLoading
                          ? "scale-100  opacity-40"
                          : ""
                        : ""
                    )}
                  ></motion.div>
                ))}
              </div>
            ) : null}
          </AnimatePresence>

          <motion.div
            className="absolute left-1/2 grid -translate-x-1/2 grid-cols-[repeat(24,clamp(0px,3.8vw,3.34rem))] pb-[13rem]"
            style={{
              gridTemplateRows: `repeat(${gridRowNumber},clamp(0px,3.8vw,3.34rem))`,
            }}
          >
            <>
              <AnimatePresence>
                <motion.div
                  layout
                  className={cls(
                    `relative rounded-xl`,
                    brizLoading ? "bg-gray-50 opacity-30 shadow-lg" : ""
                  )}
                  style={{
                    gridColumn: `${grid.colStart}/${grid.colEnd}`,
                    gridRow: `${grid.rowStart}/${grid.rowEnd}`,
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                >
                  {brizLoading ? <ThreeDotsWave /> : null}
                </motion.div>
              </AnimatePresence>
              <AnimatePresence>
                {getBrizData?.getBriz.getBriz.map((briz) => (
                  <motion.div
                    key={briz.id}
                    layout
                    layoutId={briz.id + ""}
                    initial="initial"
                    animate={
                      brizLongPressed && brizLongPressed.id === briz.id
                        ? "selected"
                        : "normal"
                    }
                    exit="exit"
                    whileHover="hoverBox"
                    variants={{
                      initial: { opacity: 0 },
                      normal: { opacity: 1 },
                      selected: { opacity: 0.3, scale: 1.05 },
                      exit: { opacity: 0 },
                      hoverBox: { scale: 1.03 },
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                    className={cls(
                      `relative m-[0.6vw] flex items-center justify-center object-scale-down`,
                      briz.id === brizMouseOn && brizClicked ? "hidden" : ""
                    )}
                    style={{
                      gridColumn: `${briz.grid!.colStart}/${briz.grid!.colEnd}`,
                      gridRow: `${briz.grid!.rowStart}/${briz.grid!.rowEnd}`,
                      zIndex: `${briz.zindex}`,
                    }}
                    onMouseDown={() => {
                      longPressTimeOut.current = window.setTimeout(() => {
                        if (meData?.me.username !== brizUserName) {
                          return null;
                        } else {
                          setBrizLongPressed({
                            id: briz.id,
                            title: briz.title,
                            metatags: briz.metatags,
                            description: briz.description,
                            text: briz.text,
                            zindex: briz.zindex,
                          });
                          setTextBold(briz.text?.bold!);
                          setTextItalic(briz.text?.italic!);
                          setTextRowAlign(briz.text?.textRowAlign!);
                          setTextColAlign(briz.text?.textColAlign!);
                          setGridOnOff(true);
                        }
                      }, 400);
                    }}
                    onMouseUp={() => {
                      clearTimeout(longPressTimeOut.current);
                    }}
                  >
                    {briz.coverImg !== "null" ? (
                      <Image
                        onMouseOver={() => {
                          setBrizMouseOn(briz.id);
                        }}
                        onClick={() => {
                          setBrizClicked(true);
                        }}
                        priority
                        src={`${briz.coverImg}`}
                        alt={`${briz.title}-${briz.description}`}
                        fill
                        placeholder="blur"
                        blurDataURL={briz.coverImg}
                        onLoadingComplete={() => {
                          setGrid({});
                          setBrizLoading(false);
                        }}
                        style={{ borderRadius: "clamp(1px,1vw,0.8rem)" }}
                      ></Image>
                    ) : (
                      <motion.div className="relative h-full w-full">
                        {briz.text ? (
                          <motion.span
                            className="absolute flex h-full w-full flex-col break-words"
                            style={{
                              fontSize: `clamp(1px,${
                                0.064 * (briz.text.fontSize + 10)
                              }vw,${0.052 * (briz.text.fontSize + 10)}rem)`,
                              color: briz.text.textColor,
                              backgroundColor: briz.text.boxColor
                                ? briz.text.boxColor
                                : "",
                              fontStyle: briz.text.italic ? "italic" : "",
                              fontWeight: briz.text.bold,
                              textAlign: briz.text.textRowAlign as textRowAlign,
                              justifyContent: briz.text.textColAlign,
                              borderRadius: "clamp(1px,1vw,0.8rem)",
                            }}
                          >{`${briz.text.text}`}</motion.span>
                        ) : null}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </>
          </motion.div>
        </motion.div>
        <AnimatePresence>
          {brizClicked ? (
            <>
              {bucketClicked ? (
                <>
                  <motion.div
                    className="fixed top-0 left-0 z-[300] h-screen w-full bg-gray-500 "
                    initial={{ opacity: 0 }}
                    onClick={() => {
                      setBrizClicked(undefined);
                    }}
                    exit={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                  ></motion.div>
                  <motion.div
                    layout
                    className=" absolute left-0 right-0 z-[301] mx-auto max-w-lg rounded-3xl bg-white p-6 pb-8 opacity-0 shadow-lg"
                    style={{ top: scrollY.get() + 100 }}
                    exit={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layoutId={brizMouseOn + ""}
                  >
                    {getInBucketBrizData?.getInBucketBriz.getInBucketBriz.map(
                      (briz, i) => {
                        if (briz.id === brizMouseOn) {
                          return (
                            <motion.div key={i}>
                              <motion.span
                                className="block text-center text-3xl font-bold"
                                style={{ textShadow: "#ff0000 0px 2px 20px" }}
                              >
                                {briz.title}
                              </motion.span>
                              <motion.div
                                className=" relative my-4 aspect-square w-full overflow-hidden rounded-xl bg-gray-50 shadow-lg"
                                whileTap={{ scale: 1.05 }}
                                onClick={() => {
                                  setBrizClicked(undefined);
                                }}
                              >
                                <Image
                                  priority
                                  src={`${briz.coverImg}`}
                                  alt={`${briz.title}-${briz.description}`}
                                  fill
                                  style={{
                                    objectFit: "contain",
                                  }}
                                  onLoadingComplete={() => {
                                    setGrid({});
                                    setBrizLoading(false);
                                  }}
                                ></Image>
                              </motion.div>
                              <motion.span className="block text-left text-xl font-medium">
                                {briz.metatags}
                              </motion.span>
                              <motion.span className="block text-center text-xl font-medium">
                                {briz.description}
                              </motion.span>
                            </motion.div>
                          );
                        }
                      }
                    )}
                  </motion.div>
                </>
              ) : (
                <>
                  {" "}
                  <motion.div
                    className="fixed top-0 left-0 z-[200] h-screen w-full bg-gray-500 "
                    initial={{ opacity: 0 }}
                    onClick={onOverlayClick}
                    exit={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                  ></motion.div>
                  <motion.div
                    layout
                    className=" absolute left-0 right-0 z-[201] mx-auto max-w-lg rounded-3xl bg-white p-6 pb-8 opacity-0 shadow-lg"
                    style={{ top: scrollY.get() + 100 }}
                    exit={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layoutId={brizMouseOn + ""}
                  >
                    {getBrizData?.getBriz.getBriz.map((briz, i) => {
                      if (briz.id === brizMouseOn) {
                        return (
                          <motion.div key={i}>
                            <motion.span
                              className="block text-center text-3xl font-bold"
                              style={{ textShadow: "#ff0000 0px 2px 20px" }}
                            >
                              {briz.title}
                            </motion.span>
                            <Link
                              legacyBehavior
                              href={`/briz/${brizUserName}/${briz.id}`}
                            >
                              <motion.div
                                className=" relative my-4 aspect-square w-full overflow-hidden rounded-xl bg-gray-50 shadow-lg"
                                whileTap={{ scale: 1.05 }}
                                onClick={() => {
                                  setBrizClicked(undefined);
                                }}
                              >
                                <Image
                                  priority
                                  src={`${briz.coverImg}`}
                                  alt={`${briz.title}-${briz.description}`}
                                  fill
                                  style={{
                                    objectFit: "contain",
                                  }}
                                  onLoadingComplete={() => {
                                    setGrid({});
                                    setBrizLoading(false);
                                  }}
                                ></Image>
                              </motion.div>
                            </Link>
                            <button
                              onClick={() => {
                                onClickPinned(briz.id, !briz.pinned);
                              }}
                              className={cls(
                                " absolute right-2 top-2 flex aspect-square cursor-pointer items-center justify-center rounded-2xl p-1 shadow-xl transition-all hover:scale-105"
                              )}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="35"
                                height="35"
                                viewBox="-125 -80 625 625"
                              >
                                <path
                                  d="M32 32C32 14.3 46.3 0 64 0H320c17.7 0 32 14.3 32 32s-14.3 32-32 32H290.5l11.4 148.2c36.7 19.9 65.7 53.2 79.5 94.7l1 3c3.3 9.8 1.6 20.5-4.4 28.8s-15.7 13.3-26 13.3H32c-10.3 0-19.9-4.9-26-13.3s-7.7-19.1-4.4-28.8l1-3c13.8-41.5 42.8-74.8 79.5-94.7L93.5 64H64C46.3 64 32 49.7 32 32zM160 384h64v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V384z"
                                  fill={
                                    briz.pinned ? "black" : "rgb(229 231 235)"
                                  }
                                />
                              </svg>
                            </button>
                            <motion.span className="block text-left text-xl font-medium">
                              {briz.metatags}
                            </motion.span>
                            <motion.span className="block text-center text-xl font-medium">
                              {briz.description}
                            </motion.span>
                          </motion.div>
                        );
                      }
                    })}
                  </motion.div>
                </>
              )}
            </>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {dragged ? (
            <>
              <motion.div
                className="fixed top-0 left-0 z-[200] h-screen w-full bg-gray-500 opacity-0"
                onClick={onOverlayClick}
                exit={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              ></motion.div>
              <motion.div
                className=" absolute  left-0 right-0  z-[201]  mx-auto max-w-md  rounded-3xl bg-white p-6 pb-8 opacity-0 shadow-lg"
                style={{ top: scrollY.get() + 100 }}
                exit={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-center text-3xl font-bold">New Briz</h3>
                <div className="mt-4 px-4 max-sm:px-0 ">
                  <form
                    className="mx-auto mt-6 flex w-80 flex-col space-y-4  max-sm:w-72 "
                    onSubmit={handleSubmit(onSubmitCreate)}
                  >
                    <div>
                      <button
                        className={cls(
                          "text-md mr-1 rounded-lg  px-2 py-1 font-bold ",
                          inputToggle
                            ? "bg-white text-gray-500"
                            : "bg-red-500 text-white"
                        )}
                        onClick={() => {
                          setInputToggle(false);
                          resetField("text");
                        }}
                      >
                        Image
                      </button>
                      <button
                        className={cls(
                          "text-md mr-1 rounded-lg px-2 py-1 font-bold ",
                          inputToggle
                            ? "bg-red-500 text-white"
                            : "bg-white text-gray-500"
                        )}
                        onClick={() => {
                          setInputToggle(true);
                          resetField("coverImg");
                        }}
                      >
                        Text
                      </button>
                    </div>
                    {!inputToggle ? (
                      <>
                        <Input
                          label="Image"
                          name="coverImg"
                          type="file"
                          required
                          tab
                          accept="image/*"
                          register={register("coverImg")}
                        />
                        <Input
                          label="Title"
                          name="title"
                          type="text"
                          placeholder="Title"
                          required
                          register={register("title")}
                        />
                        <Input
                          label="Tags"
                          name="metatags"
                          type="text"
                          placeholder="#add #tags #about #this #briz"
                          required
                          register={register("metatags")}
                        />
                        <Input
                          label="Description"
                          name="description"
                          type="textarea"
                          placeholder="Write a description"
                          required
                          register={register("description")}
                        />
                      </>
                    ) : (
                      <>
                        <Input
                          tab
                          label="Text"
                          name="text"
                          type="text"
                          placeholder="Write anything"
                          required
                          register={register("text.text")}
                        />
                        <Input
                          label="Title"
                          name="title"
                          type="text"
                          placeholder="Title"
                          required
                          register={register("title")}
                        />
                        <Input
                          label="Tags"
                          name="metatags"
                          type="text"
                          placeholder="#add #tags #about #this #briz"
                          required
                          register={register("metatags")}
                        />
                        <motion.div className="flex w-full flex-row justify-evenly rounded-xl bg-gray-50 py-2">
                          <motion.div className="flex flex-col">
                            <Input
                              label="Font Size"
                              name="fontSize"
                              type="range"
                              placeholder="fontSize"
                              required
                              register={register("text.fontSize")}
                            />
                            <motion.div className="flex flex-row">
                              <motion.div className="mr-2 w-1/2">
                                <Input
                                  label="Font Color"
                                  name="textColor"
                                  type="color"
                                  placeholder="textColor"
                                  required
                                  register={register("text.textColor")}
                                />
                              </motion.div>
                              <motion.div className="relative w-1/2">
                                <motion.span
                                  className={cls(
                                    "text-md mb-1 block  cursor-pointer font-semibold ",
                                    boxColorOnOff
                                      ? "text-gray-400"
                                      : "text-gray-700"
                                  )}
                                  onClick={() => {
                                    setBoxColorOnOff((prev) => !prev);
                                  }}
                                >
                                  Box Color
                                </motion.span>
                                <motion.div className="absolute left-4 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="45"
                                    height="45"
                                    viewBox="-80 -60 625 625"
                                  >
                                    <path
                                      d="M175 175C184.4 165.7 199.6 165.7 208.1 175L255.1 222.1L303 175C312.4 165.7 327.6 165.7 336.1 175C346.3 184.4 346.3 199.6 336.1 208.1L289.9 255.1L336.1 303C346.3 312.4 346.3 327.6 336.1 336.1C327.6 346.3 312.4 346.3 303 336.1L255.1 289.9L208.1 336.1C199.6 346.3 184.4 346.3 175 336.1C165.7 327.6 165.7 312.4 175 303L222.1 255.1L175 208.1C165.7 199.6 165.7 184.4 175 175V175zM0 96C0 60.65 28.65 32 64 32H448C483.3 32 512 60.65 512 96V416C512 451.3 483.3 480 448 480H64C28.65 480 0 451.3 0 416V96zM48 96V416C48 424.8 55.16 432 64 432H448C456.8 432 464 424.8 464 416V96C464 87.16 456.8 80 448 80H64C55.16 80 48 87.16 48 96z"
                                      fill="gray"
                                    />
                                  </svg>
                                </motion.div>
                                <motion.div
                                  className={cls(boxColorOnOff ? "hidden" : "")}
                                >
                                  <Input
                                    label=""
                                    name="boxColor"
                                    type="color"
                                    placeholder="boxColor"
                                    required
                                    register={register("text.boxColor")}
                                  />
                                </motion.div>
                              </motion.div>
                            </motion.div>
                          </motion.div>
                          <motion.div className="flex flex-col items-center justify-end">
                            <motion.div className="mb-1 flex flex-row rounded-lg border border-gray-300 px-2 py-1">
                              <motion.div
                                className={cls(
                                  "mr-1",
                                  textBold === "700"
                                    ? " rounded-md bg-red-300"
                                    : "",
                                  textBold === "900"
                                    ? "rounded-md bg-red-400"
                                    : ""
                                )}
                                onClick={() => {
                                  if (textBold === "500") {
                                    setTextBold("700");
                                  } else if (textBold === "700") {
                                    setTextBold("900");
                                  } else if (textBold === "900") {
                                    setTextBold("500");
                                  }
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="25"
                                  height="25"
                                  viewBox="-120 -60 625 625"
                                >
                                  <path d="M0 64C0 46.3 14.3 32 32 32H80 96 224c70.7 0 128 57.3 128 128c0 31.3-11.3 60.1-30 82.3c37.1 22.4 62 63.1 62 109.7c0 70.7-57.3 128-128 128H96 80 32c-17.7 0-32-14.3-32-32s14.3-32 32-32H48V256 96H32C14.3 96 0 81.7 0 64zM224 224c35.3 0 64-28.7 64-64s-28.7-64-64-64H112V224H224zM112 288V416H256c35.3 0 64-28.7 64-64s-28.7-64-64-64H224 112z" />
                                </svg>
                              </motion.div>
                              <motion.div
                                className={cls(
                                  textItalic ? " rounded-md bg-red-300" : ""
                                )}
                                onClick={() => {
                                  setTextItalic((prev) => !prev);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="25"
                                  height="25"
                                  viewBox="-120 -60 625 625"
                                >
                                  <path d="M128 64c0-17.7 14.3-32 32-32H352c17.7 0 32 14.3 32 32s-14.3 32-32 32H293.3L160 416h64c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H90.7L224 96H160c-17.7 0-32-14.3-32-32z" />
                                </svg>
                              </motion.div>
                            </motion.div>
                            <motion.div className="mb-1 flex flex-row rounded-lg border border-gray-300 px-2 py-1">
                              <motion.div
                                className={cls(
                                  "mr-1",
                                  textRowAlign === "left"
                                    ? " rounded-md bg-red-300"
                                    : ""
                                )}
                                onClick={() => {
                                  setTextRowAlign("left");
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="25"
                                  height="25"
                                  viewBox="-90 -60 625 625"
                                >
                                  <path d="M288 64c0 17.7-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32H256c17.7 0 32 14.3 32 32zm0 256c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H256c17.7 0 32 14.3 32 32zM0 192c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
                                </svg>
                              </motion.div>
                              <motion.div
                                className={cls(
                                  "mr-1",
                                  textRowAlign === "center"
                                    ? " rounded-md bg-red-300"
                                    : ""
                                )}
                                onClick={() => {
                                  setTextRowAlign("center");
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="25"
                                  height="25"
                                  viewBox="-90 -60 625 625"
                                >
                                  <path d="M352 64c0-17.7-14.3-32-32-32H128c-17.7 0-32 14.3-32 32s14.3 32 32 32H320c17.7 0 32-14.3 32-32zm96 128c0-17.7-14.3-32-32-32H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32-14.3 32-32zM0 448c0 17.7 14.3 32 32 32H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H32c-17.7 0-32 14.3-32 32zM352 320c0-17.7-14.3-32-32-32H128c-17.7 0-32 14.3-32 32s14.3 32 32 32H320c17.7 0 32-14.3 32-32z" />
                                </svg>
                              </motion.div>
                              <motion.div
                                className={cls(
                                  textRowAlign === "right"
                                    ? " rounded-md bg-red-300"
                                    : ""
                                )}
                                onClick={() => {
                                  setTextRowAlign("right");
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="25"
                                  height="25"
                                  viewBox="-90 -60 625 625"
                                >
                                  <path d="M448 64c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32zm0 256c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32zM0 192c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
                                </svg>
                              </motion.div>
                            </motion.div>
                            <motion.div className="flex flex-row rounded-lg border border-gray-300 px-2 py-1">
                              <motion.div
                                className={cls(
                                  "mr-1",
                                  textColAlign === "start"
                                    ? " rounded-md bg-red-300"
                                    : ""
                                )}
                                onClick={() => {
                                  setTextColAlign("start");
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="25"
                                  height="25"
                                  viewBox="-30 -60 625 625"
                                >
                                  <path d="M32 96l512 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32C14.3 32 0 46.3 0 64S14.3 96 32 96zM9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L96 237.3 96 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 41.4 41.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0l-96 96zm320 45.3c12.5 12.5 32.8 12.5 45.3 0L416 237.3 416 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 41.4 41.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3z" />
                                </svg>
                              </motion.div>
                              <motion.div
                                className={cls(
                                  "mr-1",
                                  textColAlign === "center"
                                    ? " rounded-md bg-red-300"
                                    : ""
                                )}
                                onClick={() => {
                                  setTextColAlign("center");
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="25"
                                  height="25"
                                  viewBox="-30 -60 625 625"
                                >
                                  <path d="M137.4 502.6c12.5 12.5 32.8 12.5 45.3 0l96-96c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 402.7V288H544c17.7 0 32-14.3 32-32s-14.3-32-32-32H448V109.3l41.4 41.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L384 109.3V224H192 128 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96V402.7L86.6 361.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l96 96zM128 192h64V64c0-17.7-14.3-32-32-32s-32 14.3-32 32V192zM448 320H384V448c0 17.7 14.3 32 32 32s32-14.3 32-32V320z" />
                                </svg>
                              </motion.div>
                              <motion.div
                                className={cls(
                                  textColAlign === "end"
                                    ? " rounded-md bg-red-300"
                                    : ""
                                )}
                                onClick={() => {
                                  setTextColAlign("end");
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="25"
                                  height="25"
                                  viewBox="-30 -60 625 625"
                                >
                                  <path d="M544 416L32 416c-17.7 0-32 14.3-32 32s14.3 32 32 32l512 0c17.7 0 32-14.3 32-32s-14.3-32-32-32zm22.6-137.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L480 274.7 480 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 210.7-41.4-41.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0l96-96zm-320-45.3c-12.5-12.5-32.8-12.5-45.3 0L160 274.7 160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 210.7L54.6 233.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0l96-96c12.5-12.5 12.5-32.8 0-45.3z" />
                                </svg>
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </>
                    )}
                    <Button text={"Create a Briz"} />
                  </form>
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {editClicked ? (
            <>
              <motion.div
                className="fixed top-0 left-0 z-[200] h-screen w-full bg-gray-500 opacity-0"
                onClick={onOverlayClick}
                exit={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              ></motion.div>
              <motion.div
                className=" absolute  left-0 right-0  z-[201]  mx-auto max-w-md  rounded-3xl bg-white p-6 pb-8 opacity-0 shadow-lg"
                style={{ top: scrollY.get() + 100 }}
                exit={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-center text-3xl font-bold">Edit Briz</h3>
                <div className="mt-4 px-4 max-sm:px-0 ">
                  <form
                    className="mx-auto mt-6 flex w-80 flex-col space-y-4  max-sm:w-72 "
                    onSubmit={handleSubmitEditBriz(onSubmitEdit)}
                  >
                    {editClicked.briztype === "text" ? (
                      <Input
                        label="Text"
                        name="text"
                        type="text"
                        placeholder="Text"
                        required
                        register={registerEditBriz("editBriz.text.text")}
                      />
                    ) : null}

                    <Input
                      label="Title"
                      name="title"
                      type="text"
                      placeholder="Title"
                      required
                      register={registerEditBriz("editBriz.title")}
                    />
                    <Input
                      label="Tags"
                      name="metatags"
                      type="text"
                      placeholder="#add #tags #about #this #briz"
                      required
                      register={registerEditBriz("editBriz.metatags")}
                    />
                    {editClicked.briztype === "text" ? (
                      <motion.div className="flex w-full flex-row justify-evenly rounded-xl bg-gray-50 py-2">
                        <motion.div className="flex flex-col">
                          <Input
                            label="Font Size"
                            name="fontSize"
                            type="range"
                            placeholder="fontSize"
                            required
                            register={registerEditBriz(
                              "editBriz.text.fontSize"
                            )}
                          />
                          <motion.div className="flex flex-row">
                            <motion.div className="mr-2 w-1/2">
                              <Input
                                label="Font Color"
                                name="textColor"
                                type="color"
                                placeholder="textColor"
                                required
                                register={registerEditBriz(
                                  "editBriz.text.textColor"
                                )}
                              />
                            </motion.div>
                            <motion.div className="relative w-1/2">
                              <motion.span
                                className={cls(
                                  "text-md mb-1 block  cursor-pointer font-semibold ",
                                  boxColorOnOff
                                    ? "text-gray-400"
                                    : "text-gray-700"
                                )}
                                onClick={() => {
                                  setBoxColorOnOff((prev) => !prev);
                                }}
                              >
                                Box Color
                              </motion.span>
                              <motion.div className="absolute left-4 ">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="45"
                                  height="45"
                                  viewBox="-80 -60 625 625"
                                >
                                  <path
                                    d="M175 175C184.4 165.7 199.6 165.7 208.1 175L255.1 222.1L303 175C312.4 165.7 327.6 165.7 336.1 175C346.3 184.4 346.3 199.6 336.1 208.1L289.9 255.1L336.1 303C346.3 312.4 346.3 327.6 336.1 336.1C327.6 346.3 312.4 346.3 303 336.1L255.1 289.9L208.1 336.1C199.6 346.3 184.4 346.3 175 336.1C165.7 327.6 165.7 312.4 175 303L222.1 255.1L175 208.1C165.7 199.6 165.7 184.4 175 175V175zM0 96C0 60.65 28.65 32 64 32H448C483.3 32 512 60.65 512 96V416C512 451.3 483.3 480 448 480H64C28.65 480 0 451.3 0 416V96zM48 96V416C48 424.8 55.16 432 64 432H448C456.8 432 464 424.8 464 416V96C464 87.16 456.8 80 448 80H64C55.16 80 48 87.16 48 96z"
                                    fill="gray"
                                  />
                                </svg>
                              </motion.div>
                              <motion.div
                                className={cls(boxColorOnOff ? "hidden" : "")}
                              >
                                <Input
                                  label=""
                                  name="boxColor"
                                  type="color"
                                  placeholder="boxColor"
                                  required
                                  register={registerEditBriz(
                                    "editBriz.text.boxColor"
                                  )}
                                />
                              </motion.div>
                            </motion.div>
                          </motion.div>
                        </motion.div>
                        <motion.div className="flex flex-col items-center justify-end">
                          <motion.div className="mb-1 flex flex-row rounded-lg border border-gray-300 px-2 py-1">
                            <motion.div
                              className={cls(
                                "mr-1",
                                textBold === "700"
                                  ? " rounded-md bg-red-300"
                                  : "",
                                textBold === "900"
                                  ? "rounded-md bg-red-400"
                                  : ""
                              )}
                              onClick={() => {
                                if (textBold === "500") {
                                  setTextBold("700");
                                } else if (textBold === "700") {
                                  setTextBold("900");
                                } else if (textBold === "900") {
                                  setTextBold("500");
                                }
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="-120 -60 625 625"
                              >
                                <path d="M0 64C0 46.3 14.3 32 32 32H80 96 224c70.7 0 128 57.3 128 128c0 31.3-11.3 60.1-30 82.3c37.1 22.4 62 63.1 62 109.7c0 70.7-57.3 128-128 128H96 80 32c-17.7 0-32-14.3-32-32s14.3-32 32-32H48V256 96H32C14.3 96 0 81.7 0 64zM224 224c35.3 0 64-28.7 64-64s-28.7-64-64-64H112V224H224zM112 288V416H256c35.3 0 64-28.7 64-64s-28.7-64-64-64H224 112z" />
                              </svg>
                            </motion.div>
                            <motion.div
                              className={cls(
                                textItalic ? " rounded-md bg-red-300" : ""
                              )}
                              onClick={() => {
                                setTextItalic((prev) => !prev);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="-120 -60 625 625"
                              >
                                <path d="M128 64c0-17.7 14.3-32 32-32H352c17.7 0 32 14.3 32 32s-14.3 32-32 32H293.3L160 416h64c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H90.7L224 96H160c-17.7 0-32-14.3-32-32z" />
                              </svg>
                            </motion.div>
                          </motion.div>
                          <motion.div className="mb-1 flex flex-row rounded-lg border border-gray-300 px-2 py-1">
                            <motion.div
                              className={cls(
                                "mr-1",
                                textRowAlign === "left"
                                  ? " rounded-md bg-red-300"
                                  : ""
                              )}
                              onClick={() => {
                                setTextRowAlign("left");
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="-90 -60 625 625"
                              >
                                <path d="M288 64c0 17.7-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32H256c17.7 0 32 14.3 32 32zm0 256c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H256c17.7 0 32 14.3 32 32zM0 192c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
                              </svg>
                            </motion.div>
                            <motion.div
                              className={cls(
                                "mr-1",
                                textRowAlign === "center"
                                  ? " rounded-md bg-red-300"
                                  : ""
                              )}
                              onClick={() => {
                                setTextRowAlign("center");
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="-90 -60 625 625"
                              >
                                <path d="M352 64c0-17.7-14.3-32-32-32H128c-17.7 0-32 14.3-32 32s14.3 32 32 32H320c17.7 0 32-14.3 32-32zm96 128c0-17.7-14.3-32-32-32H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32-14.3 32-32zM0 448c0 17.7 14.3 32 32 32H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H32c-17.7 0-32 14.3-32 32zM352 320c0-17.7-14.3-32-32-32H128c-17.7 0-32 14.3-32 32s14.3 32 32 32H320c17.7 0 32-14.3 32-32z" />
                              </svg>
                            </motion.div>
                            <motion.div
                              className={cls(
                                textRowAlign === "right"
                                  ? " rounded-md bg-red-300"
                                  : ""
                              )}
                              onClick={() => {
                                setTextRowAlign("right");
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="-90 -60 625 625"
                              >
                                <path d="M448 64c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32zm0 256c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32zM0 192c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
                              </svg>
                            </motion.div>
                          </motion.div>
                          <motion.div className="flex flex-row rounded-lg border border-gray-300 px-2 py-1">
                            <motion.div
                              className={cls(
                                "mr-1",
                                textColAlign === "start"
                                  ? " rounded-md bg-red-300"
                                  : ""
                              )}
                              onClick={() => {
                                setTextColAlign("start");
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="-30 -60 625 625"
                              >
                                <path d="M32 96l512 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 32C14.3 32 0 46.3 0 64S14.3 96 32 96zM9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L96 237.3 96 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 41.4 41.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0l-96 96zm320 45.3c12.5 12.5 32.8 12.5 45.3 0L416 237.3 416 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-210.7 41.4 41.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3z" />
                              </svg>
                            </motion.div>
                            <motion.div
                              className={cls(
                                "mr-1",
                                textColAlign === "center"
                                  ? " rounded-md bg-red-300"
                                  : ""
                              )}
                              onClick={() => {
                                setTextColAlign("center");
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="-30 -60 625 625"
                              >
                                <path d="M137.4 502.6c12.5 12.5 32.8 12.5 45.3 0l96-96c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 402.7V288H544c17.7 0 32-14.3 32-32s-14.3-32-32-32H448V109.3l41.4 41.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L384 109.3V224H192 128 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96V402.7L86.6 361.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l96 96zM128 192h64V64c0-17.7-14.3-32-32-32s-32 14.3-32 32V192zM448 320H384V448c0 17.7 14.3 32 32 32s32-14.3 32-32V320z" />
                              </svg>
                            </motion.div>
                            <motion.div
                              className={cls(
                                textColAlign === "end"
                                  ? " rounded-md bg-red-300"
                                  : ""
                              )}
                              onClick={() => {
                                setTextColAlign("end");
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="-30 -60 625 625"
                              >
                                <path d="M544 416L32 416c-17.7 0-32 14.3-32 32s14.3 32 32 32l512 0c17.7 0 32-14.3 32-32s-14.3-32-32-32zm22.6-137.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L480 274.7 480 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 210.7-41.4-41.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0l96-96zm-320-45.3c-12.5-12.5-32.8-12.5-45.3 0L160 274.7 160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 210.7L54.6 233.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0l96-96c12.5-12.5 12.5-32.8 0-45.3z" />
                              </svg>
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <Input
                        label="Description"
                        name="description"
                        type="textarea"
                        placeholder="Write a description"
                        required
                        register={registerEditBriz("editBriz.description")}
                      />
                    )}
                    <Button text={"Edit this Briz"} />
                  </form>
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {openAiOnOff ? (
            <>
              <motion.div
                className="fixed top-0 left-0 z-[200] h-screen w-full bg-gray-500 opacity-0"
                onClick={onOverlayClick}
                exit={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              ></motion.div>
              <motion.div
                className=" absolute  left-0 right-0  z-[201] mx-auto max-w-md rounded-3xl bg-white p-6 pb-8 opacity-0 shadow-lg"
                style={{ top: scrollY.get() + 100 }}
                exit={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-center text-3xl font-bold">
                  Ask Something
                </h3>
                <div className="mt-4 px-4 max-sm:px-0 ">
                  <form
                    className="mx-auto mt-6 flex w-80 flex-col space-y-4  max-sm:w-72 "
                    onSubmit={handleSubmitOpenAi(onSubmitOpenAi)}
                  >
                    <div
                      className={cls(
                        "h-96 w-full rounded-xl border bg-red-100 px-3 py-2 placeholder-gray-400 shadow-sm"
                      )}
                    >
                      <span className="text-md mb-1 block text-center font-bold text-gray-700">
                        Open AI
                      </span>
                      <hr className=" border-t-2 border-white"></hr>
                      <p className="text-md mt-1 mb-1 block text-center font-semibold text-gray-700">
                        {openAI}
                      </p>
                    </div>
                    <Input
                      label="Prompt"
                      name="prompt"
                      type="textarea"
                      placeholder="Write a prompt"
                      required
                      register={registerOpenAi("prompt")}
                    />
                    <Button text={"Ask"} />
                  </form>
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
};

export default Briz;
