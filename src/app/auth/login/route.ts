import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        redirect(`/login?error=${encodeURIComponent('Lütfen e-posta ve şifrenizi girin.')}`)
    }

    const supabase = await createClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
            redirect('/login?error=EmailNotConfirmed')
        }

        redirect('/login?error=InvalidCredentials')
    }

    redirect('/dashboard')
}
