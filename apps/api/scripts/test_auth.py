import asyncio
import httpx
from app.core.config import settings

# Base URL - assuming locally running on port 8001 (using same from previous run)
BASE_URL = "http://localhost:8001/api/v1/auth"

async def main():
    # We'll use a unique email for each run or handle conflict
    import time
    email = f"test_user_{int(time.time())}@example.com"
    password = "securepassword123"
    fullName = "Test User"

    async with httpx.AsyncClient() as client:
        print(f"1. Registering user: {email}")
        response = await client.post(f"{BASE_URL}/register", json={
            "email": email,
            "password": password,
            "fullName": fullName
        })
        
        if response.status_code != 201:
            print(f"Registration failed: {response.text}")
            return
        
        user_data = response.json()
        print(f"Registration successful. User ID: {user_data['id']}, Name: {user_data.get('fullName')}")

        print("\n2. Logging in (JSON)")
        response = await client.post(f"{BASE_URL}/login", json={
            "email": email,
            "password": password
        })

        if response.status_code != 200:
            print(f"Login failed: {response.text}")
            return
        
        token_data = response.json()
        access_token = token_data["access_token"]
        print(f"Login successful. Token obtained.")

        print("\n3. Accessing Protected Route (/me)")
        response = await client.get(f"{BASE_URL}/me", headers={
            "Authorization": f"Bearer {access_token}"
        })

        if response.status_code != 200:
            print(f"Access failed: {response.text}")
            return
        
        me_data = response.json()
        print(f"Me endpoint successful. Hello {me_data['email']}, Name: {me_data.get('fullName')}")
        
        if me_data['email'] == email and me_data.get('fullName') == fullName:
            print("\n*** VERIFICATION PASSED ***")
        else:
            print("\n*** VERIFICATION FAILED: Data mismatch ***")

if __name__ == "__main__":
    asyncio.run(main())
