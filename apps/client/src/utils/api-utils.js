export async function handleResponse(requestFunction) {
  try {
    const response = await requestFunction();
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}
