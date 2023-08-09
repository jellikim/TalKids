import { useState, useEffect } from 'react';
import Head from './components/head';
import Body from './components/body';
import List from './components/list';
import { GetMeeting } from 'apis/meetingPageAPIs';
import { useSelector } from "react-redux";


import * as S from '../style';

export default function TeacherMatchPage() {
    // 정보 조회
    const token = useSelector(state => state.user.token);

    const [numOfMeetings, setNumOfMeetings] = useState({});
    const [numOfSchedules, setNumOfSchedules] = useState({});
    const [numOfMySchedules, setNumOfMySchedules] = useState({});

    useEffect(() => {
        GetMeeting(token)
        
    }, [])
    console.log()

    //
    let DATE = new Date();
    const YEAR = DATE.getFullYear();
    const MONTH = DATE.getMonth() + 1;

    const [month, setMonth] = useState(MONTH);
    const [year, setYear] = useState(YEAR);
    const [totalDate, setTotalDate] = useState([]);

    const changeDate = (month) => {
        //이전 날짜
        let PVLastDate = new Date(YEAR, month - 1, 0).getDate();
        let PVLastDay = new Date(YEAR, month - 1, 0).getDay();
        //다음 날짜
        const ThisLasyDay = new Date(YEAR, month, 0).getDay();
        const ThisLasyDate = new Date(YEAR, month, 0).getDate();

        //이전 날짜 만들기
        let PVLD = [];
        if (PVLastDay !== 6) {
            for (let i = 0; i < PVLastDay + 1; i++) {
                PVLD.unshift(PVLastDate - i);
            }
        }
        //다음 날짜 만들기
        let TLD = [];
        for (let i = 1; i < 7 - ThisLasyDay; i++) {
            if (i === 0) {
                return TLD;
            }
            TLD.push(i);
        }

        //현재날짜
        let TD = [];

        TD = [...Array(ThisLasyDate + 1).keys()].slice(1);

        return PVLD.concat(TD, TLD);
    };

    useEffect(() => {
        setTotalDate(changeDate(7));
    }, []);

    useEffect(() => {
        setTotalDate(changeDate(month));
    }, [month]);

    const [today, setToday] = useState(0);

    const goToday = () => {
        let TODAY = new Date().getDate();
        let goMonth = new Date().getMonth() + 1;
        setMonth(goMonth);
        setToday(TODAY);
    };

    return (
        <>
            <S.MatchSection>
                <S.CalendarSection>
                    <Head year={year} month={month} setMonth={setMonth} goToday={goToday} />
                    <Body totalDate={totalDate} today={today} month={month} year={year} />
                </S.CalendarSection>
                <S.ListSection>
                    <List />
                </S.ListSection>
            </S.MatchSection>
        </>
    );
};