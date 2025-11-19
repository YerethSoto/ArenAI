import { Router } from 'express';
import { z } from 'zod';
import { ApiError } from '../middleware/errorHandler.js';
import { getSectionById } from '../repositories/sectionRepository.js';
import { listStudentsBySection } from '../repositories/studentRepository.js';
import { parseNumeric } from '../utils/transformers.js';

const router = Router();

router.get('/:sectionId/students', async (req, res, next) => {
  const paramsSchema = z.object({ sectionId: z.coerce.number().int().positive() });

  try {
    const { sectionId } = paramsSchema.parse(req.params);

    const section = await getSectionById(sectionId);
    if (!section) {
      throw new ApiError(404, 'Section not found');
    }

    const students = await listStudentsBySection(sectionId);

    res.json(
      students.map((student) => ({
        id: student.id_user,
        username: student.username,
        name: student.name,
        lastName: student.last_name,
        email: student.email,
        phoneNumber: student.phone_number,
        guardianEmail: student.email_guardian,
        scoreAverage: parseNumeric(student.score_average),
        roleInSection: student.role_in_section,
      }))
    );
  } catch (error) {
    next(error);
  }
});

export const sectionsRouter = router;
