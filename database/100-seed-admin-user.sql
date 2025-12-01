-- Demo data to make sure at least one professor/admin user exists in a fresh DB
-- Password for this account is: ArenAIAdmin123

INSERT INTO institution (name_institution, score_average)
VALUES ('Colegio ArenAI Demo', NULL)
ON DUPLICATE KEY UPDATE score_average = VALUES(score_average);

SET @institution_id := (
  SELECT id_institution
  FROM institution
  WHERE name_institution = 'Colegio ArenAI Demo'
  LIMIT 1
);

INSERT INTO section (section_number, grade, id_institution)
VALUES ('Seccion 9A', '9', @institution_id)
ON DUPLICATE KEY UPDATE grade = VALUES(grade);

SET @section_id := (
  SELECT id_section
  FROM section
  WHERE section_number = 'Seccion 9A' AND id_institution = @institution_id
  LIMIT 1
);

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
)
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  password_hash = VALUES(password_hash),
  name = VALUES(name),
  last_name = VALUES(last_name),
  phone_number = VALUES(phone_number),
  id_institution = VALUES(id_institution),
  role = VALUES(role);

SET @admin_user_id := (
  SELECT id_user
  FROM `user`
  WHERE username = 'admin'
  LIMIT 1
);

INSERT INTO professor_profile (id_user, grade)
VALUES (@admin_user_id, '9')
ON DUPLICATE KEY UPDATE grade = VALUES(grade);

INSERT INTO user_section (id_user, id_section, role_in_section)
VALUES (@admin_user_id, @section_id, 'PROFESOR')
ON DUPLICATE KEY UPDATE role_in_section = VALUES(role_in_section);
