import { Router } from 'express';
import { assignmentService } from '../services/assignmentService.js';

const router = Router();

// Create a new assignment
router.post('/', async (req, res, next) => {
    try {
        console.log('POST /api/assignments - Body:', JSON.stringify(req.body));
        const { title, description, sectionId, professorId, subjectId, dueTime, quizId, winBattleRequirement, minBattleWins } = req.body;
        
        if (!professorId || !sectionId || !subjectId) {
            console.log('Missing required fields:', { professorId, sectionId, subjectId });
            res.status(400).json({ error: 'professorId, sectionId, and subjectId are required' });
            return;
        }
        
        const id = await assignmentService.createAssignment({
            title,
            description,
            sectionId,
            professorId,
            subjectId,
            dueTime,
            quizId,
            winBattleRequirement,
            minBattleWins,
        });
        console.log('Assignment created with ID:', id);
        res.status(201).json({ success: true, id });
    } catch (err: any) {
        console.error('Error creating assignment:', err.message, err.stack);
        next(err);
    }
});

// Get assignments by professor (MUST be before /:id to avoid matching "professor" as an id)
router.get('/professor/:professorId', async (req, res, next) => {
    try {
        console.log('GET /api/assignments/professor/', req.params.professorId);
        const assignments = await assignmentService.listByProfessor(Number(req.params.professorId));
        res.json({ assignments });
    } catch (err: any) {
        console.error('Error listing assignments:', err.message);
        next(err);
    }
});

// Get assignments by section (MUST be before /:id)
router.get('/section/:sectionId', async (req, res, next) => {
    try {
        const assignments = await assignmentService.listBySection(Number(req.params.sectionId));
        res.json(assignments);
    } catch (err) {
        next(err);
    }
});

// Get student assignments (MUST be before /:id)
router.get('/student/:studentId', async (req, res, next) => {
    try {
        const assignments = await assignmentService.getStudentAssignments(Number(req.params.studentId));
        res.json(assignments);
    } catch (err) {
        next(err);
    }
});

// Get single assignment by ID (MUST be AFTER all named routes)
router.get('/:id', async (req, res, next) => {
    try {
        const assignment = await assignmentService.getAssignmentById(Number(req.params.id));
        if (!assignment) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }
        res.json(assignment);
    } catch (err) {
        next(err);
    }
});

router.post('/:id/assign', async (req, res, next) => {
    try {
        const { studentId } = req.body;
        const id = await assignmentService.assignToStudent(Number(req.params.id), studentId);
        res.status(201).json({ id });
    } catch (err) {
        next(err);
    }
});

router.patch('/student/:assignmentStudentId/complete', async (req, res, next) => {
    try {
        const { complete, quizStudentId } = req.body;
        await assignmentService.updateCompletion(Number(req.params.assignmentStudentId), complete, quizStudentId);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

export default router;

