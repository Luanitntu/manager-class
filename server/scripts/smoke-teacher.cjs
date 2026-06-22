const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api/v1';
const identifier = process.env.SMOKE_TEACHER_EMAIL || 'teacher@schedule-teacher.local';
const password = process.env.SMOKE_TEACHER_PASSWORD || 'admin123!';

let failures = 0;

function pass(message) {
  console.log(`PASS ${message}`);
}

function fail(message, detail) {
  failures += 1;
  console.error(`FAIL ${message}${detail ? ` - ${detail}` : ''}`);
}

function unwrap(payload) {
  return payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
}

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  return { response, payload, data: unwrap(payload) };
}

function assert(condition, message, detail) {
  if (condition) pass(message);
  else fail(message, detail);
}

async function main() {
  console.log(`Teacher smoke against ${API_BASE_URL}`);

  const login = await request('/auth/login', null, {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
  assert(login.response.ok, 'teacher login succeeds', login.payload?.message || login.response.statusText);
  const token = login.data?.accessToken;
  if (!token) throw new Error('Login did not return accessToken');

  const me = await request('/auth/me', token);
  assert(me.data?.role === 'TEACHER', '/auth/me returns TEACHER', JSON.stringify(me.data));
  pass('/auth/me is the available profile-equivalent endpoint for smoke coverage');

  const dashboard = await request('/dashboard', token);
  assert(dashboard.data?.role === 'TEACHER', '/dashboard is teacher-scoped', JSON.stringify(dashboard.data));
  assert(Number(dashboard.data?.totalClasses || 0) >= 1, '/dashboard reports seeded class count');

  const classes = await request('/classes', token);
  assert(classes.response.ok, '/classes is readable');
  assert(JSON.stringify(classes.data).includes('Japanese N5'), '/classes includes Japanese N5');

  const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const to = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const sessions = await request(`/sessions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, token);
  assert(sessions.response.ok, '/sessions is readable');
  assert(JSON.stringify(sessions.data).includes('N5 vocabulary review'), '/sessions includes seeded calendar session');

  const students = await request('/students', token);
  assert(students.response.ok, '/students is readable');
  assert(JSON.stringify(students.data).includes('student@schedule-teacher.local'), '/students includes seeded student');

  const documents = await request('/documents', token);
  assert(documents.response.ok, '/documents is readable');
  assert(JSON.stringify(documents.data).includes('N5 Vocabulary Practice'), '/documents includes seeded material');

  const tuitions = await request('/payments/tuitions', token);
  assert(tuitions.response.ok, '/payments/tuitions is readable');
  const tuition = Array.isArray(tuitions.data) ? tuitions.data[0] : null;
  assert(Boolean(tuition?.id), '/payments/tuitions includes a tuition row');
  if (tuition?.id) {
    const tuitionDetail = await request(`/payments/tuitions/${tuition.id}`, token);
    assert(tuitionDetail.response.ok, '/payments/tuitions/:id is readable');
    assert(
      JSON.stringify(tuitionDetail.data).includes('SMOKE-STUDENT-001'),
      '/payments/tuitions/:id includes seeded receipt',
    );
  }

  if (failures > 0) process.exit(1);
}

main().catch((error) => {
  fail('teacher smoke crashed', error.message);
  process.exit(1);
});
