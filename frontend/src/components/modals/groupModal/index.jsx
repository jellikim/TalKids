import { useState, useRef, useEffect } from "react";

import * as S from "./style";

import LongInput1 from "components/inputs/longinput1";
import LongButton1 from "components/buttons/longbutton1";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { TryMakeGroup } from "apis/GroupPageAPIs";
import { useSelector } from "react-redux";
import { TryGetUser } from "apis/GetUserAPIs";
import { useNavigate } from "react-router";

function ImagePreview({ image, deleteFunc }) {
  return (
    <S.ImagePreview draggable>
      <img src={image} alt="preview" />
      <S.ImagePreviewIconWrapper onClick={deleteFunc}>
        <span>x</span>
      </S.ImagePreviewIconWrapper>
    </S.ImagePreview>
  );
}

function GroupModal() {
  const max = 10;
  const [isOpen, setIsOpen] = useState(false);
  const [inputs, setInputs] = useState({
    groupName: "",
    groupImage: "",
  });
  const token = useSelector((state) => state.user.accessToken); // accessToken 가져오기

  const handleGetUser = async () => {
    const result = await TryGetUser(token);
    // console.log(result);
  };

  useEffect(() => {
    handleGetUser();
  }, [isOpen]);

  const onChangeHandler = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value,
    });
  };

  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const uploadBoxRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    const uploadBox = uploadBoxRef.current;
    const input = inputRef.current;

    if (!uploadBox || !input) return;

    const handleFiles = (files) => {
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        const reader = new FileReader();
        reader.onloadend = (e) => {
          const result = e.target.result;
          if (result) {
            setUploadedImages((state) => [...state, result].slice(0, max));
          }
        };
        reader.readAsDataURL(file);
      }
    };

    const changeHandler = (event) => {
      const files = event.target.files;
      handleFiles(files);
    };

    const dropHandler = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const files = event.dataTransfer.files;
      handleFiles(files);
    };

    const dragOverHandler = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    uploadBox.addEventListener("drop", dropHandler);
    uploadBox.addEventListener("dragover", dragOverHandler);
    input.addEventListener("change", changeHandler);

    return () => {
      uploadBox.removeEventListener("drop", dropHandler);
      uploadBox.removeEventListener("dragover", dragOverHandler);
      input.removeEventListener("change", changeHandler);
    };
  }, [max]);

  useEffect(() => {
    const imageJSXs = uploadedImages.map((image, index) => {
      const isDeleteImage = (element) => {
        return element === image;
      };

      const deleteFunc = () => {
        uploadedImages.splice(uploadedImages.findIndex(isDeleteImage), 1);
        setUploadedImages([...uploadedImages]);
      };

      return <ImagePreview image={image} deleteFunc={deleteFunc} key={index} />;
    });
    setPreviewImages(imageJSXs);
  }, [uploadedImages]);

  const buttonClickHandler = (e) => {
    e.preventDefault();

    if (!inputs.groupName) {
      alert("그룹이름을 입력하세요.");

      return;
    }
    TryMakeGroup(inputs.groupName, inputs.groupImage, token);
    refreshPage();
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const openModalHandler = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <S.ModalContainer>
        <S.ModalBtn onClick={openModalHandler}>
          <AddCircleOutlineIcon />
        </S.ModalBtn>
        {isOpen ? (
          <S.ModalBackdrop onClick={openModalHandler}>
            <S.ModalView onClick={(e) => e.stopPropagation()}>
              <LongInput1
                props={{
                  id: "groupName",
                  desc: "Insert groupname",
                  color: "orange",
                  placeholder: "Insert a Group Name",
                  type: "text",
                  value: inputs.groupName,
                  callback: onChangeHandler,
                }}
              />
              <S.ButtonWrapper>
                <LongButton1
                  props={{
                    color: "green",
                    text: "Make a Group",
                    callback: buttonClickHandler,
                  }}
                />
                <LongButton1
                  props={{
                    color: "orange",
                    text: "X",
                    callback: openModalHandler,
                  }}
                />
              </S.ButtonWrapper>
            </S.ModalView>
          </S.ModalBackdrop>
        ) : null}
      </S.ModalContainer>
    </>
  );
}

export default GroupModal;
