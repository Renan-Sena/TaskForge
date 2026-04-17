export const successResponse = <T>(data: T, message = 'Success') => ({
  success: true,
  message,
  data,
});

export const errorResponse = (message: string, status = 500) => ({
  success: false,
  error: message,
  status,
});