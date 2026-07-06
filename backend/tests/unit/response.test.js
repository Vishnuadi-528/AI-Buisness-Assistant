'use strict';

const { ok, created, badRequest, unauthorized, notFound, serverError } = require('../../src/utils/response');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

describe('response helpers', () => {
  test('ok returns 200 with success:true', () => {
    const res = mockRes();
    ok(res, { id: 1 }, 'Done');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: 'Done', data: { id: 1 } })
    );
  });

  test('created returns 201', () => {
    const res = mockRes();
    created(res, { id: 2 });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('badRequest returns 400 with errors array', () => {
    const res = mockRes();
    const errors = [{ field: 'email', message: 'required' }];
    badRequest(res, 'Validation failed.', errors);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, errors })
    );
  });

  test('unauthorized returns 401', () => {
    const res = mockRes();
    unauthorized(res, 'Not allowed.');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Not allowed.' })
    );
  });

  test('notFound returns 404', () => {
    const res = mockRes();
    notFound(res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('serverError returns 500', () => {
    const res = mockRes();
    serverError(res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});
