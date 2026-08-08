import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { student_id, first_name, last_name, email, phone, password } = await request.json();

    if (!student_id || !email || !password) {
      return Response.json({ success: false, error: 'Student ID, email, and password are required.' }, { status: 400 });
    }

    const existing = await pool.query(
      'SELECT student_id, email, phone FROM student WHERE student_id = $1',
      [student_id]
    );

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existing.rows.length > 0) {
      const existingStudent = existing.rows[0];
      const fullyRegistered = existingStudent.email && existingStudent.phone;

      if (fullyRegistered) {
        return Response.json({ success: false, error: 'This student ID is already registered. Please log in instead.' }, { status: 409 });
      }

      // Fill in whatever is still missing (email and/or phone), and set the password
      await pool.query(
        `UPDATE student
         SET email = $1, password_hash = $2, phone = $3, date_registered = NOW()
         WHERE student_id = $4`,
        [email, hashedPassword, phone || null, student_id]
      );

      return Response.json({ success: true, message: 'Registration successful. You can now log in.' });
    } else {
      if (!first_name || !last_name) {
        return Response.json({ success: false, error: 'First and last name are required for new students.' }, { status: 400 });
      }

     await pool.query(
        `INSERT INTO student (student_id, first_name, last_name, email, password_hash, phone, program, level, date_registered)
         VALUES ($1, $2, $3, $4, $5, $6, 'Computer Engineering', 200, NOW())`,
        [student_id, first_name, last_name, email, hashedPassword, phone || null]
      );

      // Automatically bill the new student the standard annual fee
      await pool.query(
        `INSERT INTO student_fees (student_id, semester, amount_billed, amount_paid)
         VALUES ($1, '2025/2026', 5000.00, 0)`,
        [student_id]
      );

      return Response.json({ success: true, message: 'Registration successful. You can now log in.' });
    }
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}