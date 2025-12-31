import React, { useState } from 'react';
import { Card, Button, Form, Alert, Spinner } from 'react-bootstrap';

const ClassCSVUpload = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [mapping, setMapping] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Vui lòng chọn file CSV');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const formData = new FormData();
      formData.append('file', file);
      if (mapping) {
        formData.append('mapping', mapping);
      }

      const { uploadClasses } = await import('../../api/classApi');
      const res = await uploadClasses(formData);

      setResult(res);
      onSuccess?.(res);
    } catch (e) {
      setError(e.message || 'Upload CSV thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <strong>Upload lớp học từ CSV</strong>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {result && (
          <Alert variant="success">
            Upload thành công: {result.inserted || 0}  lớp
            , cập nhật {result.updated || 0} lớp
            {result.skipped ? `, bỏ qua ${result.skipped}` : ''}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>File CSV</Form.Label>
            <Form.Control
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Mapping (JSON, tùy chọn)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder='{"courseCode":"course_code","dayOfWeek":"day"}'
              value={mapping}
              onChange={(e) => setMapping(e.target.value)}
            />
            <Form.Text muted>
              Dùng khi header CSV không trùng với field trong hệ thống
            </Form.Text>
          </Form.Group>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" /> Đang upload...
              </>
            ) : (
              'Upload CSV'
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ClassCSVUpload;
