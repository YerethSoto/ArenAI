import * as assignmentRepo from '../repositories/assignmentRepository.js';

export const assignmentService = {
    createAssignment: assignmentRepo.createAssignment,
    getAssignmentById: assignmentRepo.getAssignmentById,
    listBySection: assignmentRepo.listAssignmentsBySection,
    listByProfessor: assignmentRepo.listAssignmentsByProfessor,
    assignToStudent: assignmentRepo.assignToStudent,
    updateCompletion: assignmentRepo.updateAssignmentCompletion,
    getStudentAssignments: assignmentRepo.getStudentAssignments,
};
