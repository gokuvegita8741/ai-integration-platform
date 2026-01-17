import requests
import uuid

API_URL = "http://localhost:8001/api/v1"

def test_chat_flow():
    # 1. Register/Login User
    user_email = f"test_chat_{uuid.uuid4().hex[:6]}@example.com"
    user_password = "password123"
    
    print(f"1. Registering/Logging in user: {user_email}")
    
    # Try register first
    reg_response = requests.post(f"{API_URL}/auth/register", json={
        "email": user_email,
        "password": user_password,
        "fullName": "Chat Tester"
    })
    
    if reg_response.status_code == 200:
        token = reg_response.json()["access_token"]
        print("   - Registration successful, got token.")
    else:
        # If already exists (or other error), try login
        print(f"   - Registration returned {reg_response.status_code}, trying login...")
        login_response = requests.post(f"{API_URL}/auth/login", json={
             "email": user_email,
             "password": user_password
        })
        if login_response.status_code == 200:
             token = login_response.json()["access_token"]
             print("   - Login successful, got token.")
        else:
             print(f"   - Login failed: {login_response.text}")
             return

    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Send Chat Message (New Chat)
    print("\n2. Sending Message (Start New Chat)...")
    chat_payload = {
        "message": "Hello! What is the capital of France?",
        "source": "standalone",
        "projectName": "Test Project"
    }
    
    chat_response = requests.post(
        f"{API_URL}/chat/message",
        json=chat_payload,
        headers=headers
    )
    
    if chat_response.status_code != 200:
        print(f"   - Failed: {chat_response.text}")
        return
        
    chat_data = chat_response.json()
    chat_id = chat_data["chatId"]
    assistant_msg = chat_data["message"]["message"]
    print(f"   - Success! ChatID: {chat_id}")
    print(f"   - Assistant Reply: {assistant_msg}")
    
    # 3. Send Follow-up Message (Existing Chat)
    print("\n3. Sending Follow-up Message...")
    followup_payload = {
        "chatId": chat_id,
        "message": "And what is its population?"
    }
    
    followup_response = requests.post(
        f"{API_URL}/chat/message",
        json=followup_payload,
        headers=headers
    )
    
    if followup_response.status_code != 200:
        print(f"   - Failed: {followup_response.text}")
        return

    followup_data = followup_response.json()
    print(f"   - Success! Reply: {followup_data['message']['message']}")
    
    # 4. Multimodal Test (Optional Image)
    print("\n4. Sending Image Message...")
    image_payload = {
        "chatId": chat_id,
        "message": "What is in this image?",
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Eq_it-na_pizza-margherita_sep2005_sml.jpg/440px-Eq_it-na_pizza-margherita_sep2005_sml.jpg"
    }

    image_response = requests.post(
        f"{API_URL}/chat/message",
        json=image_payload,
        headers=headers
    )
    
    if image_response.status_code != 200:
         # It might fail if model does not support image or API key issue
        print(f"   - Failed (Expected if model/key issues): {image_response.text}")
    else:
        print(f"   - Success! Reply: {image_response.json()['message']['message']}")

if __name__ == "__main__":
    test_chat_flow()
