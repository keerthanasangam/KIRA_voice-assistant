from app.services.kira_agent import generate_call_summary


# --------------------------------------------------
# Sample conversation
# --------------------------------------------------

conversation = [
    {
        "speaker": "caller",
        "content": "Hi, I'm Rahul. I want to talk to Keerthana about an AI project."
    },
    {
        "speaker": "kira",
        "content": "Sure Rahul. Could you tell me a little about the project?"
    },
    {
        "speaker": "caller",
        "content": "It's an AI voice assistant project. You can contact me at rahul@example.com."
    },
    {
        "speaker": "kira",
        "content": "Thank you. Is there a specific deadline or preferred time?"
    },
    {
        "speaker": "caller",
        "content": "It's not extremely urgent, but I'd like her to contact me soon."
    },
    {
        "speaker": "kira",
        "content": "Understood. I'll pass your message to Keerthana."
    }
]


# --------------------------------------------------
# Generate AI summary
# --------------------------------------------------

summary = generate_call_summary(conversation)


# --------------------------------------------------
# Display result
# --------------------------------------------------

print("\n========================================")
print("        KIRA CALL SUMMARY")
print("========================================")

print(f"\nSummary:")
print(summary["summary"])

print(f"\nRequested Action:")
print(summary["requested_action"])

print(f"\nUrgency:")
print(summary["urgency"])

print("\n========================================")