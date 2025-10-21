import ollama
 

def AskOllama(userinput):

    response = ollama.chat(

        model='deepseek-r1:latest',
    
    messages=[

        {'role': 'user', 'content': userinput}
    ],

    )
    print(response['message'] ['content'])

AskOllama(input("Ingresa texto para query: "))

