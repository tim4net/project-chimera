#!/bin/bash
# Verify that the directories were created
if [ ! -d "/srv/nuaibria/frontend/src/pages" ]; then
    echo "Error: /srv/nuaibria/frontend/src/pages directory not found."
    exit 1
fi
if [ ! -d "/srv/nuaibria/frontend/src/contexts" ]; then
    echo "Error: /srv/nuaibria/frontend/src/contexts directory not found."
    exit 1
fi
# Verify that the files were created
if [ ! -f "/srv/nuaibria/frontend/src/pages/LoginPage.tsx" ]; then
    echo "Error: /srv/nuaibria/frontend/src/pages/LoginPage.tsx not found."
    exit 1
fi
if [ ! -f "/srv/nuaibria/frontend/src/pages/SignupPage.tsx" ]; then
    echo "Error: /srv/nuaibria/frontend/src/pages/SignupPage.tsx not found."
    exit 1
fi
if [ ! -f "/srv/nuaibria/frontend/src/pages/ProfilePage.tsx" ]; then
    echo "Error: /srv/nuaibria/frontend/src/pages/ProfilePage.tsx not found."
    exit 1
fi
if [ ! -f "/srv/nuaibria/frontend/src/contexts/AuthProvider.tsx" ]; then
    echo "Error: /srv/nuaibria/frontend/src/contexts/AuthProvider.tsx not found."
    exit 1
fi
if [ ! -f "/srv/nuaibria/frontend/src/lib/supabaseClient.ts" ]; then
    echo "Error: /srv/nuaibria/frontend/src/lib/supabaseClient.ts not found."
    exit 1
fi
echo "All files and directories verified successfully."
exit 0
