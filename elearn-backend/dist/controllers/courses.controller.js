import { AppError } from '../utils/AppError.js';
import { created, ok } from '../utils/response.js';
import { createCourse as createCourseService, getCourseById as getCourseByIdService, getMyCourses as getMyCoursesService, getPublishedCourses as getPublishedCoursesService, updateCourse as updateCourseService, getEnrolledCourses as getEnrolledCoursesService } from '../services/courses.service.js';
function normalizeParam(param) {
    return Array.isArray(param) ? param[0] : param;
}
export async function createCourse(req, res) {
    const user = req.user;
    if (!user) {
        throw AppError.unauthorized('Unauthorized');
    }
    const body = req.body;
    const course = await createCourseService({ id: user.id, role: user.role }, body);
    return created(res, course);
}
export async function getCourseById(req, res) {
    const course = await getCourseByIdService(normalizeParam(req.params.id), req.user ? { id: req.user.id, role: req.user.role } : null);
    return ok(res, course);
}
export async function getMyCourses(req, res) {
    const user = req.user;
    if (!user) {
        throw AppError.unauthorized('Unauthorized');
    }
    const courses = await getMyCoursesService({ id: user.id, role: user.role });
    return ok(res, courses);
}
export async function getPublishedCourses(req, res) {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
    const courses = await getPublishedCoursesService({ search, categoryId });
    return ok(res, courses);
}
export async function updateCourse(req, res) {
    const user = req.user;
    if (!user) {
        throw AppError.unauthorized('Unauthorized');
    }
    const body = req.body;
    const updatedCourse = await updateCourseService({ id: user.id, role: user.role }, normalizeParam(req.params.id), body);
    return ok(res, updatedCourse);
}
export async function getEnrolledCourses(req, res) {
    const user = req.user;
    if (!user) {
        throw AppError.unauthorized('Unauthorized');
    }
    const courses = await getEnrolledCoursesService(user.id);
    return ok(res, courses);
}
