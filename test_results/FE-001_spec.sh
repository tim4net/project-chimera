#!/bin/bash
# Verify that the directories were created
if [ ! -d "/srv/project-chimera/frontend/src/pages" ]; then
    echo "Error: /srv/project-chimera/frontend/src/pages directory not found."
    exit 1
fi
if [ ! -d "/srv/project-chimera/frontend/src/contexts" ]; then
    echo "Error: /srv/project-chimera/frontend/src/contexts directory not found."
    exit 1
fi
# Verify that the files were created
if [ ! -f "/srv/project-chimera/frontend/src/pages/LoginPage.tsx" ]; then
    echo "Error: /srv/project-chimera/frontend/src/pages/LoginPage.tsx not found."
    exit 1
fi
if [ ! -f "/srv/project-chimera/frontend/src/pages/SignupPage.tsx" ]; then
    echo "Error: /srv/project-chimera/frontend/src/pages/SignupPage.tsx not found."
    exit 1
fi
if [ ! -f "/srv/project-chimera/frontend/src/pages/ProfilePage.tsx" ]; then
    echo "Error: /srv/project-chimera/frontend/src/pages/ProfilePage.tsx not found."
    exit 1
fi
if [ ! -f "/srv/project-chimera/frontend/src/contexts/AuthProvider.tsx" ]; then
    echo "Error: /srv/project-chimera/frontend/src/contexts/AuthProvider.tsx not found."
    exit 1
fi
if [ ! -f "/srv/project-chimera/frontend/src/lib/supabaseClient.ts" ]; then
    echo "Error: /srv/project-chimera/frontend/src/lib/supabaseClient.ts not found."
    exit 1
fi
echo "All files and directories verified successfully."
exit 0
