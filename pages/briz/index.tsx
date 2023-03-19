import type { NextPage } from "next";
import { gql, useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { isLoggedInVar } from "@/libs/apolloClient";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { LOCALSTORAGE_TOKEN } from "@/src/constants";
import Layout from "@/components/layout";
import { AnimatePresence, useScroll, motion } from "framer-motion";
import Button from "@/components/button";
import Input from "@/components/input";
import { useForm } from "react-hook-form";
import { cls } from "@/libs/utils";

import Image from "next/image";
import ThreeDotsWave from "@/components/loading";
import {
  CreateBrizOutput,
  DeleteBrizOutput,
  EditBrizOutput,
  GetBrizOutput,
} from "@/src/gql/graphql";

const ME_QUERY = gql`
  query meQuery {
    me {
      id
      email
      username
      verified
    }
  }
`;

const BRIZ_QUERY = gql`
  query gridQuery($getBrizInput: GetBrizInput!) {
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
};

interface meQuery {
  me: meQueryList;
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
  description?: string;
  metatags?: string;
  grid?: IGrid;
}

interface EditBrizForm {
  editBriz: EditBrizInputForm;
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

interface deleteBrizMutation {
  deleteBriz: DeleteBrizOutput;
}

interface getBrizQuery {
  getBriz: GetBrizOutput;
}

const Briz: NextPage = () => {
  const { scrollY } = useScroll();
  const longPressTimeOut = useRef<number>();
  const [gridRowNumber, setGridRowNumber] = useState<number>(14);
  const baseGrid = [...Array(gridRowNumber * 24)];
  const router = useRouter();
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [grid, setGrid] = useState<IGrid>({});
  const [dragIndex, setDragIndex] = useState<IDragIndex>({});
  const [brizText, setBrizText] = useState<string>();
  const [brizLongPressed, setBrizLongPressed] = useState<EditBrizInputForm>();
  const [brizMouseOn, setBrizMouseOn] = useState<number>();
  const [brizClicked, setBrizClicked] = useState<boolean>();
  const [editClicked, setEditClicked] = useState<number>();
  const [dragged, setDragged] = useState<boolean>(false);
  const [gridOnOff, setGridOnOff] = useState<boolean>(false);
  const [brizLoading, setBrizLoading] = useState<boolean>(false);
  const [openAiOnOff, setOpenAiOnOff] = useState<boolean>(false);
  const [inputToggle, setInputToggle] = useState<boolean>(false);
  const [openAI, setOpenAI] = useState("Hello! What do you want to know?");
  const {
    data: meData,
    loading: meLoading,
    error: meQuery,
  } = useQuery<meQuery>(ME_QUERY);
  const {
    data: getBrizData,
    loading: getBrizLoading,
    error: getBrizError,
    refetch: getBrizRefetch,
  } = useQuery<getBrizQuery>(BRIZ_QUERY, { variables: { getBrizInput: {} } });
  useEffect(() => {
    if (
      !getBrizError &&
      !getBrizLoading &&
      getBrizData?.getBriz.getBriz.length !== 0
    ) {
      const gridRow: Array<number> = [];
      getBrizData?.getBriz.getBriz.map((briz, i) => {
        gridRow.push(briz.grid.rowEnd);
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
      reset();
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
      resetEditBriz();
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
      return getBrizRefetch();
    },
  });
  const onOverlayClick = () => {
    setGrid({});
    setDragIndex({});
    setDragged(false);
    setBrizClicked(false);
    setEditClicked(undefined);
    setOpenAiOnOff(false);
    setOpenAI("Hello! What do you want to know?");
  };

  const onClickDelete = async (brizId: number) => {
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
    setDragged(false);
    setGridOnOff(false);
    setBrizLoading(true);
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
      text.fontSize = 1;
      text.italic = true;
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
            grid: grid,
          },
        },
      });
    }
  };

  const onSubmitEdit = async (data: EditBrizForm) => {
    if (!meLoading) {
      editBrizMutation({
        variables: {
          editBrizInput: {
            brizId: editClicked,
            title: data.editBriz.title,
            description: data.editBriz.description,
            metatags: data.editBriz.metatags,
          },
        },
      });
    }
    setEditClicked(undefined);
  };

  const onSubmitGridEdit = async (brizId: number) => {
    if (!meLoading) {
      editBrizMutation({
        variables: {
          editBrizInput: {
            brizId,
            grid: grid,
          },
        },
      });
    }
    setEditClicked(undefined);
  };

  const onSubmitOpenAi = async (data: OpenAiForm) => {
    const prompt = data.prompt;
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
    ).json();
    setOpenAI(openAi);
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
    return <div>Loading</div>;
  }

  return (
    <Layout title={`Briz`} hasTabBar>
      <motion.div className="h-auto w-full py-20 ">
        <motion.div className="relative mx-auto mt-0 h-auto max-w-7xl">
          <AnimatePresence>
            {!brizLongPressed ? (
              <motion.div
                className="fixed bottom-16 left-1/2 z-[102] flex flex-row items-center justify-center rounded-2xl bg-white p-2 shadow-2xl"
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
                className="fixed bottom-16 left-1/2 z-[102] flex flex-row items-center justify-center rounded-2xl bg-white p-2 shadow-2xl"
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
                <button
                  onClick={() => {
                    setEditClicked(brizLongPressed.id);
                    setValueEditBriz("editBriz", {
                      title: brizLongPressed.title,
                      description: brizLongPressed.description,
                      metatags: brizLongPressed.metatags,
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
          <AnimatePresence>
            {gridOnOff && !brizLoading ? (
              <div className="absolute left-1/2 z-[101] grid w-11/12 -translate-x-1/2 grid-cols-[repeat(24,_1fr)] ">
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
                        onSubmitGridEdit(brizLongPressed.id!);
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
            className="absolute left-1/2 z-[100] grid w-11/12 -translate-x-1/2 grid-cols-[repeat(24,_1fr)]"
            style={{ gridTemplateRows: `repeat(${gridRowNumber},1fr)` }}
          >
            <>
              {baseGrid.map((id, i) => (
                <motion.div
                  key={i}
                  className="z-[-10000] aspect-square w-full"
                ></motion.div>
              ))}
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
                      hoverBox: { scale: 1.03, zIndex: 101 },
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                    className={cls(
                      `relative m-1 flex items-center justify-center object-scale-down`
                    )}
                    style={{
                      gridColumn: `${briz.grid.colStart}/${briz.grid.colEnd}`,
                      gridRow: `${briz.grid.rowStart}/${briz.grid.rowEnd}`,
                    }}
                    onMouseDown={() => {
                      longPressTimeOut.current = window.setTimeout(() => {
                        setBrizLongPressed({
                          id: briz.id,
                          title: briz.title,
                          metatags: briz.metatags,
                          description: briz.description,
                        });
                        setGridOnOff(true);
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
                            className="flex h-full w-full flex-col"
                            style={{
                              fontSize: "clamp(1px,3.2vw,2.6rem)",
                              color: briz.text.textColor,
                              backgroundColor: briz.text.boxColor,
                              fontStyle: "italic",
                              fontWeight: "900",
                              textAlign: "center",
                              justifyContent: "center",
                            }}
                          >{`${briz.text.text}`}</motion.span>
                        ) : (
                          /*            <motion.span
                          style={{ fontSize: "clamp(1px,3.2vw,2.6rem)" }}
                        >{`${briz.text.text}`}</motion.span> */
                          <motion.span
                            style={{ fontSize: "clamp(1px,3.2vw,2.6rem)" }}
                          >{`${brizText}`}</motion.span>
                        )}
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
              <motion.div
                className="fixed top-0 left-0 z-[102] h-screen w-full bg-gray-500 "
                initial={{ opacity: 0 }}
                onClick={onOverlayClick}
                exit={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              ></motion.div>
              <motion.div
                layout
                className=" absolute left-0 right-0 z-[115] mx-auto max-w-lg rounded-3xl bg-white p-6 pb-8 opacity-0 shadow-lg"
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
                        <motion.div className=" relative my-4 aspect-square w-full overflow-hidden rounded-xl bg-gray-50 shadow-lg">
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
                        <motion.span className="block text-center text-xl font-medium">
                          {briz.description}
                        </motion.span>
                      </motion.div>
                    );
                  }
                })}
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {dragged ? (
            <>
              <motion.div
                className="fixed top-0 left-0 z-[102] h-screen w-full bg-gray-500 opacity-0"
                onClick={onOverlayClick}
                exit={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              ></motion.div>
              <motion.div
                className=" absolute  left-0 right-0  z-[115]  mx-auto max-w-md  rounded-3xl bg-white p-6 pb-8 opacity-0 shadow-lg"
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
                          required={false}
                          register={register("title")}
                        />
                        <Input
                          label="Tags"
                          name="metatags"
                          type="text"
                          placeholder="#add #tags #about #this #briz"
                          required={false}
                          register={register("metatags")}
                        />
                        <Input
                          label="Description"
                          name="description"
                          type="textarea"
                          placeholder="Write a description"
                          required={false}
                          register={register("description")}
                        />
                        <Input
                          label="Font"
                          name="fontSize"
                          type="number"
                          placeholder="fontSize"
                          required={false}
                          register={register("text.fontSize")}
                        />
                        <Input
                          label="Bold"
                          name="bold"
                          type="text"
                          placeholder="bold"
                          required={false}
                          register={register("text.bold")}
                        />
                        <Input
                          label="Italic"
                          name="italic"
                          type="text"
                          placeholder="italic"
                          required={false}
                          register={register("text.italic")}
                        />
                        <Input
                          label="Text Color"
                          name="textColor"
                          type="color"
                          placeholder="textColor"
                          required={false}
                          register={register("text.textColor")}
                        />
                        <Input
                          label="Box Color"
                          name="boxColor"
                          type="color"
                          placeholder="boxColor"
                          required={false}
                          register={register("text.boxColor")}
                        />
                        <Input
                          label="Text Col Align"
                          name="textColAlign"
                          type="text"
                          placeholder="textColAlign"
                          required={false}
                          register={register("text.textColAlign")}
                        />
                        <Input
                          label="Text Row Align"
                          name="textRowAlign"
                          type="text"
                          placeholder="textRowAlign"
                          required={false}
                          register={register("text.textRowAlign")}
                        />
                      </>
                    )}

                    <Button text={"Create a Briz"} />
                  </form>
                </div>
              </motion.div>
            </>
          ) : null}{" "}
        </AnimatePresence>
        <AnimatePresence>
          {editClicked ? (
            <>
              <motion.div
                className="fixed top-0 left-0 z-[102] h-screen w-full bg-gray-500 opacity-0"
                onClick={onOverlayClick}
                exit={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              ></motion.div>
              <motion.div
                className=" absolute  left-0 right-0  z-[115]  mx-auto max-w-md  rounded-3xl bg-white p-6 pb-8 opacity-0 shadow-lg"
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
                    <Input
                      label="Description"
                      name="description"
                      type="textarea"
                      placeholder="Write a description"
                      required
                      register={registerEditBriz("editBriz.description")}
                    />
                    <Button text={"Edit this Briz"} />
                  </form>
                </div>
              </motion.div>
            </>
          ) : null}{" "}
        </AnimatePresence>
        <AnimatePresence>
          {openAiOnOff ? (
            <>
              <motion.div
                className="fixed top-0 left-0 z-[102] h-screen w-full bg-gray-500 opacity-0"
                onClick={onOverlayClick}
                exit={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              ></motion.div>
              <motion.div
                className=" absolute  left-0 right-0  z-[115] mx-auto max-w-md rounded-3xl bg-white p-6 pb-8 opacity-0 shadow-lg"
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
