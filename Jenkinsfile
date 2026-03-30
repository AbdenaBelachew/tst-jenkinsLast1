pipeline {
    agent any

    environment {
        SERVER_USER          = 'abdenab'
        SERVER_HOST          = '10.8.101.33'
        SSH_CREDS_ID         = 'linux-ssh-creds'

        FRONTEND_TARGET      = '/var/www/html/myapp'
        BACKEND_TARGET       = '/var/backend'
        BACKEND_PROCESS_NAME = 'my-backend'

        WS_PATH              = "${env.WORKSPACE.replace('\\', '/')}"
    }

    stages {
        stage('Checkout Source') {
            steps {
                git url: 'https://github.com/AbdenaBelachew/tst-jenkinsLast1.git', branch: 'main'
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy Frontend') {
            steps {
                sshagent([env.SSH_CREDS_ID]) {
                    sh """
                    # Prepare remote directory
                    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "
                        sudo mkdir -p ${FRONTEND_TARGET} &&
                        sudo chown -R ${SERVER_USER}:${SERVER_USER} ${FRONTEND_TARGET}
                    "

                    # Sync dist files
                    rsync -avz --delete frontend/dist/ ${SERVER_USER}@${SERVER_HOST}:${FRONTEND_TARGET}/

                    # Fix permissions
                    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "
                        sudo chown -R www-data:www-data ${FRONTEND_TARGET} &&
                        sudo find ${FRONTEND_TARGET} -type d -exec chmod 755 {} \\; &&
                        sudo find ${FRONTEND_TARGET} -type f -exec chmod 644 {} \\;
                    "

                    # Deploy Nginx config for /myapp/
                    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "
                        sudo bash -c 'cat > /etc/nginx/sites-available/myapp.conf <<EOF
server {
    listen 80;
    server_name 10.8.101.33;

    root ${FRONTEND_TARGET};
    index index.html;

    location /myapp/ {
        try_files \$uri /index.html;
    }
}
EOF
                        sudo ln -sf /etc/nginx/sites-available/myapp.conf /etc/nginx/sites-enabled/myapp.conf &&
                        sudo nginx -t &&
                        sudo systemctl reload nginx
                    '
                    "
                    """
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                sshagent([env.SSH_CREDS_ID]) {
                    sh """
                    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "
                        sudo mkdir -p ${BACKEND_TARGET} &&
                        sudo chown -R ${SERVER_USER}:${SERVER_USER} ${BACKEND_TARGET}
                    "

                    rsync -avz --delete --exclude 'node_modules' backend/ ${SERVER_USER}@${SERVER_HOST}:${BACKEND_TARGET}/

                    ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "
                        bash -l -c 'cd ${BACKEND_TARGET} && npm install --omit=dev &&
                        (pm2 restart ${BACKEND_PROCESS_NAME} || pm2 start index.js --name ${BACKEND_PROCESS_NAME})'
                    "
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment successful: Frontend (/myapp) + Backend deployed.'
        }
        failure {
            echo '❌ Deployment failed! Check logs.'
        }
    }
}
