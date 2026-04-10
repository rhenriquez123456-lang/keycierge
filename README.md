# Keycierge
Keycierge is a mock credential vault web app with a chat-style interface that helps users generate, store, and retrieve credentials through conversational interaction.

This project is built as a demo / hackathon prototype to explore a more user-friendly way of handling credentials while preserving the idea that passwords should still be meaningful and memorable to the user.

# Core Idea
Many users still prefer “old school” passwords they can remember, but that often comes with security risks. Keycierge is meant to act as an assistant, not a replacement for user responsibility.

It helps users:

1. Generate stronger passwords
2. Store credentials in one secure-looking location
3. Retrieve credentials through a verification step
4. Avoid immediately depending on password resets
5. Interact with their vault in a more natural, conversational way

# MVP Flow
1. User signs into the app
2. User asks Loki to create a credential for a site
3. The app generates a strong password
4. User assigns a retrieval phrase
5. The app stores the credential
6. Later, the user asks for the credential
7. The app requires the verification phrase
8. The app returns or copies the password
9. All events are logged

# Features in Mock Version
1. Chat-style UI
2. Credential creation flow
3. Strong password generation
4. Retrieval phrase verification
5. Credential retrieval flow
6. Event logging for vault actions
7. Demo-friendly conversational experience

# Bonus Features to Mention
These are good additions to mention as future-facing ideas, even if they are not fully implemented in the hackathon version:

1. Help users create stronger passwords
2. Create unique verification questions after repeated failed attempts
3. Log failed retrieval attempts
4. Trigger alerts after multiple failed attempts

# Potential Future Features
These are intentionally not part of the hackathon build, but are worth mentioning as future development opportunities:

1. Real AI model integration
2. Real browser autofill
3. Real website login integrations
4. End-to-end production-grade cryptography
5. Multi-device sync

