package com.talkids.backend.dm.service;

import com.talkids.backend.dm.dto.DmRoomDto;
import com.talkids.backend.dm.dto.DmJoinMemberDto;
import com.talkids.backend.dm.entity.DmJoinMember;
import com.talkids.backend.dm.entity.DmRoom;
import com.talkids.backend.dm.repository.DmJoinMemberRepository;
import com.talkids.backend.dm.repository.DmRoomRepository;
import com.talkids.backend.member.entity.Member;
import com.talkids.backend.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DmRoomServiceImpl implements DmRoomService {

    private final MemberRepository memberRepository;
    private final DmRoomRepository dmRoomRepository;
    private final DmJoinMemberRepository dmJoinMemberRepository;

    private final SimpMessagingTemplate messagingTemplate;

    /** 회원별 채팅방 리스트 조회 */
    @Override
    public List<DmJoinMember> getDmRoomList(int memberId) {
        return dmJoinMemberRepository.findByMember(memberId);
    }

    /** 채팅방 개설 */
    @Transactional
    @Override
    public int createDmRoom(int memberId) throws Exception {

        DmRoom dmRoom = DmRoomDto.Request.saveDmRoomDto();
        dmRoomRepository.save(dmRoom);

        // DmJoinMember 테이블 insert
        dmJoinMemberRepository.save(
                DmJoinMemberDto.Request.saveDmJoinMemberDto(
                        dmRoom,
                        memberRepository.findByMemberId(memberId).get()));

        return dmRoom.getDmRoomId();
    }

    /** 채팅방 입장 */
    @Transactional
    @Override
    public int getDmRoom(DmJoinMemberDto.Request req) {

        DmRoom dmRoom = dmRoomRepository.findByDmRoomId(req.getDmRoomId());
        Member member = memberRepository.findByMemberId(req.getMemberId()).get();

        messagingTemplate.convertAndSend(
            "/sub/dm/room/" + dmRoom.getDmRoomId(),
            member.getMemberName() + "님이 채팅방에 참여하셨습니다."
        );

        // DB에 없으면 insert
        if (dmJoinMemberRepository.findByDmJoinMemberId(req.getMemberId(), req.getDmRoomId()).isEmpty()) {
            dmJoinMemberRepository.save(
                req.saveDmJoinMemberDto(dmRoom, member)
            );
        }
        return dmRoom.getDmRoomId();
    }

    /** 채팅방 퇴장/삭제 */
    @Transactional
    @Override
    public int deleteDmRoom(DmJoinMemberDto.Request req) throws Exception {

        DmRoom dmRoom = dmRoomRepository.findByDmRoomId(req.getDmRoomId());
        Member member = memberRepository.findByMemberId(req.getMemberId()).get();

        // 지워도 되는 부분 !
        messagingTemplate.convertAndSend(
            "/sub/dm/room/" + dmRoom.getDmRoomId(),
            member.getMemberName() + "님이 채팅방에서 퇴장하셨습니다."
        );

        // dmJoinMemberDto에서 사람 정보 지우기
        dmJoinMemberRepository.deleteByDmJoinMemberId(member.getMemberId(), dmRoom.getDmRoomId());

        // 채팅방에 남은 사람없으면 채팅방 지우기 => 메시지가 있을 때 문제 ?
//        if (dmJoinMemberRepository.findByDmRoom(room).size()==0) {
//            dmRoom.setDeletedAt(true);
//        }

        return dmRoom.getDmRoomId();
    }

}
