export const loginWithFacebook = (projectId: number) => {
    localStorage.setItem('selectedProjectId', String(projectId))

    const scope = [
        'email',
        'pages_manage_posts',
        'pages_manage_engagement',
        'pages_manage_metadata',
        'pages_read_engagement',
        'pages_show_list',
        'pages_messaging',
        'pages_manage_ads',
        'public_profile',
        'read_insights',
        'business_management',
        'ads_read',
        'ads_management',
    ].join(',')

    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
    const redirectUri = process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI

    if (!appId || !redirectUri) {
        console.error('Variáveis de ambiente do Facebook não definidas.')
        return
    }

    window.location.href = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`
}
