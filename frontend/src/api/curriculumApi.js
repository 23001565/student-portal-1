export async function uploadCurriculum(formData) {
  const res = await fetch('/api/admin/curriculum/upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload chương trình học thất bại');
  return res.json();
}

export async function getCurricula() {
  const res = await fetch('/api/admin/curriculum');
  if (!res.ok) throw new Error('Không tải được danh sách CTĐT');
  return res.json();
}
