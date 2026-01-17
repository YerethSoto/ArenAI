create table institution
(
    id_institution   int auto_increment
        primary key,
    name_institution varchar(255)  not null,
    score_average    decimal(5, 2) null,
    constraint name_institution
        unique (name_institution)
);

create table grade_score_average
(
    id_grade_average int auto_increment
        primary key,
    id_institution   int           not null,
    grade            varchar(100)  not null,
    score            decimal(5, 2) null,
    constraint id_institution
        unique (id_institution, grade),
    constraint fk_grade_score_institution
        foreign key (id_institution) references institution (id_institution)
            on delete cascade
);

create table section
(
    id_section     int auto_increment
        primary key,
    section_number varchar(10)  not null,
    grade          varchar(100) not null,
    id_institution int          not null,
    constraint id_institution
        unique (id_institution, section_number),
    constraint fk_section_institution
        foreign key (id_institution) references institution (id_institution)
);

create table subject
(
    id_subject   int auto_increment
        primary key,
    name_subject varchar(255) not null,
    constraint name_subject
        unique (name_subject)
);

create table class
(
    id_class                  int auto_increment
        primary key,
    name_class                varchar(255)  not null,
    id_subject                int           not null,
    id_section                int           not null,
    fecha                     date          null,
    ai_summary                text          null,
    current_questions_summary text          null,
    score_average             decimal(5, 2) null,
    constraint id_subject
        unique (id_subject, id_section, name_class),
    constraint fk_class_section
        foreign key (id_section) references section (id_section),
    constraint fk_class_subject
        foreign key (id_subject) references subject (id_subject)
);

create index idx_class__subject_section
    on class (id_subject, id_section, fecha);

create table topic
(
    id_topic    int auto_increment
        primary key,
    name        varchar(255) not null,
    id_subject  int          not null,
    description text         null,
    constraint id_subject
        unique (id_subject, name),
    constraint fk_topic_subject
        foreign key (id_subject) references subject (id_subject)
);

create table class_topic
(
    id_class_topic int auto_increment
        primary key,
    id_class       int           not null,
    id_topic       int           not null,
    score_average  decimal(5, 2) null,
    constraint id_class
        unique (id_class, id_topic),
    constraint fk_class_topic_class
        foreign key (id_class) references class (id_class)
            on delete cascade,
    constraint fk_class_topic_topic
        foreign key (id_topic) references topic (id_topic)
);

create index idx_class_topic__topic
    on class_topic (id_topic);

create definer = root@`%` trigger trg_enforce_same_subject_ins
    before insert
    on class_topic
    for each row
BEGIN
  DECLARE v_class_subject INT;
  DECLARE v_topic_subject INT;

  SELECT id_subject INTO v_class_subject FROM class WHERE id_class = NEW.id_class;
  SELECT id_subject INTO v_topic_subject FROM topic WHERE id_topic = NEW.id_topic;

  IF v_class_subject IS NULL OR v_topic_subject IS NULL OR v_class_subject <> v_topic_subject THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'class_topic: topic no pertenece a la misma subject que class';
  END IF;
END;

create definer = root@`%` trigger trg_enforce_same_subject_upd
    before update
    on class_topic
    for each row
BEGIN
  DECLARE v_class_subject INT;
  DECLARE v_topic_subject INT;

  SELECT id_subject INTO v_class_subject FROM class WHERE id_class = NEW.id_class;
  SELECT id_subject INTO v_topic_subject FROM topic WHERE id_topic = NEW.id_topic;

  IF v_class_subject IS NULL OR v_topic_subject IS NULL OR v_class_subject <> v_topic_subject THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'class_topic: topic no pertenece a la misma subject que class';
  END IF;
END;

create index idx_topic__subject
    on topic (id_subject);

create table topic_father_son_relation
(
    id_topic_father_son_relation int auto_increment
        primary key,
    id_topic_father              int           not null,
    id_topic_son                 int           not null,
    correlation_coefficient      decimal(5, 2) null,
    constraint fk_topic_relation_father
        foreign key (id_topic_father) references topic (id_topic)
            on delete cascade,
    constraint fk_topic_relation_son
        foreign key (id_topic_son) references topic (id_topic)
            on delete cascade
);

create table topic_resource
(
    id_topic_resource int auto_increment
        primary key,
    id_topic          int           not null,
    resource_source   varchar(1024) not null,
    description       text          null,
    resource_quality  decimal(5, 2) null,
    constraint fk_topic_resource_topic
        foreign key (id_topic) references topic (id_topic)
            on delete cascade
);

create table user
(
    id_user              int auto_increment
        primary key,
    username             varchar(100)     not null,
    email                varchar(255)     null,
    password_hash        varchar(255)     not null,
    name                 varchar(150)     null,
    last_name            varchar(200)     null,
    phone_number         varchar(50)      null,
    id_institution       int              null,
    role                 varchar(30)      null,
    profile_picture_name varchar(50)      null,
    first_login          bit default b'0' not null,
    constraint username
        unique (username),
    constraint fk_user_institution
        foreign key (id_institution) references institution (id_institution)
            on delete set null
);

create table battle_matchmaking
(
    id_matchmaking int auto_increment
        primary key,
    id_user        int                                                                not null,
    id_subject     int                                                                not null,
    id_class       int                                                                not null,
    created_at     timestamp                                default CURRENT_TIMESTAMP null,
    status         enum ('waiting', 'matched', 'cancelled') default 'waiting'         null,
    matched_at     timestamp                                                          null,
    constraint battle_matchmaking_ibfk_1
        foreign key (id_user) references user (id_user),
    constraint battle_matchmaking_ibfk_2
        foreign key (id_subject) references subject (id_subject),
    constraint battle_matchmaking_ibfk_3
        foreign key (id_class) references class (id_class)
);

create index id_class
    on battle_matchmaking (id_class);

create index id_subject
    on battle_matchmaking (id_subject);

create index id_user
    on battle_matchmaking (id_user);

create table battle_minigame
(
    id_battle_minigame int auto_increment
        primary key,
    id_user_1          int                                                  default 100               null,
    id_user_2          int                                                  default 100               null,
    id_class           int                                                                            null,
    user_1_health      int                                                                            null,
    user_2_health      int                                                                            null,
    winner             bit                                                                            null,
    id_subject         int                                                                            null,
    status             enum ('waiting', 'active', 'completed', 'cancelled') default 'waiting'         null,
    created_at         timestamp                                            default CURRENT_TIMESTAMP null,
    started_at         timestamp                                                                      null,
    ended_at           timestamp                                                                      null,
    constraint battle_minigame_ibfk_1
        foreign key (id_subject) references subject (id_subject),
    constraint battle_minigame_ibfk_2
        foreign key (id_user_2) references user (id_user),
    constraint battle_minigame_ibfk_3
        foreign key (id_class) references class (id_class),
    constraint battle_minigame_ibfk_4
        foreign key (id_user_1) references user (id_user)
);

create index id_class
    on battle_minigame (id_class);

create index id_subject
    on battle_minigame (id_subject);

create index id_user_1
    on battle_minigame (id_user_1);

create index id_user_2
    on battle_minigame (id_user_2);

create table battle_minigame_question
(
    id_battle_minigame_question int auto_increment
        primary key,
    id_battle_minigame          int          null,
    id_topic                    int          null,
    question                    varchar(500) null,
    answer1                     varchar(50)  null,
    answer2                     varchar(50)  null,
    answer3                     varchar(50)  null,
    answer4                     varchar(50)  null,
    constraint battle_minigame_question_ibfk_1
        foreign key (id_battle_minigame) references battle_minigame (id_battle_minigame),
    constraint battle_minigame_question_ibfk_2
        foreign key (id_topic) references topic (id_topic)
);

create index id_battle_minigame
    on battle_minigame_question (id_battle_minigame);

create index id_topic
    on battle_minigame_question (id_topic);

create table chat
(
    id_chat    int auto_increment
        primary key,
    id_user_1  int        null,
    id_user_2  int        null,
    friendship tinyint(1) null,
    constraint chat_ibfk_1
        foreign key (id_user_1) references user (id_user),
    constraint chat_ibfk_2
        foreign key (id_user_2) references user (id_user)
);

create index id_user_1
    on chat (id_user_1);

create index id_user_2
    on chat (id_user_2);

create table chatbot
(
    id_chatbot int auto_increment
        primary key,
    id_subject int null,
    id_student int null,
    constraint chatbot_ibfk_1
        foreign key (id_student) references user (id_user),
    constraint chatbot_ibfk_2
        foreign key (id_subject) references subject (id_subject)
);

create index id_student
    on chatbot (id_student);

create index id_subject
    on chatbot (id_subject);

create table chatbot_message
(
    id_chatbot_message int auto_increment
        primary key,
    id_chatbot         int        null,
    date               date       null,
    is_user            tinyint(1) null,
    constraint chatbot_message_ibfk_1
        foreign key (id_chatbot) references chatbot (id_chatbot)
);

create index id_chatbot
    on chatbot_message (id_chatbot);

create table class_student
(
    id_class                int                  not null,
    id_user                 int                  not null,
    ai_summary              text                 null,
    interaction_coefficient decimal(5, 2)        null,
    score_average           decimal(5, 2)        null,
    attendance              tinyint(1) default 0 null,
    primary key (id_class, id_user),
    constraint fk_class_student_class
        foreign key (id_class) references class (id_class)
            on delete cascade,
    constraint fk_class_student_user
        foreign key (id_user) references user (id_user)
            on delete cascade
);

create index idx_class_student__user
    on class_student (id_user);

create definer = root@`%` trigger trg_cs_student_check_ins
    before insert
    on class_student
    for each row
BEGIN
  DECLARE v_count INT DEFAULT 0;
  SELECT COUNT(*) INTO v_count FROM student_profile s WHERE s.id_user = NEW.id_user;
  IF v_count = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El usuario indicado no tiene perfil de estudiante';
  END IF;
END;

create definer = root@`%` trigger trg_cs_student_check_upd
    before update
    on class_student
    for each row
BEGIN
  DECLARE v_count INT DEFAULT 0;
  SELECT COUNT(*) INTO v_count FROM student_profile s WHERE s.id_user = NEW.id_user;
  IF v_count = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El usuario indicado no tiene perfil de estudiante';
  END IF;
END;

create table class_student_topic
(
    id_class   int           not null,
    id_topic   int           not null,
    id_user    int           not null,
    score      decimal(5, 2) null,
    ai_summary text          null,
    primary key (id_class, id_topic, id_user),
    constraint fk_cst_class_student
        foreign key (id_class, id_user) references class_student (id_class, id_user)
            on delete cascade,
    constraint fk_cst_class_topic
        foreign key (id_class, id_topic) references class_topic (id_class, id_topic)
            on delete cascade
);

create index idx_class_student_topic__user
    on class_student_topic (id_user);

create definer = root@`%` trigger trg_cst_student_check_ins
    before insert
    on class_student_topic
    for each row
BEGIN
  DECLARE v_count INT DEFAULT 0;
  SELECT COUNT(*) INTO v_count FROM student_profile s WHERE s.id_user = NEW.id_user;
  IF v_count = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El usuario indicado no tiene perfil de estudiante';
  END IF;
END;

create definer = root@`%` trigger trg_cst_student_check_upd
    before update
    on class_student_topic
    for each row
BEGIN
  DECLARE v_count INT DEFAULT 0;
  SELECT COUNT(*) INTO v_count FROM student_profile s WHERE s.id_user = NEW.id_user;
  IF v_count = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El usuario indicado no tiene perfil de estudiante';
  END IF;
END;

create table message
(
    id_message int auto_increment
        primary key,
    id_chat    int  null,
    id_user    int  null,
    date       date null,
    constraint message_ibfk_1
        foreign key (id_chat) references chat (id_chat),
    constraint message_ibfk_2
        foreign key (id_user) references user (id_user)
);

create index id_chat
    on message (id_chat);

create index id_user
    on message (id_user);

create table professor_profile
(
    id_user int          not null
        primary key,
    grade   varchar(100) null,
    constraint fk_professor_profile_user
        foreign key (id_user) references user (id_user)
            on delete cascade
);

create table quiz
(
    id_quiz      int auto_increment
        primary key,
    id_professor int         null,
    quiz_name    varchar(50) null,
    id_subject   int         not null,
    id_section   int         not null,
    id_class     int         not null,
    constraint quiz_ibfk_1
        foreign key (id_class) references class (id_class),
    constraint quiz_ibfk_2
        foreign key (id_professor) references user (id_user),
    constraint quiz_ibfk_3
        foreign key (id_section) references section (id_section),
    constraint quiz_ibfk_4
        foreign key (id_subject) references subject (id_subject)
);

create table assignment
(
    id_assignment          int auto_increment
        primary key,
    id_section             int      null,
    due_time               date     null,
    id_quiz                int      null,
    win_battle_requirement smallint null,
    id_subject             int      null,
    constraint assignment_ibfk_1
        foreign key (id_subject) references subject (id_subject),
    constraint assignment_ibfk_2
        foreign key (id_quiz) references quiz (id_quiz),
    constraint assignment_ibfk_3
        foreign key (id_section) references section (id_section)
);

create index id_quiz
    on assignment (id_quiz);

create index id_section
    on assignment (id_section);

create index id_subject
    on assignment (id_subject);

create index id_class
    on quiz (id_class);

create index id_professor
    on quiz (id_professor);

create index id_section
    on quiz (id_section);

create index id_subject
    on quiz (id_subject);

create table quiz_question
(
    id_quiz_question int auto_increment
        primary key,
    id_quiz          int          not null,
    id_topic         int          null,
    question         varchar(500) not null,
    answer1          varchar(50)  null,
    answer2          varchar(50)  null,
    answer3          varchar(50)  null,
    answer4          varchar(50)  null,
    constraint quiz_question_ibfk_1
        foreign key (id_quiz) references quiz (id_quiz),
    constraint quiz_question_ibfk_2
        foreign key (id_topic) references topic (id_topic)
);

create index id_quiz
    on quiz_question (id_quiz);

create index id_topic
    on quiz_question (id_topic);

create table quiz_student
(
    id_quiz_student int auto_increment
        primary key,
    id_quiz         int null,
    id_student      int null,
    score           int null,
    constraint quiz_student_ibfk_1
        foreign key (id_quiz) references quiz (id_quiz),
    constraint quiz_student_ibfk_2
        foreign key (id_student) references user (id_user)
);

create table assignment_student
(
    id_assignment_student int auto_increment
        primary key,
    id_assignment         int                  null,
    id_student            int                  null,
    complete              tinyint(1) default 0 null,
    id_quiz_student       int                  null,
    constraint assignment_student_ibfk_1
        foreign key (id_quiz_student) references quiz_student (id_quiz_student),
    constraint assignment_student_ibfk_2
        foreign key (id_student) references user (id_user),
    constraint assignment_student_ibfk_3
        foreign key (id_assignment) references assignment (id_assignment)
);

create index id_assignment
    on assignment_student (id_assignment);

create index id_quiz_student
    on assignment_student (id_quiz_student);

create index id_student
    on assignment_student (id_student);

create table assignment_student_battle
(
    id_assignment_student_battle int auto_increment
        primary key,
    id_assignment_student        int null,
    id_battle_minigame           int null,
    constraint assignment_student_battle_ibfk_1
        foreign key (id_battle_minigame) references battle_minigame (id_battle_minigame),
    constraint assignment_student_battle_ibfk_2
        foreign key (id_assignment_student) references assignment_student (id_assignment)
);

create index id_assignment_student
    on assignment_student_battle (id_assignment_student);

create index id_battle_minigame
    on assignment_student_battle (id_battle_minigame);

create index id_quiz
    on quiz_student (id_quiz);

create index id_student
    on quiz_student (id_student);

create table quiz_topic
(
    id_quiz_topic int auto_increment
        primary key,
    id_quiz       int null,
    id_topic      int null,
    constraint quiz_topic_ibfk_1
        foreign key (id_topic) references topic (id_topic),
    constraint quiz_topic_ibfk_2
        foreign key (id_quiz) references quiz (id_quiz)
);

create index id_quiz
    on quiz_topic (id_quiz);

create index id_topic
    on quiz_topic (id_topic);

create table student_profile
(
    id_user        int           not null
        primary key,
    email_guardian varchar(255)  null,
    score_average  decimal(5, 2) null,
    quiz_streak    int           null,
    constraint fk_student_profile_user
        foreign key (id_user) references user (id_user)
            on delete cascade
);

create table student_topic
(
    id_student_topic int auto_increment
        primary key,
    id_user          int           not null,
    id_topic         int           not null,
    score            decimal(5, 2) null,
    constraint id_user
        unique (id_user, id_topic),
    constraint fk_student_topic_topic
        foreign key (id_topic) references topic (id_topic)
            on delete cascade,
    constraint fk_student_topic_user
        foreign key (id_user) references user (id_user)
            on delete cascade
);


CREATE TABLE IF NOT EXISTS friend_requests (
    id_request INT AUTO_INCREMENT PRIMARY KEY,
    id_sender INT NOT NULL,
    id_receiver INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_fr_sender FOREIGN KEY (id_sender) REFERENCES user(id_user) ON DELETE CASCADE,
    CONSTRAINT fk_fr_receiver FOREIGN KEY (id_receiver) REFERENCES user(id_user) ON DELETE CASCADE,
    UNIQUE KEY unique_request (id_sender, id_receiver)
);


create index idx_student_topic__user
    on student_topic (id_user);

create table user_section
(
    id_user         int         not null,
    id_section      int         not null,
    role_in_section varchar(30) null,
    primary key (id_user, id_section),
    constraint fk_user_section_section
        foreign key (id_section) references section (id_section)
            on delete cascade,
    constraint fk_user_section_user
        foreign key (id_user) references user (id_user)
            on delete cascade
);


