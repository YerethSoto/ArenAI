export async function ask_chat(data) {
    // http://127.0.0.1:8000/ This will be change to a env variable
    let url = `http://127.0.0.1:8000/api/ask_ollama`;
    try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Error. Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}