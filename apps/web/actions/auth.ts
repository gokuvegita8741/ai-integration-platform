"use server";

async function registerUser(formData: FormData) {
    const email = formData.get("email");
    const password = formData.get("password");
    const fullName = formData.get("fullName");

    if (!email || !password || !fullName) {
        throw new Error("All fields are required");
    }

    try {
        const { default: api } = await import('@/lib/api');

        const { data } = await api.post('/api/v1/auth/register', {
            email,
            password,
            fullName,
        });

        return {
            success: true,
            user: data,
        };
    } catch (error: any) {
        console.log(error);
        // Return the actual error message from the server
        throw new Error(error.message || 'Registration failed');
    }
}

export {
    registerUser
}