import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    const result = await pool.query(
      'SELECT student_id, first_name, last_name, email, phone, password_hash FROM student WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return Response.json({ success: false, error: 'No account found with that email.' }, { status: 404 });
    }

    const student = result.rows[0];

    const passwordMatches = await bcrypt.compare(password, student.password_hash);

    if (!passwordMatches) {
      return Response.json({ success: false, error: 'Incorrect password.' }, { status: 401 });
    }

    return Response.json({
      success: true,
      student: {
        student_id: student.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        phone: student.phone,
      },
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}