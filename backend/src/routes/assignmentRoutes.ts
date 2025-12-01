import { Router } from 'express';
import { assignmentService } from '../services/assignmentService.js';

const router = Router();

router.post('/', async (req, res, next) => {
    try {
        const id = await assignmentService.createAssignment(req.body);
        res.status(201).json({ id });
    } catch (err) {
        next(err);
    }
});

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

router.get('/section/:sectionId', async (req, res, next) => {
    try {
        const assignments = await assignmentService.listBySection(Number(req.params.sectionId));
        res.json(assignments);
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

router.get('/student/:studentId', async (req, res, next) => {
    try {
        const assignments = await assignmentService.getStudentAssignments(Number(req.params.studentId));
        res.json(assignments);
    } catch (err) {
        next(err);
    }
});

export default router;
