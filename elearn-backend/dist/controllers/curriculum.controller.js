import { AppError } from '../utils/AppError.js';
import { created } from '../utils/response.js';
import { createLecture as createLectureService, createSection as createSectionService } from '../services/courses.service.js';
function normalizeParam(param) {
    return Array.isArray(param) ? param[0] : param;
}
export async function createSection(req, res) {
    const user = req.user;
    if (!user) {
        throw AppError.unauthorized('Unauthorized');
    }
    const body = req.body;
    const section = await createSectionService({ id: user.id, role: user.role }, normalizeParam(req.params.courseId), body);
    return created(res, section);
}
export async function createLecture(req, res) {
    const user = req.user;
    if (!user) {
        throw AppError.unauthorized('Unauthorized');
    }
    const body = req.body;
    const lecture = await createLectureService({ id: user.id, role: user.role }, normalizeParam(req.params.sectionId), body);
    return created(res, lecture);
}
