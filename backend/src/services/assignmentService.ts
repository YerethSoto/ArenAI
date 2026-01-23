import * as assignmentRepo from '../repositories/assignmentRepository.js';

export const assignmentService = {
    createAssignment: assignmentRepo.createAssignment,
    getAssignmentById: assignmentRepo.getAssignmentById,
    listBySection: assignmentRepo.listAssignmentsBySection,
    listByProfessor: assignmentRepo.listAssignmentsByProfessor,
    assignToStudent: assignmentRepo.assignToStudent,
    updateStatus: assignmentRepo.updateAssignmentStatus,
    getStudentAssignments: assignmentRepo.getStudentAssignments,
    deleteAssignment: assignmentRepo.deleteAssignment,
    updateAssignment: assignmentRepo.updateAssignment,
};
