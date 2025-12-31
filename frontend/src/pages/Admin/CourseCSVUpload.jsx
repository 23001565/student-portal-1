import React, { useState } from 'react';
import { Card, Button, Alert, Form, Spinner } from 'react-bootstrap';
import { uploadCourses } from '../../api/courseApi';

const CourseCSVUpload = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Vui lòng chọn file CSV');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadCourses(formData);
      setResult(res);

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Tải lên CSV thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <Form.Group controlId="courseCsvFile" className="mb-0">
              <Form.Label className="mb-1 fw-semibold">
                Upload danh sách môn học (CSV)
              </Form.Label>
              <Form.Control
                type="file"
                accept=".csv"
                size="sm"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={loading}
              />
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="align-self-end"
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Đang tải...
                </>
              ) : (
                'Upload CSV'
              )}
            </Button>
          </div>
        </Form>

        {/* Error */}
        {error && (
          <Alert variant="danger" className="mt-3 mb-0">
            {error}
          </Alert>
        )}

        {/* Result */}
        {result && (
          <Alert variant="success" className="mt-3 mb-0">
            Đã thêm <strong>{result.inserted}</strong> môn học, cập nhật{' '}
            <strong>{result.updated}</strong> môn học.
            {result.errors?.length > 0 && (
              <>
                <hr className="my-2" />
                <div>
                  <strong>Lỗi ({result.errors.length}):</strong>
                  <ul className="mb-0">
                    {result.errors.slice(0, 5).map((e, i) => (
                      <li key={i}>
                        Dòng {e.row}: {e.message}
                      </li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>…và {result.errors.length - 5} lỗi khác</li>
                    )}
                  </ul>
                </div>
              </>
            )}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default CourseCSVUpload;
