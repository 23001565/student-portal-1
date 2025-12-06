export async function uploadGrades(formData) {
  // Stub endpoint - replace with real API
  const res = await fetch('/api/admin/grades/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload điểm thất bại');
  return res.json();
}

export async function validateGradesMapping(mapping) {
  // Optional validation step for mapping columns
  const res = await fetch('/api/admin/grades/validate-mapping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapping),
  });
  if (!res.ok) throw new Error('Xác thực mapping thất bại');
  return res.json();
}
