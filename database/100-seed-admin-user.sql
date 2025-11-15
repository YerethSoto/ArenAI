-- Demo data to make sure at least one professor/admin user exists in a fresh DB
-- Password for this account is: ArenAIAdmin123

INSERT INTO institution (name_institution, score_average)
VALUES ('Colegio ArenAI Demo', NULL);

SET @institution_id := LAST_INSERT_ID();

INSERT INTO section (name, grade, id_institution)
VALUES ('Seccion 9A', '9', @institution_id);

SET @section_id := LAST_INSERT_ID();

INSERT INTO `user` (username, email, password_hash, name, last_name, phone_number, id_institution, role)
VALUES (
  'admin',
  'admin@arenai.local',
  '$2a$12$id9Ko2l5kgWZOscWIP1Qs.a7sbafOawGoH.4T/2o82QIEKLb9N2fq',
  'Administrador',
  'Demo',
  '+50670000000',
  @institution_id,
  'ADMIN'
);

SET @admin_user_id := LAST_INSERT_ID();

INSERT INTO professor_profile (id_user, grade)
VALUES (@admin_user_id, '9');

INSERT INTO user_section (id_user, id_section, role_in_section)
VALUES (@admin_user_id, @section_id, 'PROFESOR');
