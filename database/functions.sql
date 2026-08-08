INSERT INTO enrollment (student_id, course_id, semester)
SELECT s.student_id, lc.course_id, lc.semester
FROM student s
CROSS JOIN (SELECT DISTINCT course_id, semester FROM lecturer_course) lc;

SELECT setseed(0.42);

INSERT INTO student_fees (student_id, semester, amount_billed, amount_paid)
SELECT
    s.student_id,
    '2025/2026',
    5000.00,
    ROUND((5000.00 * (0.1 + random() * 0.9))::numeric, 2)
FROM student s;

CREATE OR REPLACE FUNCTION get_outstanding_fees()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'student_id', sub.student_id,
            'first_name', sub.first_name,
            'last_name', sub.last_name,
            'total_billed', sub.total_billed,
            'total_paid', sub.total_paid,
            'outstanding_balance', sub.outstanding_balance
        )
    ) INTO result
    FROM (
        SELECT
            s.student_id,
            s.first_name,
            s.last_name,
            COALESCE(SUM(f.amount_billed), 0) AS total_billed,
            COALESCE(SUM(f.amount_paid), 0) AS total_paid,
            COALESCE(SUM(f.amount_billed) - SUM(f.amount_paid), 0) AS outstanding_balance
        FROM student s
        LEFT JOIN student_fees f ON s.student_id = f.student_id
        GROUP BY s.student_id, s.first_name, s.last_name
    ) sub;

    RETURN result;
END;
$$ LANGUAGE plpgsql;
SELECT get_outstanding_fees();
