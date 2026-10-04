from app.services.kira_agent import generate_kira_response


conversation = [
    {
        "speaker": "caller",
        "content": "Hi, I want to talk to Keerthana."
    }
]


response = generate_kira_response(conversation)

print("\nKIRA:")
print(response)