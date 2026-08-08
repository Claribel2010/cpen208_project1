import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { student_id, course_id, semester } = await request.json();

    if (!student_id || !course_id || !semester) {
      return Response.json({ success: false, error: 'student_id, course_id, and semester are required.' }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO enrollment (student_id, course_id, semester)
       VALUES ($1, $2, $3)
       ON CONFLICT (student_id, course_id, semester) DO NOTHING`,
      [student_id, course_id, semester]
    );

    return Response.json({ success: true, message: 'Enrolled successfully.' });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { student_id, course_id, semester } = await request.json();

    if (!student_id || !course_id || !semester) {
      return Response.json({ success: false, error: 'student_id, course_id, and semester are required.' }, { status: 400 });
    }

    await pool.query(
      `DELETE FROM enrollment WHERE student_id = $1 AND course_id = $2 AND semester = $3`,
      [student_id, course_id, semester]
    );

    return Response.json({ success: true, message: 'Dropped successfully.' });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}