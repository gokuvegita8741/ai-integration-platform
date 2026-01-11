'use server';

export async function login(formData: FormData) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    // This is a placeholder for the actual API call
    console.log('Logging in to:', backendUrl, Object.fromEntries(formData));

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { success: true };
}

export async function register(formData: FormData) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    // This is a placeholder for the actual API call
    console.log('Registering user to:', backendUrl, Object.fromEntries(formData));

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { success: true };
}
