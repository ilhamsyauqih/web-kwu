import { supabase } from './supabaseClient';

const SESSION_KEY = 'guest_session_id';

/**
 * Get or create a session ID for the current user
 * @returns {Promise<string>} Session UUID
 */
export async function getOrCreateSession() {
    // Check if session exists in localStorage
    let sessionId = localStorage.getItem(SESSION_KEY);

    if (sessionId) {
        // Verify session exists in database
        const { data, error } = await supabase
            .from('sessions')
            .select('id')
            .eq('id', sessionId)
            .single();

        if (!error && data) {
            // Update last_active
            await supabase
                .from('sessions')
                .update({ last_active: new Date().toISOString() })
                .eq('id', sessionId);

            return sessionId;
        }
    }

    // Create new session
    const { data, error } = await supabase
        .from('sessions')
        .insert([{}])
        .select()
        .single();

    if (error) {
        console.error('Error creating session:', error);
        throw error;
    }

    sessionId = data.id;
    localStorage.setItem(SESSION_KEY, sessionId);

    return sessionId;
}

/**
 * Get the current session ID without creating one
 * @returns {string|null} Session UUID or null
 */
export function getSessionId() {
    return localStorage.getItem(SESSION_KEY);
}

/**
 * Clear the current session
 */
export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}
