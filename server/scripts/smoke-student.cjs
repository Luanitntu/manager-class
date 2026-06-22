const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api/v1';
const identifier = process.env.SMOKE_STUDENT_EMAIL || 'student@schedule-teacher.local';
const password = process.env.SMOKE_STUDENT_PASSWORD || 'admin123!';

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
  console.log(`Student smoke against ${API_BASE_URL}`);

  const login = await request('/auth/login', null, {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
  assert(login.response.ok, 'student login succeeds', login.payload?.message || login.response.statusText);
  const token = login.data?.accessToken;
  if (!token) throw new Error('Login did not return accessToken');

  const me = await request('/auth/me', token);
  assert(me.data?.role === 'STUDENT', '/auth/me returns STUDENT', JSON.stringify(me.data));

  const dashboard = await request('/dashboard', token);
  assert(dashboard.data?.role === 'STUDENT', '/dashboard is student-scoped', JSON.stringify(dashboard.data));
  assert(Array.isArray(dashboard.data?.upcomingSessions), '/dashboard includes upcoming sessions');

  const classes = await request('/classes', token);
  assert(classes.response.ok, '/classes is readable');
  assert(JSON.stringify(classes.data).includes('Japanese N5'), '/classes includes Japanese N5');

  const documents = await request('/documents', token);
  assert(documents.response.ok, '/documents is readable');
  assert(JSON.stringify(documents.data).includes('N5 Vocabulary Practice'), '/documents includes seeded material');

  const scores = await request('/students/me/scores', token);
  assert(scores.response.ok, '/students/me/scores is readable');
  assert(JSON.stringify(scores.data).includes('Vocabulary quiz'), '/students/me/scores includes seeded score');

  const comments = await request('/students/me/comments', token);
  assert(comments.response.ok, '/students/me/comments is readable');
  assert(JSON.stringify(comments.data).includes('Good improvement'), '/students/me/comments includes seeded comment');

  const tuitions = await request('/payments/tuitions', token);
  assert(tuitions.response.ok, '/payments/tuitions is readable');
  const tuition = Array.isArray(tuitions.data) ? tuitions.data[0] : null;
  assert(Boolean(tuition?.id), '/payments/tuitions includes a tuition row');
  if (tuition?.id) {
    const tuitionDetail = await request(`/payments/tuitions/${tuition.id}`, token);
    assert(tuitionDetail.response.ok, '/payments/tuitions/:id is readable');
    assert(
      JSON.stringify(tuitionDetail.data).includes('SMOKE-STUDENT-001'),
      '/payments/tuitions/:id includes receipt SMOKE-STUDENT-001',
    );
  }

  const students = await request('/students', token);
  assert(students.response.status === 403, '/students is forbidden for student', `status ${students.response.status}`);

  if (failures > 0) process.exit(1);
}

main().catch((error) => {
  fail('student smoke crashed', error.message);
  process.exit(1);
});
