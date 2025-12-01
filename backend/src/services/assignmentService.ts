import * as assignmentRepo from '../repositories/assignmentRepository.js';

export const assignmentService = {
    createAssignment: assignmentRepo.createAssignment,
    getAssignmentById: assignmentRepo.getAssignmentById,
    listBySection: assignmentRepo.listAssignmentsBySection,
    assignToStudent: assignmentRepo.assignToStudent,
    updateCompletion: assignmentRepo.updateAssignmentCompletion,
    getStudentAssignments: assignmentRepo.getStudentAssignments,
};
