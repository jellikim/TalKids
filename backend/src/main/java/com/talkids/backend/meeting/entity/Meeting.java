package com.talkids.backend.meeting.entity;

import com.talkids.backend.group.entity.Group;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="Meeting")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="meetingId")
    private int meetingId;

    @Column(name="meetingStart")
    private LocalDateTime meetingStart;

    @Column(name="meetingEnd")
    private LocalDateTime meetingEnd;

    /* ---------------------------------- */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="groupReq")
    private Group groupReq;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="groupRes")
    private Group groupRes;

}