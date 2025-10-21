import ollama

response = ollama.chat(
    model='deepseek-r1:latest',
    
    messages=[

        {'role': 'user', 'content': 'What is the capital of china'}
     


    ],
)

print(response['message'] ['content'])