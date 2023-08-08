package com.talkids.backend.group.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.talkids.backend.meeting.entity.MeetingSchedule;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="Groups")
@Builder
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="groupId")
    private Integer groupId;

    @Column(name="groupName", nullable = false, length = 45)
    private String groupName;

    @Column(name="groupImage", columnDefinition = "LONGTEXT")
    private String groupImage;

    /* ---------------------------------- */

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "group")
    @JsonManagedReference
    private List<GroupJoinMember> groupJoinMember = new ArrayList<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "group")
    @JsonManagedReference
    private List<MeetingSchedule> meetingSchedules = new ArrayList<>();


    /* ---------------------------------- */

    @Column(name="createdAt", updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;
}
