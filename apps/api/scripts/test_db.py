import asyncio
from app.db import prisma

async def main():
    print("Attempting to connect to the database...")
    try:
        await prisma.connect()
        print("Successfully connected to the database.")
        
        try:
             count = await prisma.user.count()
             print(f"User count: {count}")
        except Exception as e:
             print(f"Query failed (tables might be missing or other error): {e}")

        await prisma.disconnect()
    except Exception as e:
        print(f"Failed to connect: {e}")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())
