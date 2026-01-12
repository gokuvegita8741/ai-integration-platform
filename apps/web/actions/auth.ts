"use server";

async function registerUser(formData: FormData) {
    const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

    const email = formData.get("email");
    const password = formData.get("password");
    const fullName = formData.get("fullName");

    if (!email || !password || !fullName) {
        throw new Error("All fields are required");
    }

    try {
        const res = await fetch(`${backendUrl}/api/v1/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
                fullName,
            }),
            cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.detail || "Registration failed");
        }

        return {
            success: true,
            user: data,
        };
    } catch (error) {
        console.log(error);
        throw new Error("Registration failed");
    }
}

export {
    registerUser
}