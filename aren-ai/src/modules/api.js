export async function ask_chat(userInput, learningType, level, name) {
    // http://127.0.0.1:8000/ This will be change to a env variable
    let url = `http://127.0.0.1:8000/api/ask_ollama?userinput=${encodeURIComponent(userInput)}&learningType=${encodeURIComponent(learningType)}&level=${encodeURIComponent(level)}&name=${encodeURIComponent(name)}`;
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error('Error:', error);
            throw error;
        });
}