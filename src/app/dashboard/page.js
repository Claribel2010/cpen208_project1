'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyCourse, setBusyCourse] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('student');
    if (!stored) {
      router.push('/login');
      return;
    }
    const studentData = JSON.parse(stored);
    setStudent(studentData);
    fetchDashboardData(studentData.student_id);
  }, []);

  async function fetchDashboardData(studentId) {
    const res = await fetch(`/api/dashboard?student_id=${studentId}`);
    const data = await res.json();
    if (data.success) {
      setFees(data.fees);
      setCatalog(data.catalog);
    }
    setLoading(false);
  }

  async function handleEnroll(course) {
    setBusyCourse(course.course_id + course.semester);
    await fetch('/api/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: student.student_id,
        course_id: course.course_id,
        semester: course.semester,
      }),
    });
    await fetchDashboardData(student.student_id);
    setBusyCourse(null);
  }

  async function handleDrop(course) {
    setBusyCourse(course.course_id + course.semester);
    await fetch('/api/enroll', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: student.student_id,
        course_id: course.course_id,
        semester: course.semester,
      }),
    });
    await fetchDashboardData(student.student_id);
    setBusyCourse(null);
  }

  function handleLogout() {
    localStorage.removeItem('student');
    router.push('/login');
  }

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Loading...
      </div>
    );
  }

  const initials = `${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`.toUpperCase();
  const percentPaid = fees ? Math.min(100, Math.round((fees.total_paid / fees.total_billed) * 100)) : 0;
  const enrolledCourses = catalog.filter((c) => c.enrolled);
  const availableCourses = catalog.filter((c) => !c.enrolled);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-blue-50" />
        <div className="absolute -top-40 -left-20 w-[28rem] h-[28rem] bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-[28rem] h-[28rem] bg-blue-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">
              CPEN Department Portal
            </p>
            <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-600 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold shrink-0">
            {initials || '?'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {student.first_name} {student.last_name}
            </h2>
            <p className="text-sm text-gray-500">{student.email}</p>
            <p className="text-sm text-gray-500">Student ID: {student.student_id}</p>
            {student.phone && <p className="text-sm text-gray-500">Phone: {student.phone}</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
            Fees
          </h2>

          {fees ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total billed</p>
                  <p className="text-lg font-semibold text-gray-900">
                    GHS {Number(fees.total_billed).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total paid</p>
                  <p className="text-lg font-semibold text-gray-900">
                    GHS {Number(fees.total_paid).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Outstanding</p>
                  <p className="text-lg font-semibold text-red-600">
                    GHS {Number(fees.outstanding_balance).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Payment progress</span>
                  <span>{percentPaid}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${percentPaid}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No fee records found.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
            Enrolled Courses
          </h2>

          {enrolledCourses.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {enrolledCourses.map((c) => {
                const key = c.course_id + c.semester;
                const isBusy = busyCourse === key;
                return (
                  <div key={key} className="flex justify-between items-center py-3 gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900">{c.course_id}</p>
                        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {c.semester}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{c.course_title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Lecturer: {c.lecturer_name}
                        {c.ta_names && <> &middot; TA: {c.ta_names}</>}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDrop(c)}
                      disabled={isBusy}
                      className="text-xs font-medium text-red-600 border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-50 transition disabled:opacity-50 whitespace-nowrap"
                    >
                      {isBusy ? '...' : 'Drop'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">You&apos;re not enrolled in any courses yet.</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
            Available Courses
          </h2>

          {availableCourses.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {availableCourses.map((c) => {
                const key = c.course_id + c.semester;
                const isBusy = busyCourse === key;
                return (
                  <div key={key} className="flex justify-between items-center py-3 gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900">{c.course_id}</p>
                        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {c.semester}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{c.course_title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Lecturer: {c.lecturer_name}
                        {c.ta_names && <> &middot; TA: {c.ta_names}</>}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEnroll(c)}
                      disabled={isBusy}
                      className="text-xs font-medium text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-50 transition disabled:opacity-50 whitespace-nowrap"
                    >
                      {isBusy ? '...' : 'Enroll'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">You&apos;re enrolled in every available course.</p>
          )}
        </div>
      </div>
    </div>
  );
}