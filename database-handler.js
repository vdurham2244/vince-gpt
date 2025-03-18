import { createClient } from '@supabase/supabase-js'

class DatabaseHandler {
    constructor(supabaseUrl, supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey)
    }

    async logQuestion(question, response) {
        try {
            const { data, error } = await this.supabase
                .from('chatlogs')
                .insert([
                    {
                        question: question,
                        response: response,
                        created_at: new Date().toISOString()
                    }
                ])

            if (error) {
                console.error('Error logging question:', error)
                return false
            }

            console.log('Question logged successfully:', data)
            return true
        } catch (error) {
            console.error('Error logging question:', error)
            return false
        }
    }

    async getRecentLogs(limit = 10) {
        try {
            const { data, error } = await this.supabase
                .from('chatlogs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit)

            if (error) {
                console.error('Error fetching logs:', error)
                return []
            }

            return data
        } catch (error) {
            console.error('Error fetching logs:', error)
            return []
        }
    }
}

export default DatabaseHandler; 