import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

import * as S from "./style";

import { TrySignin } from "apis/UserAPIs";
import { signinUser } from "redux/slice/userSlice";

import TALKIDS from "assets/images/TALKIDS.png";
import LongInput1 from "components/inputs/longinput1";
import LongButton1 from "components/buttons/longbutton1";
import { Link } from "react-router-dom";

export default function SigninPage() {
    // redux 관련
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 사용자 입력 관련
    // 사용자 입력 값 저장
    const [inputs, setInputs] = useState({
        id: "",
        password: "",
    });

    // 사용자 입력 시
    const onChangeHandler = (e) => {
        setInputs({
            ...inputs,
            [e.target.name]: e.target.value,
        });
    };

    const buttonClickHandler = async (e) => {
        e.preventDefault();
        if (!inputs.id) {
            alert("Insert your email.");

            return;
        }

        if (!inputs.password) {
            alert("Insert your Password.");

            return;
        }

        const regex = new RegExp(/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/);

        if (!regex.test(inputs.id)) {
            alert("Invalid E-mail.");

            return;
        }

        try {
            const result = await TrySignin(inputs.id, inputs.password);

            if (!result.success) {
                alert("Check your E-mail or password.")
            } else {
                dispatch(signinUser({
                    "accessToken": result.response.accessToken,
                    "refreshToken": result.response.refreshToken,
                }));

                navigate("/");
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <S.PageHeader>
                <h1>TALKIDS</h1>
            </S.PageHeader>
            <main>
                <S.SigninSection>
                    <S.SigninSectionHeader>
                        <Link to='/'>
                            <h2>Signin Section</h2>
                            <img src={TALKIDS} alt="" />
                        </Link>
                    </S.SigninSectionHeader>
                    <S.SigninForm action="">
                        <LongInput1 props={{ id: "id", desc: "Insert your e-mail", color: "orange", placeholder: "Your E-mail", type: "text", value: inputs.id, callback: onChangeHandler }} />
                        <LongInput1 props={{ id: "password", desc: "Insert your password", color: "blue", placeholder: "Your Password", type: "password", value: inputs.password, callback: onChangeHandler }} />
                        <S.TextWrapper>
                            <p>Don't have an account?</p><Link to='/signup'>Sign up</Link><p>or</p><Link to='/findpassword'>Find Password</Link>
                        </S.TextWrapper>
                        <S.ButtonWrapper>
                            <LongButton1 props={{ color: "green", text: "Sign in", callback: buttonClickHandler }} />
                        </S.ButtonWrapper>
                    </S.SigninForm>
                </S.SigninSection>
            </main>
            <footer></footer>
        </>
    )
}
