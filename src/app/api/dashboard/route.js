import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');

    if (!studentId) {
      return Response.json({ success: false, error: 'student_id is required.' }, { status: 400 });
    }

    const feesResult = await pool.query('SELECT get_outstanding_fees() AS data');
    const allFees = feesResult.rows[0].data;
    const studentFees = allFees.find((f) => f.student_id === studentId) || null;

    // Full course catalog with lecturer, TA(s), and whether this student is enrolled
    const catalogResult = await pool.query(
      `SELECT
         c.course_id,
         c.course_title,
         lc.semester,
         l.first_name || ' ' || l.last_name AS lecturer_name,
         string_agg(DISTINCT t.first_name || ' ' || t.last_name, ', ') AS ta_names,
         EXISTS (
           SELECT 1 FROM enrollment e
           WHERE e.student_id = $1 AND e.course_id = c.course_id AND e.semester = lc.semester
         ) AS enrolled
       FROM course c
       JOIN lecturer_course lc ON lc.course_id = c.course_id
       JOIN lecturer l ON l.lecturer_id = lc.lecturer_id
       LEFT JOIN lecturer_ta lt ON lt.lecturer_id = lc.lecturer_id
         AND lt.course_id = c.course_id AND lt.semester = lc.semester
       LEFT JOIN ta t ON t.ta_id = lt.ta_id
       GROUP BY c.course_id, c.course_title, lc.semester, l.first_name, l.last_name
       ORDER BY lc.semester, c.course_id`,
      [studentId]
    );

    return Response.json({
      success: true,
      fees: studentFees,
      catalog: catalogResult.rows,
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}