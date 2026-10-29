export function getErrorMessage(err) {
  const data = err.response?.data

  if (!err.response) {
    return 'Cannot reach the server. Is the backend running?'
  }
  if (data?.message) {
    return data.message
  }
  if (data && typeof data === 'object') {
    return Object.values(data).join('. ')
  }
  return 'Something went wrong. Please try again.'
}